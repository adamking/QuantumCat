# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuantumCat is a quantum-inspired ERC-1155 memecoin implementing Schrödinger's cat mechanics through smart contracts. The system features three token types (QCAT, ALIVECAT, DEADCAT) with a commit-reveal observation mechanism and cryptographically secure random splitting.

**IMPORTANT: This is an immutable memecoin with ZERO admin control:**
- No owner or admin functions
- No pause/unpause capability
- No upgradeability (not a proxy)
- Immutable parameters (fee, URIs) set at deployment
- True decentralized memecoin

## Development Commands

### Compilation
```bash
npm run compile          # Compile all contracts
npm run clean           # Clean artifacts and cache
```

### Testing
```bash
npm test                        # Run all tests
npm run test:security          # Run security-specific tests
npm run test:upgradeable       # Run upgradeable contract tests
npm run test:gas               # Run with gas reporting enabled
npm run test:coverage          # Generate coverage report
```

### Code Quality
```bash
npm run lint                    # Lint Solidity files
npm run lint:fix               # Auto-fix linting issues
npm run format                 # Format all files with Prettier
npm run format:check           # Check formatting
npm run size                   # Check contract sizes
```

### Deployment (Immutable - No Upgrades!)
```bash
npm run node                # Start local Hardhat node
npm run deploy:localhost    # Deploy to local network
npm run deploy:sepolia      # Deploy to Sepolia testnet
npm run deploy:mainnet      # Deploy to mainnet (PERMANENT!)
npm run verify              # Verify contract on Etherscan
```
⚠️ **No upgrade scripts exist** - contract is permanently immutable!

## Architecture Overview

### Core Contracts

**QuantumCat.sol** (Production Memecoin - IMMUTABLE)
- Main implementation - fully immutable with zero admin control
- Inherits: ERC1155, ERC1155Supply, ReentrancyGuard
- Uses custom errors for gas efficiency
- Implements commit-reveal pattern for observation mechanics
- NO owner, NO pause, NO upgradeability
- Contract size: ~9.7 KB (well under 24KB limit)

**QuantumCat.sol** (Alternative Implementation)
- Similar non-upgradeable implementation
- Slightly different storage layout
- Both contracts are immutable memecoins

### Key Design Patterns

#### Commit-Reveal Observation Flow
1. **commitObserve(amount, dataHash, userEntropy)**: Burns QCAT immediately (escrow-by-burn), stores commitment with reference block and user-provided entropy
2. **observe(data)**: After REVEAL_DELAY blocks, reveals data to mint EITHER all ALIVECAT OR all DEADCAT (50/50 random choice)
3. **forceObserve(owner)**: Anyone can finalize after GRACE period if owner disappears

The commit-reveal prevents manipulation by:
- Binding commitment to keccak256(data) hash
- Requiring user-provided 32 bytes of entropy (userEntropy must be non-zero)
- Using future blockhash + prevrandao + userEntropy as randomness seed (defense-in-depth)

#### Binary Random Choice Implementation
Located in `_randomSplit()` function:
- Combines three entropy sources: blockhash, prevrandao, and user-provided entropy
- Uses least significant bit to determine outcome: 0 = all DEADCAT, 1 = all ALIVECAT
- **50/50 probability**: Each observation gives either 100% ALIVECAT or 100% DEADCAT
- **Double-hashing**: Prevents length extension attacks
- **Amount binding**: Includes amount in hash to prevent cross-amount attacks
- Simple and auditable cryptographic randomness
- Creates interesting market dynamics requiring equal pairs for reboxing

#### Randomness Strategy (Enhanced Defense-in-Depth)
**Primary Path** (within 256 blocks):
- Mixes: `blockhash(refBlock + REVEAL_DELAY)` + `block.prevrandao` + `userEntropy` + `tx.origin` + `user` + `refBlock`
- **Double-hashing**: First hash mixes entropy, second hash adds domain separation
- Domain separation: `"QCAT_ENHANCED_PRIMARY_V3"` prefix
- Emits `RandomnessSourceUsed(user, false)` event

**Fallback Path** (>256 blocks old):
- Mixes: **8 recent blockhashes** (blocks -1, -2, -5, -10, -20, -50, -100, -200) + `block.prevrandao` + `userEntropy` + `tx.origin` + `user` + `refBlock` + `block.timestamp` + `block.number`
- **Triple-hashing**: First hash mixes 8 blockhashes, second hash combines with other entropy, third hash adds domain separation
- Domain separation: `"QCAT_ENHANCED_FALLBACK_V3"` prefix
- Multi-block sampling (8 blocks) dramatically increases manipulation cost
- Emits `RandomnessSourceUsed(user, true)` event

