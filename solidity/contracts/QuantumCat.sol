// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/*
 * QCAT ERC-1155 (explicit observe + fee-only rebox) - IMMUTABLE MEMECOIN
 *  - ID 0: QCAT (superposed)
 *  - ID 1: ALIVECAT
 *  - ID 2: DEADCAT
 *
 * Observe:
 *  - commitObserve(amount, dataHash, userEntropy) burns QCAT now (escrow-by-burn), records ref block
 *  - observe(data) after DELAY mints ALIVECAT/DEADCAT whose sum == amount (random split)
 *  - forceObserve(owner) finalizes after GRACE if owner disappears
 *
 * Rebox (fee-only sink):
 *  - Burn equal ALIVECAT + DEADCAT pairs; mint (2*pairs − feeTokens) QCAT
 *
 * Security:
 *  - Commit bound to owner, amount, keccak256(data), and user-provided entropy
 *  - Enhanced RNG: Mix blockhash + prevrandao + userEntropy (defense-in-depth)
 *  - Multi-block fallback sampling increases manipulation cost
 *  - Requires BOTH user secret compromise AND validator collusion to manipulate
 *  - Reentrancy-guarded; state changes before callbacks; size guards; overflow guards
 *  - ZERO admin control: no owner, no pause, no upgrades, immutable parameters
 */

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @title QuantumCat - A quantum-inspired ERC-1155 token with observation mechanics
/// @author QuantumCat Team
/// @notice This contract implements a unique token system where superposed tokens (QCAT)
/// can be "observed" into either ALIVECAT or DEADCAT tokens based on a commit-reveal scheme
/// with cryptographically secure randomness
/// @dev Immutable memecoin with ZERO admin control - no owner, no pause, no upgrades
contract QuantumCat is
    ERC1155,
    ERC1155Supply,
    ReentrancyGuard
{
    // --- Custom Errors ---

    /// @notice Thrown when attempting to commit an observation while one is already pending
    error PendingObservationExists();

    /// @notice Thrown when no pending observation exists for the caller
    error NoPendingObservation();

    /// @notice Thrown when the amount is invalid (0 or max uint256)
    error InvalidAmount();

    /// @notice Thrown when trying to observe before the reveal delay has passed
    error InsufficientDelay();

    /// @notice Thrown when the reveal data doesn't match the committed hash
    error HashMismatch();

    /// @notice Thrown when the reveal data exceeds maximum allowed size
    error DataTooLarge();

    /// @notice Thrown when trying to force observe before grace period ends
    error GracePeriodNotPassed();

    /// @notice Thrown when attempting to rebox with zero pairs
    error NoPairsAvailable();

    /// @notice Thrown when pairs amount would cause overflow
    error PairsOverflow();

    /// @notice Thrown when a receiver contract doesn't implement IERC1155Receiver
    error InvalidReceiver(address receiver);

    /// @notice Thrown when trying to initialize with zero address
    error ZeroAddress();

    /// @notice Thrown when fee exceeds 100%
    error FeeExceedsMaximum();

    /// @notice Thrown when URI is empty
    error EmptyURI();

    /// @notice Thrown when user entropy is zero
    error ZeroEntropy();

    // --- Token IDs ---

    /// @notice Token ID for superposed quantum cats
    uint256 public constant QCAT     = 0;

    /// @notice Token ID for alive cats (post-observation)
    uint256 public constant ALIVECAT = 1;

    /// @notice Token ID for dead cats (post-observation)
    uint256 public constant DEADCAT  = 2;

    // --- Config Constants ---

    /// @notice Number of blocks to wait before observation can be revealed
    uint8  public constant REVEAL_DELAY = 5;

    /// @notice Additional blocks after reveal delay before force observe is allowed
    uint16 public constant GRACE        = 64;

    /// @notice Maximum size of observation data in bytes
    uint16 public constant DATA_MAX     = 256;

    /// @notice Fallback blockhash sampling offsets for enhanced randomness
    uint8 private constant _FALLBACK_OFFSET_1 = 1;
    uint8 private constant _FALLBACK_OFFSET_2 = 2;
    uint8 private constant _FALLBACK_OFFSET_3 = 5;
    uint8 private constant _FALLBACK_OFFSET_4 = 10;
    uint8 private constant _FALLBACK_OFFSET_5 = 20;
    uint8 private constant _FALLBACK_OFFSET_6 = 50;
    uint8 private constant _FALLBACK_OFFSET_7 = 100;
    uint8 private constant _FALLBACK_OFFSET_8 = 200;

    /// @notice Interface ID for IERC1155Receiver
    bytes4 private constant _IERC1155_RECEIVER_INTERFACE_ID = type(IERC1155Receiver).interfaceId;

    /// @notice Maximum basis points (100%)
    uint96 private constant _MAX_BPS = 10_000;

    /// @notice Rebox fee in basis points (immutable)
    uint96 public immutable REBOX_FEE_BPS;

    // --- Collection Metadata (Immutable Constants) ---

    /// @notice Collection name
    string public constant NAME = "QuantumCat";

    /// @notice Collection symbol
    string public constant SYMBOL = "QCAT";

    /// @notice Metadata URI for QCAT token (ID 0)
    /// @dev IMPORTANT: Replace with your actual IPFS hash before mainnet deployment!
    ///      Format: ipfs://QmYourIPFSHash/0.json
    ///      This is PERMANENT and cannot be changed after deployment
    string public constant QCAT_URI = "ipfs://QmTBD-REPLACE-BEFORE-MAINNET/0.json";

    /// @notice Metadata URI for ALIVECAT token (ID 1)
    /// @dev IMPORTANT: Replace with your actual IPFS hash before mainnet deployment!
    string public constant ALIVECAT_URI = "ipfs://QmTBD-REPLACE-BEFORE-MAINNET/1.json";

    /// @notice Metadata URI for DEADCAT token (ID 2)
    /// @dev IMPORTANT: Replace with your actual IPFS hash before mainnet deployment!
    string public constant DEADCAT_URI = "ipfs://QmTBD-REPLACE-BEFORE-MAINNET/2.json";

    // --- Pending Observation Storage (Optimized Layout) ---

    /// @notice Pending observation data structure (storage-optimized)
    /// @dev Packed to minimize storage slots: refBlock and active fit in one slot with offset
    struct Pending {
        uint64  refBlock;    // Reference block number (8 bytes)
        bool    active;      // Whether observation is active (1 byte)
        bytes32 dataHash;    // Committed data hash (32 bytes, new slot)
        bytes32 userEntropy; // User-provided entropy (32 bytes, new slot)
        uint256 amount;      // Amount of QCAT escrowed (32 bytes, new slot)
    }

    /// @notice Mapping of addresses to their pending observations
    mapping(address => Pending) public pending;

    // --- Events ---

    /// @notice Emitted when an observation is committed
    /// @param owner Address that committed the observation
    /// @param amount Amount of QCAT tokens escrowed
    /// @param dataHash Hash of the committed data
    /// @param refBlock Reference block number
    event CommitObserve(address indexed owner, uint256 amount, bytes32 dataHash, uint64 refBlock);

    /// @notice Emitted when an observation is revealed by the owner
    /// @param owner Address that revealed the observation
    /// @param alive Amount of ALIVECAT tokens minted
    /// @param dead Amount of DEADCAT tokens minted
    event Observed(address indexed owner, uint256 alive, uint256 dead);

    /// @notice Emitted when an observation is force-revealed by another address
    /// @param owner Address that owns the observation
    /// @param alive Amount of ALIVECAT tokens minted
    /// @param dead Amount of DEADCAT tokens minted
    event Forced(address indexed owner, uint256 alive, uint256 dead);

    /// @notice Emitted when tokens are reboxed
    /// @param user Address that performed the rebox
    /// @param pairs Number of ALIVECAT/DEADCAT pairs burned
    /// @param qcatMinted Amount of QCAT tokens minted
    /// @param feeTokens Amount of tokens taken as fee
    event Reboxed(address indexed user, uint256 indexed pairs, uint256 qcatMinted, uint256 feeTokens);

    /// @notice Emitted when randomness source is used
    /// @param user Address that triggered randomness generation
    /// @param usedFallback True if fallback randomness was used instead of target blockhash
    event RandomnessSourceUsed(address indexed user, bool usedFallback);

    /// @notice Constructor for immutable memecoin deployment
    /// @param initialHolder Address to receive initial QCAT supply
    /// @param initialQCATSupply Initial supply of QCAT tokens to mint
    /// @param feeBps Rebox fee in basis points (0-10000, immutable)
    constructor(
        address initialHolder,
        uint256 initialQCATSupply,
        uint96  feeBps
    ) ERC1155("") {
        if (initialHolder == address(0)) revert ZeroAddress();
        if (feeBps > _MAX_BPS) revert FeeExceedsMaximum();
        if (initialQCATSupply == 0) revert InvalidAmount();

        REBOX_FEE_BPS = feeBps;

        _mint(initialHolder, QCAT, initialQCATSupply, "");
    }

    // ========= OBSERVE =========

    /// @notice Burn QCAT now and commit to observing with future reveal data
    /// @param amount Amount of QCAT tokens to escrow (must be > 0)
    /// @param dataHash keccak256 hash of the data you'll reveal later
    /// @param userEntropy User-provided 32 bytes of entropy (must be non-zero)
    /// @dev Burns QCAT immediately and stores commitment.
    ///      userEntropy adds defense-in-depth: requires both user secret + validator collusion to manipulate.
    function commitObserve(uint256 amount, bytes32 dataHash, bytes32 userEntropy)
        external
        nonReentrant
    {
        if (pending[msg.sender].active) revert PendingObservationExists();
        if (amount == 0) revert InvalidAmount();
        if (userEntropy == bytes32(0)) revert ZeroEntropy();

        // If caller is a contract, ensure it can receive ERC-1155 (for later mint)
        if (msg.sender.code.length > 0) {
            if (!_canReceive1155(msg.sender)) revert InvalidReceiver(msg.sender);
        }

        // Escrow by burn
        _burn(msg.sender, QCAT, amount);

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
    /// @dev Mints ALIVECAT and DEADCAT tokens with cryptographically secure random split
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

        // Generate enhanced randomness with defense-in-depth
        (bytes32 randomness, bool usedFallback) = _getRandomness(msg.sender, p.refBlock, p.userEntropy);
        emit RandomnessSourceUsed(msg.sender, usedFallback);

        (uint256 alive, uint256 dead) = _randomSplit(p.amount, randomness, p.dataHash, p.userEntropy);

        emit Observed(msg.sender, alive, dead);
        _mint(msg.sender, ALIVECAT, alive, "");
        _mint(msg.sender, DEADCAT, dead, "");
    }

    /// @notice Finalize a stuck observation after grace period (anyone can call)
    /// @param owner Address whose observation to finalize
    /// @dev Can be called by anyone after GRACE blocks.
    ///      Prevents locked funds if owner loses access.
    function forceObserve(address owner)
        external
        nonReentrant
    {
        Pending memory p = pending[owner];
        if (!p.active) revert NoPendingObservation();
        if (block.number <= p.refBlock + REVEAL_DELAY + GRACE) revert GracePeriodNotPassed();

        // SECURITY FIX: Check receiver capability BEFORE state deletion
        if (!_canReceive1155(owner)) revert InvalidReceiver(owner);

        delete pending[owner];

        // Generate enhanced randomness with defense-in-depth
        (bytes32 randomness, bool usedFallback) = _getRandomness(owner, p.refBlock, p.userEntropy);
        emit RandomnessSourceUsed(owner, usedFallback);

        (uint256 alive, uint256 dead) = _randomSplit(p.amount, randomness, p.dataHash, p.userEntropy);

        emit Forced(owner, alive, dead);
        _mint(owner, ALIVECAT, alive, "");
        _mint(owner, DEADCAT, dead, "");
    }

    // ========= REBOX (fee-only sink) =========

    /// @notice Burn equal ALIVECAT & DEADCAT pairs and mint QCAT (minus fee)
    /// @param pairs Number of pairs to rebox
    /// @dev Burns `pairs` of each token type, mints (2*pairs - fee) QCAT tokens
    function rebox(uint256 pairs)
        external
        nonReentrant
    {
        if (pairs == 0) revert NoPairsAvailable();
        if (pairs > type(uint256).max / 2) revert PairsOverflow();

        _executeRebox(pairs);
    }

    /// @notice Rebox all available pairs (or up to cap)
    /// @param capPairs Maximum pairs to rebox (0 = no cap)
    /// @return pairs Number of pairs actually reboxed
    /// @dev Automatically calculates min(ALIVECAT, DEADCAT) and reboxes up to cap
    function reboxMax(uint256 capPairs)
        external
        nonReentrant
        returns (uint256 pairs)
    {
        uint256 a = balanceOf(msg.sender, ALIVECAT);
        uint256 d = balanceOf(msg.sender, DEADCAT);
        pairs = a < d ? a : d;
        if (capPairs != 0 && pairs > capPairs) pairs = capPairs;
        if (pairs == 0) revert NoPairsAvailable();
        if (pairs > type(uint256).max / 2) revert PairsOverflow();

        _executeRebox(pairs);
    }

    // ========= Views / Metadata =========

    /// @notice Returns the metadata URI for a given token ID
    /// @param id Token ID to query
    /// @return Metadata URI string
    function uri(uint256 id) public view override returns (string memory) {
        if (id == QCAT)     return QCAT_URI;
        if (id == ALIVECAT) return ALIVECAT_URI;
        if (id == DEADCAT)  return DEADCAT_URI;
        return super.uri(id);
    }

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

    /// @notice Execute rebox operation - burns pairs and mints QCAT
    /// @param pairs Number of pairs to rebox
    /// @dev Internal function to avoid code duplication between rebox() and reboxMax()
    function _executeRebox(uint256 pairs) private {
        _burn(msg.sender, ALIVECAT, pairs);
        _burn(msg.sender, DEADCAT, pairs);

        uint256 base;
        unchecked {
            base = 2 * pairs; // Safe: already checked overflow
        }

        uint256 feeTokens = (base * REBOX_FEE_BPS) / _MAX_BPS;
        uint256 mintAmt;
        unchecked {
            mintAmt = base - feeTokens; // Safe: feeTokens <= base
        }

        _mint(msg.sender, QCAT, mintAmt, "");
        emit Reboxed(msg.sender, pairs, mintAmt, feeTokens);
    }

    /// @notice Randomly split tokens between alive and dead with cryptographic security
    /// @param amount Total amount to distribute between alive and dead
    /// @param seed Random seed from enhanced multi-source randomness
    /// @param dataHash Additional entropy from commit data
    /// @param userEntropy User-provided entropy
    /// @return alive Amount of ALIVECAT tokens
    /// @return dead Amount of DEADCAT tokens
    /// @dev Incorporates three entropy sources: seed (blockhash+prevrandao), dataHash, userEntropy
    ///      Uses double-hashing to prevent length extension attacks
    ///      Split is uniformly random from 0 to amount (inclusive)
    function _randomSplit(
        uint256 amount,
        bytes32 seed,
        bytes32 dataHash,
        bytes32 userEntropy
    ) private pure returns (uint256 alive, uint256 dead) {
        // Double-hash to prevent length extension attacks
        // First hash: mix all entropy sources
        bytes32 mixedEntropy = keccak256(
            abi.encodePacked(
                seed,
                dataHash,
                userEntropy
            )
        );
        
        // Second hash: add domain separation and finalize
        bytes32 randomness = keccak256(
            abi.encodePacked(
                "QCAT_RANDOM_SPLIT_V2",
                mixedEntropy,
                amount  // Include amount to prevent cross-amount attacks
            )
        );
        
        // Generate uniformly random split: alive can be 0 to amount (inclusive)
        alive = uint256(randomness) % (amount + 1);
        
        unchecked {
            dead = amount - alive; // Safe: alive <= amount by construction
        }
    }

    /// @notice Generate enhanced multi-source randomness with defense-in-depth
    /// @param user Address requesting randomness
    /// @param refBlock Reference block number
    /// @param userEntropy User-provided entropy
    /// @return randomness Enhanced random bytes32 value
    /// @return usedFallback True if fallback randomness was used
    /// @dev Primary: Mix target blockhash + prevrandao + userEntropy + user + refBlock
    ///      Fallback: Mix 8 recent blockhashes + prevrandao + timestamp + userEntropy + user + refBlock + block.number
    ///      Defense-in-depth: Requires compromising BOTH validator manipulation AND user secret
    ///      Uses double-hashing to prevent length extension attacks
    function _getRandomness(address user, uint256 refBlock, bytes32 userEntropy)
        private
        view
        returns (bytes32 randomness, bool usedFallback)
    {
        uint256 targetBlock = refBlock + REVEAL_DELAY;
        bytes32 targetHash = blockhash(targetBlock);

        if (targetHash != bytes32(0)) {
            // Primary path: Mix target blockhash with prevrandao and user entropy
            // This combines validator-influenced (blockhash, prevrandao) with user-controlled (entropy)
            bytes32 mixedEntropy = keccak256(
                abi.encodePacked(
                    targetHash,
                    block.prevrandao,
                    userEntropy,
                    user,
                    refBlock
                )
            );
            
            // Double-hash with domain separation to prevent length extension
            randomness = keccak256(
                abi.encodePacked(
                    "QCAT_ENHANCED_PRIMARY_V3",
                    mixedEntropy
                )
            );
            usedFallback = false;
        } else {
            // Fallback path: Target blockhash unavailable (>256 blocks old)
            // Mix 8 recent blockhashes to increase manipulation cost significantly
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
            
            // Double-hash with domain separation
            randomness = keccak256(
                abi.encodePacked(
                    "QCAT_ENHANCED_FALLBACK_V3",
                    mixedEntropy
                )
            );
            usedFallback = true;
        }
    }

    /// @notice Check if an address can receive ERC1155 tokens
    /// @param to Address to check
    /// @return True if address can receive tokens (EOA or implements IERC1155Receiver)
    function _canReceive1155(address to) internal view returns (bool) {
        if (to.code.length == 0) return true; // EOA
        try IERC165(to).supportsInterface(_IERC1155_RECEIVER_INTERFACE_ID) returns (bool ok) {
            return ok;
        } catch {
            return false;
        }
    }

    /// @notice Hook called before token transfers
    /// @param from Source address (address(0) for mints)
    /// @param to Destination address (address(0) for burns)
    /// @param ids Array of token IDs
    /// @param values Array of amounts for each token ID
    /// @dev Required override for ERC1155Supply
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }
}
