// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/*
 * QUANTUM CAT CONTROLLER - ERC-20 Architecture (Exchange-Compatible)
 *
 * Three separate ERC-20 tokens:
 *  - CATBOX (superposed state)
 *  - LIVECAT (observed alive)
 *  - DEADCAT (observed dead)
 *
 * Observe:
 *  - commitObserve(amount, dataHash, userEntropy) burns CATBOX, records commitment
 *  - observe(data) after DELAY mints EITHER all LIVECAT OR all DEADCAT (50/50 random)
 *  - forceObserve(owner) finalizes after GRACE if owner disappears
 *
 * Rebox (fee-only sink):
 *  - Burn equal LIVECAT + DEADCAT pairs; mint (2*pairs − feeTokens) CATBOX
 *  - Requires equal amounts: you need 1 LIVECAT + 1 DEADCAT to make 1 CATBOX (minus fee)
 *
 * Security:
 *  - High Entropy RNG: block.timestamp, prevrandao, blockhash, tx.gasprice, tx.origin, msg.sender, gasleft(), userEntropy, contract balance, chainid
 *  - Reentrancy-guarded; state changes before external calls
 *  - ZERO admin control: immutable parameters
 */

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CATBOXToken.sol";
import "./LIVECATToken.sol";
import "./DEADCATToken.sol";