**Security Model**:
- Built-in randomness (no external oracle dependencies)
- **Triple defense-in-depth**: Requires user secret compromise AND validator collusion AND tx.origin manipulation
- User entropy adds unpredictability even if validator attempts manipulation
- **Double-hashing**: Prevents length extension attacks on keccak256
- **Domain separation**: Different prefixes prevent cross-context attacks
- **Amount binding**: Includes amount in hash to prevent cross-amount attacks
- **tx.origin binding**: Adds EOA-level entropy, prevents same-block manipulation
- **8 blockhashes in fallback**: Dramatically increases manipulation cost (requires controlling 8 blocks)
- ⚠️ Still theoretically manipulable, but economically infeasible for most use cases
- Suitable for memecoin/medium-stakes applications where manipulation cost exceeds value at stake

### Storage Layout (QuantumCat)

**Pending Struct** (optimized packing):
```solidity
struct Pending {
    uint64  refBlock;    // 8 bytes
    bool    active;      // 1 byte
    bytes32 dataHash;    // 32 bytes (new slot)
    bytes32 userEntropy; // 32 bytes (new slot) - user-provided entropy for RNG
    uint256 amount;      // 32 bytes (new slot)
}
```

### Critical Constants
```solidity
REVEAL_DELAY = 5       // Blocks before observation reveal
GRACE = 64             // Blocks before force observe allowed
DATA_MAX = 256         // Max reveal data size (bytes)
MAX_BPS = 10_000       // Basis points for fees
```

### Token Economics

**Rebox Mechanism**: Burns equal ALIVECAT + DEADCAT pairs, mints (2*pairs - fee) QCAT
- Requires exactly equal amounts: cannot rebox without matching pairs
- Fee set at deployment (typically 5% / 500 basis points)
- Acts as deflationary mechanism
- Creates trading demand for balancing ALIVECAT/DEADCAT holdings
- Fee is IMMUTABLE - set permanently at deployment

## Testing Architecture

### Test Files
- **QuantumCat.test.js**: Core functionality tests (38+ tests)
- **QuantumCat.security.test.js**: Reentrancy, malicious receiver tests
- **QuantumCat.test.js**: Upgrade scenarios, initialization

### Mock Contracts (test directory)
- **MaliciousReceiver.sol**: Tests malicious callback scenarios
- **MockERC1155Receiver.sol**: Tests proper receiver implementation
- **ReentrancyAttacker.sol**: Tests reentrancy guards

## Immutability (Memecoin Architecture)

QuantumCat is a fully immutable contract - **NOT** upgradeable:
- Direct deployment (no proxy pattern)
- All parameters set in constructor and immutable
- No owner or admin roles
- Cannot be paused or upgraded
- Community can verify zero admin functions in verified source code

### Why Immutable?
1. **True memecoin**: No rug pull potential
2. **Community trust**: No one can change rules after launch
3. **Gas efficient**: No proxy overhead
4. **Transparent**: What you see is what you get forever

## Security Considerations

### Access Control (Immutable Memecoin)
- **No Owner/Admin**: Contract has zero admin functions - fully decentralized
- **Users**: commitObserve(), observe(), rebox(), reboxMax() (own tokens only)
- **Anyone**: forceObserve() (after grace period to prevent fund locks)

### Reentrancy Protection
- All state-changing functions use `nonReentrant` modifier
- State changes occur before external calls (_mint after delete pending)
- Critical fix in forceObserve: receiver check BEFORE state deletion

### Input Validation Patterns
- Amount validation: Must be > 0 and < type(uint256).max
- Pairs overflow check: pairs <= type(uint256).max / 2
- Data size check: data.length <= DATA_MAX
- Fee validation: feeBps <= MAX_BPS
- Receiver validation: Contracts must implement IERC1155Receiver

### Known Limitations
1. Blockhash RNG manipulable by miners/validators (mitigated by commit-reveal + future block)
2. Observation can be censored by not including reveal transaction
3. Force observe mechanism prevents permanent fund locks but removes user control

## Development Workflow Notes

