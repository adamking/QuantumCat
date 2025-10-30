# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuantumCat is a quantum-inspired memecoin implementing Schrödinger's cat mechanics through smart contracts. This is a **monorepo** with three projects:

### 1. Smart Contracts (`solidity/`)

**ERC-20 Architecture** (QCATToken.sol + ALIVECATToken.sol + DEADCATToken.sol + QuantumCatController.sol):
- Three separate ERC-20 tokens for universal DEX/exchange compatibility
- Controller contract manages observation and rebox mechanics
- Uses commit-reveal observation with 5-block delay
- **CRITICAL: Observing QCAT yields EITHER 100% ALIVECAT OR 100% DEADCAT (never a mix!)**
- **50/50 random outcome** - you get ALL of one type, NONE of the other
- **Rebox requires EQUAL amounts**: 1 ALIVECAT + 1 DEADCAT → 0.95 QCAT (with 5% fee)
- Optimized for creating Uniswap/Aerodrome liquidity pairs
- Works with all wallets, exchanges, and DeFi protocols

**Key Mechanics**:
- **commitObserve(amount, dataHash, userEntropy)**: Burns QCAT immediately, stores commitment with user-provided entropy
- **observe(data)**: After 5 blocks, reveals data to mint EITHER all ALIVECAT OR all DEADCAT (not both!)
  - Example: Observing 100 QCAT yields:
    - 50% chance: 100 ALIVECAT + 0 DEADCAT
    - 50% chance: 0 ALIVECAT + 100 DEADCAT
- **rebox(pairs)**: Burns equal ALIVECAT+DEADCAT pairs (1:1 ratio), mints QCAT minus fee (typically 5%)
  - Example: 10 ALIVECAT + 10 DEADCAT → 9.5 QCAT (with 5% fee)
  - Example: 0.5 ALIVECAT + 0.5 DEADCAT → 0.475 QCAT (with 5% fee)
  - Example: 1 ALIVECAT + 1 DEADCAT → 0.95 QCAT (with 5% fee)
- **forceObserve(owner)**: Anyone can finalize after 69 blocks if owner disappears

**Security Features**:
- Enhanced RNG: blockhash + prevrandao + userEntropy + tx.origin (defense-in-depth)
- 8-block fallback sampling for expired blockhashes (dramatically increases manipulation cost)
- Double-hashing to prevent length extension attacks
- Reentrancy guards on all state-changing functions
- ZERO admin control - immutable parameters set at deployment

### 2. Game (`game/`)

Interactive 8-bit browser game:
- Sealed box graphics with quantum unboxing mechanics
- Mini-game before observation
- MetaMask wallet integration
- Demo mode for testing without deployed contracts

### 3. Website (`website/`)

React/Vite landing page with:
- Interactive quantum cat animation (alive/dead superposition)
- Tokenomics explanation and mechanics breakdown
- Procedural glitch effects and sound generation
- Auto-deploys to GitHub Pages via Actions

## Commands

### Smart Contract Development (solidity/)

All commands must be run from the `solidity/` directory:

```bash
cd solidity/

# Testing
npm test                        # Run all tests (38+ tests in QuantumCat.test.js)
npm run test:security          # Security-specific tests (reentrancy, malicious receivers)
npm run test:gas               # Run with gas reporting
npm run test:coverage          # Generate coverage report

# Build & Linting
npm run compile                # Compile all contracts
npm run clean                  # Clean artifacts, cache, coverage
npm run lint                   # Lint Solidity files with solhint
npm run lint:fix               # Auto-fix linting issues
npm run format                 # Format with Prettier
npm run size                   # Check contract sizes (ensure < 24KB)

# Local Development
npm run node                   # Start local Hardhat node
npm run deploy:localhost       # Deploy to local network

# Testnet Deployment
npm run deploy:base-sepolia    # Deploy to Base Sepolia (recommended)
npm run deploy:sepolia         # Deploy to Ethereum Sepolia

# Mainnet Deployment (PERMANENT - cannot be undone!)
npm run deploy:base            # Deploy to Base (recommended for low fees)
npm run deploy:mainnet         # Deploy to Ethereum mainnet (expensive)
npm run deploy:arbitrum        # Deploy to Arbitrum One
npm run deploy:optimism        # Deploy to Optimism

# Verification
npm run verify                 # Verify on Etherscan/Basescan
```