/// @title QuantumCatController - Controls the quantum observation mechanics
/// @author QuantumCat Team
/// @notice Manages commit-reveal observation and rebox mechanics for three ERC-20 tokens
/// @dev Immutable with ZERO admin control - no owner, no pause, no upgrades
contract QuantumCatController is ReentrancyGuard {
    // --- Custom Errors ---

    error PendingObservationExists();
    error NoPendingObservation();
    error InvalidAmount();
    error InsufficientDelay();
    error HashMismatch();
    error DataTooLarge();
    error GracePeriodNotPassed();
    error NoPairsAvailable();
    error PairsOverflow();
    error ZeroAddress();
    error FeeExceedsMaximum();
    error ZeroEntropy();
    error InsufficientBalance();
    error ETHNotAccepted();

    // --- Config Constants ---

    /// @notice Number of blocks to wait before observation can be revealed
    uint8 public constant REVEAL_DELAY = 5;

    /// @notice Additional blocks after reveal delay before force observe is allowed
    uint16 public constant GRACE = 64;

    /// @notice Maximum size of observation data in bytes
    uint16 public constant DATA_MAX = 256;

    /// @notice Maximum basis points (100%)
    uint96 private constant _MAX_BPS = 10_000;

    /// @notice Rebox fee in basis points (immutable)
    uint96 public immutable REBOX_FEE_BPS;

    // --- Token References ---

    /// @notice CATBOX token (superposed)
    CATBOXToken public immutable catbox;

    /// @notice LIVECAT token (observed alive)
    LIVECATToken public immutable livecat;

    /// @notice DEADCAT token (observed dead)
    DEADCATToken public immutable deadcat;

    // --- Pending Observation Storage ---

    struct Pending {
        uint64 refBlock;      // Reference block number
        bool active;          // Whether observation is active
        bytes32 dataHash;     // Committed data hash
        bytes32 userEntropy;  // User-provided entropy
        uint256 amount;       // Amount of CATBOX escrowed
    }

    mapping(address => Pending) public pending;

    // --- Events ---

    event CommitObserve(address indexed owner, uint256 amount, bytes32 dataHash, uint64 refBlock);
    event Observed(address indexed owner, uint256 alive, uint256 dead);
    event Forced(address indexed owner, uint256 alive, uint256 dead);
    event Reboxed(address indexed user, uint256 indexed pairs, uint256 catboxMinted, uint256 feeTokens);

    /// @notice Constructor for immutable controller deployment
    /// @param _catbox Address of CATBOX token contract
    /// @param _livecat Address of LIVECAT token contract
    /// @param _deadcat Address of DEADCAT token contract
    /// @param feeBps Rebox fee in basis points (0-10000, immutable)
    constructor(
        address _catbox,
        address _livecat,
        address _deadcat,
        uint96 feeBps
    ) {
        if (_catbox == address(0)) revert ZeroAddress();
        if (_livecat == address(0)) revert ZeroAddress();
        if (_deadcat == address(0)) revert ZeroAddress();
        if (feeBps > _MAX_BPS) revert FeeExceedsMaximum();

        catbox = CATBOXToken(_catbox);
        livecat = LIVECATToken(_livecat);
        deadcat = DEADCATToken(_deadcat);
        REBOX_FEE_BPS = feeBps;
    }

    /// @notice Prevent accidental ETH transfers
    receive() external payable { revert ETHNotAccepted(); }
    fallback() external payable { revert ETHNotAccepted(); }

    // ========= OBSERVE =========

    /// @notice Burn CATBOX now and commit to observing with future reveal data
    /// @param amount Amount of CATBOX tokens to escrow (must be > 0)
    /// @param dataHash keccak256 hash of the data you'll reveal later
    /// @param userEntropy User-provided 32 bytes of entropy (must be non-zero)
    function commitObserve(uint256 amount, bytes32 dataHash, bytes32 userEntropy)
        external
        nonReentrant
    {
        if (pending[msg.sender].active) revert PendingObservationExists();
        if (amount == 0) revert InvalidAmount();
        if (userEntropy == bytes32(0)) revert ZeroEntropy();
        if (catbox.balanceOf(msg.sender) < amount) revert InsufficientBalance();

        // Burn CATBOX (escrow by burn)
        catbox.burn(msg.sender, amount);

        pending[msg.sender] = Pending({
            refBlock: uint64(block.number),
            active: true,
            dataHash: dataHash,
            userEntropy: userEntropy,
            amount: amount
        });

        emit CommitObserve(msg.sender, amount, dataHash, uint64(block.number));
    }

    /// @notice Finalize your observation by revealing the data you committed to
    /// @param data The exact bytes you hashed in commitObserve
    function observe(bytes calldata data)
        external
        nonReentrant
    {
        Pending memory p = pending[msg.sender];
        if (!p.active) revert NoPendingObservation();
        if (data.length > DATA_MAX) revert DataTooLarge();
        if (block.number <= p.refBlock + REVEAL_DELAY) revert InsufficientDelay();
        if (keccak256(data) != p.dataHash) revert HashMismatch();

        delete pending[msg.sender];

        // Generate high entropy randomness
        bytes32 randomness = _highEntropyRandom(msg.sender, p.refBlock, p.userEntropy);

        (uint256 alive, uint256 dead) = _randomSplit(p.amount, randomness, p.dataHash, p.userEntropy);

        emit Observed(msg.sender, alive, dead);
        
        // Mint LIVECAT and DEADCAT
        if (alive > 0) livecat.mint(msg.sender, alive);
        if (dead > 0) deadcat.mint(msg.sender, dead);
    }

    /// @notice Finalize a stuck observation after grace period (anyone can call)
    /// @param owner Address whose observation to finalize
    function forceObserve(address owner)
        external
        nonReentrant
    {
        Pending memory p = pending[owner];
        if (!p.active) revert NoPendingObservation();
        if (block.number <= p.refBlock + REVEAL_DELAY + GRACE) revert GracePeriodNotPassed();

        delete pending[owner];

        // Generate high entropy randomness
        bytes32 randomness = _highEntropyRandom(owner, p.refBlock, p.userEntropy);

        (uint256 alive, uint256 dead) = _randomSplit(p.amount, randomness, p.dataHash, p.userEntropy);

        emit Forced(owner, alive, dead);
        
        // Mint LIVECAT and DEADCAT to the owner
        if (alive > 0) livecat.mint(owner, alive);
        if (dead > 0) deadcat.mint(owner, dead);
    }

    // ========= REBOX =========

    /// @notice Burn equal LIVECAT & DEADCAT pairs and mint CATBOX (minus fee)
    /// @param pairs Number of pairs to rebox
    function rebox(uint256 pairs)
        external
        nonReentrant
    {
        if (pairs == 0) revert NoPairsAvailable();
        if (pairs > type(uint256).max / 2) revert PairsOverflow();
        if (livecat.balanceOf(msg.sender) < pairs) revert InsufficientBalance();
        if (deadcat.balanceOf(msg.sender) < pairs) revert InsufficientBalance();

        _executeRebox(pairs);
    }

    /// @notice Rebox all available pairs (or up to cap)
    /// @param capPairs Maximum pairs to rebox (0 = no cap)
    /// @return pairs Number of pairs actually reboxed
    function reboxMax(uint256 capPairs)
        external
        nonReentrant
        returns (uint256 pairs)
    {
        // Check cap overflow first
        if (capPairs > type(uint256).max / 2) revert PairsOverflow();
        
        uint256 a = livecat.balanceOf(msg.sender);
        uint256 d = deadcat.balanceOf(msg.sender);
        pairs = a < d ? a : d;
        if (capPairs != 0 && pairs > capPairs) pairs = capPairs;
        if (pairs == 0) revert NoPairsAvailable();
        if (pairs > type(uint256).max / 2) revert PairsOverflow();

        _executeRebox(pairs);
    }

    // ========= Views =========

    /// @notice Check if an observation is ready to be revealed
    /// @param owner Address to check
    /// @return ready True if observation can be revealed now
    function canObserve(address owner) external view returns (bool ready) {
        Pending storage p = pending[owner];
        ready = p.active && block.number > p.refBlock + REVEAL_DELAY;
    }

    /// @notice Check if an observation can be force-finalized
    /// @param owner Address to check
    /// @return ready True if observation can be force-finalized now
    function canForceObserve(address owner) external view returns (bool ready) {
        Pending storage p = pending[owner];
        ready = p.active && block.number > p.refBlock + REVEAL_DELAY + GRACE;
    }

    /// @notice Calculate CATBOX output from reboxing a given number of pairs
    /// @param pairs Number of pairs to calculate for
    /// @return catboxOut Amount of CATBOX that would be minted
    /// @return feeTaken Amount taken as fee
    function calculateReboxOutput(uint256 pairs)
        external
        view
        returns (uint256 catboxOut, uint256 feeTaken)
    {
        if (pairs > type(uint256).max / 2) revert PairsOverflow();
        uint256 base = 2 * pairs;
        feeTaken = (base * REBOX_FEE_BPS) / _MAX_BPS;
        catboxOut = base - feeTaken;
    }

    // ========= Internals =========

    /// @notice Execute rebox operation
    function _executeRebox(uint256 pairs) private {
        // Burn LIVECAT and DEADCAT
        livecat.burn(msg.sender, pairs);
        deadcat.burn(msg.sender, pairs);

        uint256 base;
        unchecked {
            base = 2 * pairs; // Safe: already checked overflow
        }

        uint256 feeTokens = (base * REBOX_FEE_BPS) / _MAX_BPS;
        uint256 mintAmt;
        unchecked {
            mintAmt = base - feeTokens; // Safe: feeTokens <= base
        }

        // Mint CATBOX
        catbox.mint(msg.sender, mintAmt);
        emit Reboxed(msg.sender, pairs, mintAmt, feeTokens);
    }

    /// @notice Randomly choose either all alive or all dead (50/50 chance)
    function _randomSplit(
        uint256 amount,
        bytes32 seed,
        bytes32 dataHash,
        bytes32 userEntropy
    ) private pure returns (uint256 alive, uint256 dead) {
        // Double-hash to prevent length extension attacks
        bytes32 mixedEntropy = keccak256(
            abi.encodePacked(seed, dataHash, userEntropy)
        );
        
        bytes32 randomness = keccak256(
            abi.encodePacked("CATBOX_RANDOM_CHOICE_V2", mixedEntropy, amount)
        );
        
        // Use least significant bit to decide: 0 = dead, 1 = alive
        if (uint256(randomness) & 1 == 1) {
            alive = amount;
            dead = 0;
        } else {
            alive = 0;
            dead = amount;
        }
    }

    /// @notice Generate pseudo-random value with high entropy from multiple sources
    /// @dev This uses defense-in-depth with multiple entropy sources:
    ///      - block.timestamp: Temporal unpredictability
    ///      - block.prevrandao: High entropy PoS randomness (replaces difficulty)
    ///      - blockhash: Recent block hash
    ///      - tx.gasprice: Transaction-specific variance
    ///      - tx.origin: Original transaction sender
    ///      - msg.sender: Direct caller (user)
    ///      - gasleft(): Execution context entropy
    ///      - userEntropy: User-provided randomness (prevents replay attacks)
    ///      - refBlock: Commitment block reference
    ///      - address(this).balance: Contract state
    ///      - block.chainid: Network identifier
    /// @param user The address of the user (adds caller-specific entropy)
    /// @param refBlock The reference block number from commitment
    /// @param userEntropy User-provided entropy (must be non-zero)
    /// @return randomness The generated high-entropy random bytes32 value
    function _highEntropyRandom(address user, uint256 refBlock, bytes32 userEntropy)
        private
        view
        returns (bytes32 randomness)
    {
        // Prefer a fixed, commitment-linked blockhash to minimize user timing influence
        // Use blockhash(refBlock + REVEAL_DELAY) when available; otherwise fall back
        bytes32 commitLinkedHash = blockhash(refBlock + REVEAL_DELAY);
        bytes32 recentHash = blockhash(block.number - 1);

        randomness = keccak256(
            abi.encodePacked(
                // Commitment-linked entropy (zero if older than 256 blocks)
                commitLinkedHash,

                // Recent chain entropy as fallback/augmentation
                block.prevrandao,
                recentHash,
                block.timestamp,
                block.chainid,

                // Caller/context
                user,
                msg.sender,
                tx.gasprice,
                gasleft(),

                // User-provided commitment entropy and reference
                userEntropy,
                refBlock,

                // Contract state (cheap to mix-in; may be zero)
                address(this).balance
            )
        );
    }
}

