// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/*
 * QUANTUM CAT CONTROLLER - ERC-20 Architecture (Exchange-Compatible)
 *
 * Three separate ERC-20 tokens:
 *  - QCAT (superposed state)
 *  - ALIVECAT (observed alive)
 *  - DEADCAT (observed dead)
 *
 * Observe:
 *  - commitObserve(amount, dataHash, userEntropy) burns QCAT, records commitment
 *  - observe(data) after DELAY mints EITHER all ALIVECAT OR all DEADCAT (50/50 random)
 *  - forceObserve(owner) finalizes after GRACE if owner disappears
 *
 * Rebox (fee-only sink):
 *  - Burn equal ALIVECAT + DEADCAT pairs; mint (2*pairs − feeTokens) QCAT
 *  - Requires equal amounts: you need 1 ALIVECAT + 1 DEADCAT to make 1 QCAT (minus fee)
 *
 * Security:
 *  - Enhanced RNG: blockhash + prevrandao + userEntropy (defense-in-depth)
 *  - Reentrancy-guarded; state changes before external calls
 *  - ZERO admin control: immutable parameters
 */

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./QCATToken.sol";
import "./ALIVECATToken.sol";
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

    // --- Config Constants ---

    /// @notice Number of blocks to wait before observation can be revealed
    uint8 public constant REVEAL_DELAY = 5;

    /// @notice Additional blocks after reveal delay before force observe is allowed
    uint16 public constant GRACE = 64;

    /// @notice Maximum size of observation data in bytes
    uint16 public constant DATA_MAX = 256;

    /// @notice Fallback blockhash sampling offsets
    uint8 private constant _FALLBACK_OFFSET_1 = 1;
    uint8 private constant _FALLBACK_OFFSET_2 = 2;
    uint8 private constant _FALLBACK_OFFSET_3 = 5;
    uint8 private constant _FALLBACK_OFFSET_4 = 10;
    uint8 private constant _FALLBACK_OFFSET_5 = 20;
    uint8 private constant _FALLBACK_OFFSET_6 = 50;
    uint8 private constant _FALLBACK_OFFSET_7 = 100;
    uint8 private constant _FALLBACK_OFFSET_8 = 200;

    /// @notice Maximum basis points (100%)
    uint96 private constant _MAX_BPS = 10_000;

    /// @notice Rebox fee in basis points (immutable)
    uint96 public immutable REBOX_FEE_BPS;

    // --- Token References ---

    /// @notice QCAT token (superposed)
    QCATToken public immutable qcat;

    /// @notice ALIVECAT token (observed alive)
    ALIVECATToken public immutable alivecat;

    /// @notice DEADCAT token (observed dead)
    DEADCATToken public immutable deadcat;

    // --- Pending Observation Storage ---

    struct Pending {
        uint64 refBlock;      // Reference block number
        bool active;          // Whether observation is active
        bytes32 dataHash;     // Committed data hash
        bytes32 userEntropy;  // User-provided entropy
        uint256 amount;       // Amount of QCAT escrowed
    }

    mapping(address => Pending) public pending;

    // --- Events ---

    event CommitObserve(address indexed owner, uint256 amount, bytes32 dataHash, uint64 refBlock);
    event Observed(address indexed owner, uint256 alive, uint256 dead);
    event Forced(address indexed owner, uint256 alive, uint256 dead);
    event Reboxed(address indexed user, uint256 indexed pairs, uint256 qcatMinted, uint256 feeTokens);
    event RandomnessSourceUsed(address indexed user, bool usedFallback);

    /// @notice Constructor for immutable controller deployment
    /// @param _qcat Address of QCAT token contract
    /// @param _alivecat Address of ALIVECAT token contract
    /// @param _deadcat Address of DEADCAT token contract
    /// @param feeBps Rebox fee in basis points (0-10000, immutable)
    constructor(
        address _qcat,
        address _alivecat,
        address _deadcat,
        uint96 feeBps
    ) {
        if (_qcat == address(0)) revert ZeroAddress();
        if (_alivecat == address(0)) revert ZeroAddress();
        if (_deadcat == address(0)) revert ZeroAddress();
        if (feeBps > _MAX_BPS) revert FeeExceedsMaximum();

        qcat = QCATToken(_qcat);
        alivecat = ALIVECATToken(_alivecat);
        deadcat = DEADCATToken(_deadcat);
        REBOX_FEE_BPS = feeBps;
    }

    // ========= OBSERVE =========

    /// @notice Burn QCAT now and commit to observing with future reveal data
    /// @param amount Amount of QCAT tokens to escrow (must be > 0)
    /// @param dataHash keccak256 hash of the data you'll reveal later
    /// @param userEntropy User-provided 32 bytes of entropy (must be non-zero)
    function commitObserve(uint256 amount, bytes32 dataHash, bytes32 userEntropy)
        external
        nonReentrant
    {
        if (pending[msg.sender].active) revert PendingObservationExists();
        if (amount == 0) revert InvalidAmount();
        if (userEntropy == bytes32(0)) revert ZeroEntropy();
        if (qcat.balanceOf(msg.sender) < amount) revert InsufficientBalance();

        // Burn QCAT (escrow by burn)
        qcat.burn(msg.sender, amount);

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

        // Generate enhanced randomness
        (bytes32 randomness, bool usedFallback) = _getRandomness(msg.sender, p.refBlock, p.userEntropy);
        emit RandomnessSourceUsed(msg.sender, usedFallback);

        (uint256 alive, uint256 dead) = _randomSplit(p.amount, randomness, p.dataHash, p.userEntropy);

        emit Observed(msg.sender, alive, dead);
        
        // Mint ALIVECAT and DEADCAT
        if (alive > 0) alivecat.mint(msg.sender, alive);
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

        // Generate enhanced randomness
        (bytes32 randomness, bool usedFallback) = _getRandomness(owner, p.refBlock, p.userEntropy);
        emit RandomnessSourceUsed(owner, usedFallback);

        (uint256 alive, uint256 dead) = _randomSplit(p.amount, randomness, p.dataHash, p.userEntropy);

        emit Forced(owner, alive, dead);
        
        // Mint ALIVECAT and DEADCAT to the owner
        if (alive > 0) alivecat.mint(owner, alive);
        if (dead > 0) deadcat.mint(owner, dead);
    }

    // ========= REBOX =========

    /// @notice Burn equal ALIVECAT & DEADCAT pairs and mint QCAT (minus fee)
    /// @param pairs Number of pairs to rebox
    function rebox(uint256 pairs)
        external
        nonReentrant
    {
        if (pairs == 0) revert NoPairsAvailable();
        if (pairs > type(uint256).max / 2) revert PairsOverflow();
        if (alivecat.balanceOf(msg.sender) < pairs) revert InsufficientBalance();
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
        uint256 a = alivecat.balanceOf(msg.sender);
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
        Pending memory p = pending[owner];
        ready = p.active && block.number > p.refBlock + REVEAL_DELAY;
    }

    /// @notice Check if an observation can be force-finalized
    /// @param owner Address to check
    /// @return ready True if observation can be force-finalized now
    function canForceObserve(address owner) external view returns (bool ready) {
        Pending memory p = pending[owner];
        ready = p.active && block.number > p.refBlock + REVEAL_DELAY + GRACE;
    }

    /// @notice Calculate QCAT output from reboxing a given number of pairs
    /// @param pairs Number of pairs to calculate for
    /// @return qcatOut Amount of QCAT that would be minted
    /// @return feeTaken Amount taken as fee
    function calculateReboxOutput(uint256 pairs)
        external
        view
        returns (uint256 qcatOut, uint256 feeTaken)
    {
        if (pairs > type(uint256).max / 2) revert PairsOverflow();
        uint256 base = 2 * pairs;
        feeTaken = (base * REBOX_FEE_BPS) / _MAX_BPS;
        qcatOut = base - feeTaken;
    }

    // ========= Internals =========

    /// @notice Execute rebox operation
    function _executeRebox(uint256 pairs) private {
        // Burn ALIVECAT and DEADCAT
        alivecat.burn(msg.sender, pairs);
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

        // Mint QCAT
        qcat.mint(msg.sender, mintAmt);
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
            abi.encodePacked("QCAT_RANDOM_CHOICE_V2", mixedEntropy, amount)
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

    /// @notice Generate enhanced multi-source randomness
    function _getRandomness(address user, uint256 refBlock, bytes32 userEntropy)
        private
        view
        returns (bytes32 randomness, bool usedFallback)
    {
        uint256 targetBlock = refBlock + REVEAL_DELAY;
        bytes32 targetHash = blockhash(targetBlock);

        if (targetHash != bytes32(0)) {
            // Primary path
            bytes32 mixedEntropy = keccak256(
                abi.encodePacked(
                    targetHash,
                    block.prevrandao,
                    userEntropy,
                    user,
                    refBlock
                )
            );
            
            randomness = keccak256(
                abi.encodePacked("QCAT_ENHANCED_PRIMARY_V3", mixedEntropy)
            );
            usedFallback = false;
        } else {
            // Fallback path
            bytes32 mixedBlocks = keccak256(
                abi.encodePacked(
                    blockhash(block.number - _FALLBACK_OFFSET_1),
                    blockhash(block.number - _FALLBACK_OFFSET_2),
                    blockhash(block.number - _FALLBACK_OFFSET_3),
                    blockhash(block.number - _FALLBACK_OFFSET_4),
                    blockhash(block.number - _FALLBACK_OFFSET_5),
                    blockhash(block.number - _FALLBACK_OFFSET_6),
                    blockhash(block.number - _FALLBACK_OFFSET_7),
                    blockhash(block.number - _FALLBACK_OFFSET_8)
                )
            );
            
            bytes32 mixedEntropy = keccak256(
                abi.encodePacked(
                    mixedBlocks,
                    block.prevrandao,
                    userEntropy,
                    user,
                    refBlock,
                    block.timestamp,
                    block.number
                )
            );
            
            randomness = keccak256(
                abi.encodePacked("QCAT_ENHANCED_FALLBACK_V3", mixedEntropy)
            );
            usedFallback = true;
        }
    }
}