### Adding New Features
1. Update storage layout at end of struct/contract (upgradeable)
2. Add custom error at top of contract
3. Write unit tests first
4. Consider gas optimization (unchecked arithmetic where safe)
5. Update events for indexing
6. Run full test suite + coverage

### Deployment (Immutable)
- Use regular deployment (no proxy)
- Deployment artifacts saved to `deployments/{network}-latest.json`
- **All parameters are permanent** - double-check before mainnet deploy

### Environment Configuration
Required `.env` variables for deployment:
- SEPOLIA_RPC_URL / MAINNET_RPC_URL
- PRIVATE_KEY (testnet) / MAINNET_PRIVATE_KEY
- ETHERSCAN_API_KEY (optional, for verification only)
- INITIAL_HOLDER_ADDRESS (deployment) - receives initial supply
- INITIAL_QCAT_SUPPLY (deployment) - **immutable**
- REBOX_FEE_BPS (deployment) - **immutable**, typically 500 (5%)
- **QCAT_URI, ALIVECAT_URI, DEADCAT_URI** (REQUIRED) - **immutable** metadata URIs, set permanently at deployment

## Gas Optimization Techniques Used

1. Custom errors instead of require strings
2. Unchecked arithmetic in safe contexts (post-overflow checks)
3. Storage packing (Pending struct)
4. Short-circuit logic in conditionals
5. Immutable variables (REBOX_FEE_BPS in non-upgradeable)
6. Compiler optimization: 1000 runs
7. Minimal external calls

## Interfacing with External Systems

### Metadata URIs
- Token URIs are IMMUTABLE and set permanently at deployment
- Stored on-chain (qcatURI, alivecatURI, deadcatURI)
- Must be explicitly configured in `.env` before deployment
- Cannot be changed after deployment (no setTokenURI function)
- Recommended options:
  - IPFS: `ipfs://QmHash/metadata/{id}` (decentralized)
  - Data URIs: `data:application/json;base64,...` (fully on-chain)
  - HTTP: `https://yourdomain.com/metadata/{id}` (requires hosting)

## Common Debugging Scenarios

### "pending" error on commitObserve
- User already has active observation
- Must complete or wait for force observe first

### "ZeroEntropy" error on commitObserve
- User provided bytes32(0) as userEntropy
- Must provide non-zero 32 bytes of entropy
- Example: `ethers.keccak256(ethers.toUtf8Bytes("my_secret_salt"))`

### "grace" error on forceObserve
- Too early; must wait REVEAL_DELAY + GRACE blocks from refBlock
- Calculate: pending.refBlock + 5 + 64

### "bad reveal" / HashMismatch
- Revealed data doesn't match committed dataHash
- Ensure exact bytes used (including salt and t byte)

## Notable Implementation Details

### Why Escrow-by-Burn?
QCAT burned on commit rather than held in contract:
- Simplifies accounting (no escrow balance tracking)
- Reduces attack surface (no escrow withdrawal vulnerabilities)
- Total supply accurately reflects unobserved tokens
- Trade-off: Cannot cancel observation once committed

### User Entropy Generation
User-provided entropy is a critical security component that prevents validator-only manipulation:

**Best Practices:**
```javascript
// Option 1: Simple random bytes
const userEntropy = ethers.randomBytes(32);

// Option 2: Hash of secret + nonce
const secret = "my_secret_passphrase";
const nonce = Date.now();
const userEntropy = ethers.keccak256(
  ethers.toUtf8Bytes(`${secret}_${nonce}`)
);

// Option 3: Hash of multiple sources
const userEntropy = ethers.keccak256(
  ethers.solidityPacked(
    ["address", "uint256", "bytes32"],
    [userAddress, Date.now(), ethers.randomBytes(32)]
  )
);
```

**Security Requirements:**
- Must be non-zero (enforced by contract)
- Should be unpredictable to others (don't reuse, don't share)
- Doesn't need to be remembered (stored on-chain in pending struct)
- Used in both keccak operations for marked state selection and weighted sampling

**Why it matters:**
- Without user entropy: Validator can manipulate by choosing which blocks to include
- With user entropy: Validator would also need to know the user's secret entropy
- Defense-in-depth: Two independent factors must be compromised simultaneously

### Receiver Validation
`_canReceive1155()` checks:
- EOA (code.length == 0): Always allowed
- Contract: Must support IERC1155Receiver interface (0x4e2312e0)
- Prevents tokens locked in non-receiver contracts
- Checked at commitObserve (contracts only) and forceObserve (always)