**Environment Setup**: Copy `.env.example` to `.env` and configure:
- RPC URLs (BASE_RPC_URL, SEPOLIA_RPC_URL, etc.)
- PRIVATE_KEY for testnet, MAINNET_PRIVATE_KEY for mainnet
- INITIAL_HOLDER_ADDRESS (receives initial supply)
- INITIAL_QCAT_SUPPLY (typically 1,000,000 tokens)
- REBOX_FEE_BPS (500 = 5%, IMMUTABLE after deployment)
- Optional: BASESCAN_API_KEY for verification

### Website Development (website/)

All commands must be run from the `website/` directory:

```bash
cd website/

npm run dev                    # Start dev server (Vite)
npm run build                  # Production build
npm run preview                # Preview production build
npm run check                  # TypeScript type checking
```

**Deployment**: Automatically deploys to GitHub Pages when pushing to main (see `.github/workflows/deploy.yml`)

## Architecture Notes

### Smart Contract Architecture

**ERC-20 Implementation**:

**ERC-20 (QCATToken.sol + ALIVECATToken.sol + DEADCATToken.sol + QuantumCatController.sol)**:
- Three separate ERC-20 tokens + controller contract
- Pro: Universal DEX/exchange compatibility (Uniswap, Aerodrome, CEXs)
- Pro: Standard wallet support everywhere
- Pro: Enables arbitrage between all three tokens
- Deployment: Pre-compute controller address using CREATE2, deploy tokens with controller address, deploy controller last

**Observation Mechanics (CRITICAL)**:
- **Observation is NOT a 50/50 split of tokens!**
- **You get EITHER 100% ALIVECAT OR 100% DEADCAT, never both!**
- 50% probability of: ALL tokens become ALIVECAT (0 DEADCAT)
- 50% probability of: ALL tokens become DEADCAT (0 ALIVECAT)
- Example: 100 QCAT observed → 100 ALIVECAT + 0 DEADCAT (or vice versa)
- This is quantum wave function collapse - all-or-nothing outcome

**Rebox Mechanics (CRITICAL)**:
- **Requires EQUAL amounts (1:1 ratio) of ALIVECAT and DEADCAT**
- Burns pairs, mints QCAT minus the rebox fee
- Fee is subtracted from resulting QCAT (typically 5%)
- Examples:
  - 1 ALIVECAT + 1 DEADCAT = 0.95 QCAT (with 5% fee)
  - 0.5 ALIVECAT + 0.5 DEADCAT = 0.475 QCAT (with 5% fee)
  - 10 ALIVECAT + 10 DEADCAT = 9.5 QCAT (with 5% fee)
  - 100 ALIVECAT + 100 DEADCAT = 95 QCAT (with 5% fee)

**Randomness Strategy**:
- Primary (within 256 blocks): `keccak256(blockhash(refBlock+5) + prevrandao + userEntropy + tx.origin + user + refBlock)`
- Fallback (>256 blocks): 8 recent blockhashes mixed with entropy sources (dramatically increases manipulation cost)
- Double-hashing prevents length extension attacks
- Domain separation prevents cross-context attacks
- **Security model**: Requires validator collusion AND user secret compromise AND tx.origin manipulation

**Storage Layout (Pending struct)**:
```solidity
struct Pending {
    uint64  refBlock;    // 8 bytes - block number when committed
    bool    active;      // 1 byte - is observation active
    bytes32 dataHash;    // 32 bytes - commitment hash
    bytes32 userEntropy; // 32 bytes - user-provided entropy
    uint256 amount;      // 32 bytes - QCAT amount being observed
}
```

**Critical Constants**:
- `REVEAL_DELAY = 5` blocks (minimum wait before reveal)
- `GRACE = 64` blocks (wait before anyone can force observe)
- `DATA_MAX = 256` bytes (maximum reveal data size)
- `MAX_BPS = 10_000` (100% in basis points)

### Website Architecture

**Tech Stack**:
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui components
- Wouter (routing)

**Key Features**:
- `home.tsx`: Main landing page with quantum cat animation
- Procedural glitch effects using `crypto.getRandomValues()`
- Sound generation via Web Audio API
- Custom hooks: `use-flicker-effect`, `use-sound-effects`
- Responsive design with mobile support

### Deployment Notes

**Smart Contracts**:
- Deployment is **PERMANENT** - all parameters are immutable
- Base is recommended (99.9% lower fees than Ethereum mainnet)
- Deployment script (`deploy-erc20.js`) includes 5-10 second confirmation pauses
- Computes controller address via CREATE2 for ERC-20 architecture
- Saves deployment info to `deployments/{network}-latest.json`

**Website**:
- GitHub Actions workflow runs in `website/` directory with `working-directory` parameter
- Builds to `website/dist/`, uploads to GitHub Pages
- Node 22.21.1, cache enabled via `package-lock.json`
- TypeScript check runs before build (must pass)

### Testing Structure

**Test Files** (1600+ lines total):
- `QuantumCat.test.js` (1224 lines): Core functionality, observation, rebox, edge cases
- `QuantumCat.security.test.js` (382 lines): Reentrancy, malicious receivers, force observe

**Mock Contracts** (in `contracts/` for testing):
- `MaliciousReceiver.sol`: Tests reentrancy attacks
- `ReentrancyAttacker.sol`: Tests reentrancy guards
- `ThrowingReceiver.sol`: Tests error handling

## Important Warnings

### Before Mainnet Deployment

⚠️ **CRITICAL CHECKS**:
1. All parameters in `.env` are correct (they're permanent)
2. Token URIs are set (QCAT_URI, ALIVECAT_URI, DEADCAT_URI in contract or .env)
3. REBOX_FEE_BPS is desired value (typically 500 = 5%)
4. INITIAL_HOLDER_ADDRESS is correct
5. Test on testnet first (Base Sepolia recommended)
6. Contract cannot be upgraded, paused, or modified after deployment
7. No owner or admin functions exist - fully decentralized

### Gas Cost Expectations

- **Base** (recommended): ~$0.005 per observe cycle ($0.002 commit + $0.0025 observe)
- **Ethereum**: ~$20-50 per observe cycle (not recommended for memecoins)

### Randomness Limitations

Built-in blockhash RNG is manipulable by validators within economic constraints. Defense-in-depth mitigations:
- Commit-reveal prevents frontrunning
- User entropy prevents validator-only manipulation
- 8-block fallback sampling increases attack cost exponentially
- Suitable for memecoins and medium-value applications

## Monorepo Structure

```
QuantumCat/
├── solidity/                    # Smart contracts (Hardhat)
│   ├── contracts/
│   │   ├── QCATToken.sol       # ERC-20 QCAT token
│   │   ├── ALIVECATToken.sol   # ERC-20 ALIVECAT token
│   │   ├── DEADCATToken.sol    # ERC-20 DEADCAT token
│   │   └── QuantumCatController.sol  # Controller for quantum mechanics
│   ├── test/                    # Hardhat tests (1600+ lines)
│   ├── scripts/
│   │   └── deploy-erc20.js     # ERC-20 deployment script
│   ├── hardhat.config.js       # Network configs for Base, Arbitrum, etc.
│   └── CLAUDE.md               # Detailed contract documentation
├── game/                        # 8-bit browser game
│   ├── index.html              # Main game page
│   ├── game.js                 # Game logic and rendering
│   ├── blockchain.js           # Web3 integration
│   └── style.css               # Retro styling
├── website/                     # React/Vite frontend
│   ├── client/src/
│   │   ├── pages/home.tsx      # Main landing page
│   │   └── components/         # shadcn/ui components
│   ├── vite.config.ts
│   └── tailwind.config.ts
└── .github/workflows/
    └── deploy.yml               # Auto-deploy website to GitHub Pages
```
