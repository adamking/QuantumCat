# QuantumCat Smart Contracts 🐱⚛️

> A quantum-inspired ERC-20 token system with observation mechanics and cryptographic randomness
> **🔵 Built Exclusively for [Base L2](https://base.org/) - Coinbase's Ethereum Layer 2 for Ultra-Low Fees**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.30-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.26-orange)](https://hardhat.org/)
[![Base L2](https://img.shields.io/badge/Base_L2-Primary-0052FF)](https://base.org/)

## Overview

QuantumCat implements a unique token system inspired by quantum mechanics, specifically Schrödinger's cat thought experiment. The system features:

- **Three ERC-20 tokens**: CATBOX (superposed), LIVECAT, and DEADCAT - fully compatible with all DEXs and CEXs
- **Commit-reveal observation mechanism**: Users commit to observing tokens, which "collapse" into EITHER all LIVECAT OR all DEADCAT (50/50 random) after a delay
- **Cryptographic randomness**: Observation outcomes use high-entropy multi-source randomness (block.timestamp + prevrandao + blockhash + tx context + user entropy)
- **Rebox mechanism**: Combine equal LIVECAT/DEADCAT pairs back into CATBOX (with immutable fee)
- **Fully Immutable**: ZERO admin control - true decentralized memecoin with no upgrades possible
- **🔵 Optimized for [Base L2](https://base.org/)**: Ultra-low fees (~$0.005-0.01 per interaction) make gameplay accessible to everyone
- **Universal Exchange Support**: Standard ERC-20 tokens work with Uniswap, Aerodrome, CEXs, and all DeFi protocols

## Why Base L2? 🔵

**[Base L2](https://base.org/)** is the **only viable network** for QuantumCat's interactive gameplay mechanics:

| Network | Cost Per Play | Viability | Ecosystem |
|---------|--------------|-----------|-----------|
| **Base L2** 🔵 | **$0.005-0.01** | ✅ **Perfect** | Uniswap, Aerodrome, Coinbase |
| Ethereum | $20-50 | ❌ Too expensive | Large but costly |
| Arbitrum | $0.05-0.10 | ⚠️ 5-10x more | Established |
| Optimism | $0.05-0.10 | ⚠️ 5-10x more | Good |
| Polygon | $0.02-0.05 | ⚠️ 2-5x more | Large |

### What is Base L2?

[**Base**](https://base.org/) is a secure, low-cost, builder-friendly Ethereum Layer 2 (L2) blockchain built by Coinbase. As an **optimistic rollup**, Base L2 processes transactions off the main Ethereum chain and settles them back to Ethereum, providing the same security guarantees as Ethereum mainnet while dramatically reducing transaction costs by 99.9%.

**Key Technical Details:**
- **Layer 2 Type**: Optimistic Rollup (OP Stack)
- **Settlement Layer**: Ethereum Mainnet
- **Security Model**: Inherits Ethereum's security
- **Block Time**: ~2 seconds
- **Finality**: 7-day challenge period (typical of optimistic rollups)

[Learn more about how Base L2 works →](https://docs.base.org/)

### Base L2 Advantages for Memecoins:

1. **🚀 Ultra-Low Fees**: $0.005-0.01 transactions enable frequent gameplay without bankruptcy
2. **⚡ 2-Second Blocks**: Near-instant confirmations for observe/rebox cycles
3. **🏦 Coinbase Integration**: 100M+ Coinbase users can onboard seamlessly via Coinbase Wallet
4. **🌊 Thriving Memecoin Culture**: Base L2 has become the premier L2 for memecoins
5. **💱 Uniswap V3 + Aerodrome**: Best-in-class DEXs with deep liquidity
6. **🔒 Ethereum Security**: Inherits Ethereum's security as an optimistic rollup
7. **📈 Rapid Growth**: Fastest growing L2 by user adoption in 2024-2025

**QuantumCat is Base L2-first. Other networks are not recommended.**

## Why ERC-20 Architecture?

**Goal**: Maximize exchange and DEX compatibility.

**Solution**: Three separate ERC-20 tokens + Controller contract.

### ✅ Benefits

| Feature | ERC-20 Architecture |
|---------|---------------------|
| Exchange Listings | ✅ All exchanges support it |
| DEX Support | ✅ Uniswap, Aerodrome, all DEXs |
| Uniswap Pairs | ✅ Native support |
| Wallet Support | ✅ Universal |
| Trading Volume | ✅ High potential |
| **Memecoin Viability** | ✅ **Excellent** |

## Key Features

### 🔒 Security & Decentralization
- **Immutable Contracts**: No upgrades, no admin control, fully decentralized
- **No Owner/Admin**: Zero administrative functions - contracts run autonomously forever
- **Reentrancy Protection**: Guards against reentrancy attacks on all state-changing functions
- **Custom Errors**: Gas-efficient error handling
- **Permanent Parameters**: All settings (fees) locked at deployment

### ⚡ Gas Optimizations
- Optimized storage layout (packed structs)
- Unchecked arithmetic where safe
- Custom errors instead of require strings
- 1000+ compiler runs optimization
- ERC-20 transfer optimizations

### 🧪 Quantum Mechanics
- **Commit-Reveal Pattern**: Prevents manipulation of observation outcomes
- **High-Entropy Randomness**: Combines block.timestamp + prevrandao + blockhash + tx.gasprice + tx.origin + msg.sender + gasleft() + user entropy + refBlock + address(this).balance + chainid
- **Double-Hashing**: Prevents length extension attacks on keccak256 (for outcome split)
- **Defense-in-Depth Security**: Requires validator manipulation AND user secret compromise AND transaction replay to attack
- **Self-Contained**: No external oracles or dependencies required

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│         QuantumCatController.sol                        │
│                                                           │
│  - commitObserve(): User burns CATBOX, stores commitment  │
│  - observe(): Reveals, mints EITHER LIVECAT OR DEADCAT │
│  - forceObserve(): Anyone finalizes stuck observations  │
│  - rebox(): Burns equal pairs, mints CATBOX (minus fee)   │
│  - High-Entropy RNG: multi-source on-chain entropy       │
│  - ZERO admin control, immutable parameters             │
└─────────────────────────────────────────────────────────┘
              │                │                │
           mint/burn        mint/burn        mint/burn
              ▼                ▼                ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ CATBOXToken    │  │ LIVECATToken│  │ DEADCATToken │
    │  (ERC-20)    │  │  (ERC-20)    │  │  (ERC-20)    │
    ├──────────────┤  ├──────────────┤  ├──────────────┤
    │ Superposed   │  │ Observed     │  │ Observed     │
    │ state        │  │ alive        │  │ dead         │
    ├──────────────┤  ├──────────────┤  ├──────────────┤
    │ ✅ Tradeable │  │ ✅ Tradeable │  │ ✅ Tradeable │
    │ ✅ Listable  │  │ ✅ Listable  │  │ ✅ Listable  │
    │ ✅ DEX pairs │  │ ✅ DEX pairs │  │ ✅ DEX pairs │
    └──────────────┘  └──────────────┘  └──────────────┘
```

## Smart Contracts

### 1. CATBOXToken.sol
- Standard ERC-20 token
- Symbol: `CATBOX`, Name: `QuantumCat`
- Only controller can mint/burn
- Initial supply minted to deployer
- Fully tradeable on all platforms

### 2. LIVECATToken.sol
- Standard ERC-20 token
- Symbol: `LIVECAT`, Name: `AliveCat`
- Only controller can mint/burn
- No initial supply (minted via observations)
- Fully tradeable on all platforms

### 3. DEADCATToken.sol
- Standard ERC-20 token
- Symbol: `DEADCAT`, Name: `DeadCat`
- Only controller can mint/burn
- No initial supply (minted via observations)
- Fully tradeable on all platforms

### 4. QuantumCatController.sol
- Manages all quantum mechanics
- Handles commit-reveal observations
- Handles rebox operations
- Mints/burns tokens via controller role
- Immutable, zero admin control

## How It Works

### 1. Observation (CATBOX → LIVECAT OR DEADCAT)

```solidity
// Step 1: Commit observation (burns CATBOX immediately)
bytes32 userEntropy = keccak256(abi.encodePacked("my_secret_salt", block.timestamp));
bytes32 dataHash = keccak256("my_reveal_data");
// Approve controller to burn CATBOX
qcat.approve(controller, 100 ether);
// Commit
controller.commitObserve(100 ether, dataHash, userEntropy);

// Step 2: Wait for REVEAL_DELAY blocks (5 blocks)

// Step 3: Reveal with original data
controller.observe("my_reveal_data");
// Result: 50/50 chance of either:
//   - 100 LIVECAT + 0 DEADCAT, or
//   - 0 LIVECAT + 100 DEADCAT
```

**Parameters:**
- `amount`: Number of CATBOX tokens to observe
- `dataHash`: Commitment hash of reveal data
- `userEntropy`: User-provided 32 bytes of entropy (must be non-zero)
- `data`: Secret data that matches the hash

### 2. Force Observe

If a user fails to reveal their observation, anyone can finalize it after the grace period:

```solidity
// After REVEAL_DELAY + GRACE blocks (5 + 64 = 69 blocks)
controller.forceObserve(userAddress);
```

### 3. Rebox (LIVECAT + DEADCAT → CATBOX)

Combine equal pairs of observed cats back into superposed state:

```solidity
// Approve controller to burn both tokens
alivecat.approve(controller, 10 ether);
deadcat.approve(controller, 10 ether);
// Rebox: Burns 10 LIVECAT + 10 DEADCAT, mints ~9.6 CATBOX (with 4% fee)
controller.rebox(10 ether);
```

### Key Constants

```solidity
uint8  constant REVEAL_DELAY = 5;      // Blocks before observation can be revealed
uint16 constant GRACE        = 64;     // Extra blocks before force observe
uint16 constant DATA_MAX     = 256;    // Max reveal data size
```

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/quantumcat.git
cd quantumcat/solidity

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

## Configuration

Edit `.env` with your settings:

```env
# RPC URLs (Required for deployment)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_RPC_URL=https://mainnet.base.org

# Or use Alchemy for better reliability
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY

# Deployment (Required)
PRIVATE_KEY=your_private_key_here
INITIAL_HOLDER_ADDRESS=0x...
INITIAL_CATBOX_SUPPLY=1000000000000000000000000
REBOX_FEE_BPS=400  # 4% (IMMUTABLE after deployment)

# Basescan API key (Optional, for verification)
BASESCAN_API_KEY=your_api_key
```

## Development

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
# Run all tests
npm test

# Run security tests only
npm run test:security

# Run with gas reporting
npm run test:gas

# Generate coverage report
npm run test:coverage
```

### Linting & Formatting

```bash
# Lint Solidity files
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format all files
npm run format

# Check formatting
npm run format:check
```

### Check Contract Size

```bash
npm run size
```

## Deployment

### Local Development

```bash
# Start local node
npm run node

# In another terminal, deploy
npm run deploy:localhost
```

### Base L2 Sepolia (Testnet) - Recommended for Testing 🧪

Base L2 Sepolia is the testnet for Base L2. Always test here before mainnet deployment.

```bash
# Get testnet ETH from Base L2 Sepolia faucet
# Visit: https://portal.cdp.coinbase.com/products/faucet or https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

npm run deploy:base-sepolia

# Contracts will auto-verify if BASESCAN_API_KEY is set
```

**Cost**: Free testnet ETH (from faucets)

### Base L2 Mainnet - PRIMARY PRODUCTION TARGET 🔵

[Base L2](https://base.org/) is the **recommended and primary network** for QuantumCat deployment.

```bash
# ⚠️ WARNING: Deployment is PERMANENT and IMMUTABLE!
# All parameters (fees) cannot be changed after deployment
# Double-check all .env settings before running!

npm run deploy:base

# Deployment cost: ~$0.10-0.30 on Base L2 (99% cheaper than Ethereum!)
# User operations: ~$0.005-0.01 per commit-reveal cycle

# Contracts will auto-verify if BASESCAN_API_KEY is set
# Get API key at: https://basescan.org/myapikey
```

**Why Base L2 Mainnet:**
- ✅ $0.005-0.01 per transaction (affordable gameplay)
- ✅ 2-second block times (fast confirmations)
- ✅ Coinbase ecosystem integration
- ✅ Uniswap V3 + Aerodrome DEXs available
- ✅ Growing memecoin community
- ✅ 99.9% cheaper than Ethereum

**After Deployment on Base L2:**
1. Verify contracts automatically appear on Basescan
2. Create Uniswap V3 pools: CATBOX/ETH, LIVECAT/ETH, DEADCAT/ETH, LIVECAT/DEADCAT
3. Or use Aerodrome for concentrated liquidity
4. Add liquidity and start trading!
5. Share contract addresses with community

### Alternative Networks

⚠️ **Not recommended for QuantumCat due to higher fees compared to Base L2**

```bash
npm run deploy:arbitrum    # Arbitrum One (~5-10x higher fees than Base L2)
npm run deploy:optimism    # Optimism (~5-10x higher fees than Base L2)
npm run deploy:sepolia     # Ethereum Sepolia (testnet, high fees)
npm run deploy:mainnet     # Ethereum mainnet (extremely expensive, $20-50/tx!)
```

**Why these networks are not recommended:**
- ❌ Ethereum: $20-50 per transaction makes gameplay unaffordable
- ⚠️ Arbitrum/Optimism: 5-10x more expensive than Base L2
- ⚠️ Lower memecoin ecosystem adoption
- ⚠️ Worse onboarding experience compared to Coinbase/Base L2

**Stick with Base L2 for the best user experience!**

### Verify on Basescan (Optional)

Verification happens automatically if `BASESCAN_API_KEY` is set in `.env`. Get one at: https://basescan.org/myapikey

## Creating Liquidity Pools on Base L2

### Option 1: Uniswap V3 (Recommended) 🦄

Uniswap V3 is the most liquid DEX on [Base L2](https://base.org/).

1. Go to https://app.uniswap.org/
2. **Connect wallet** and switch to **Base L2 network** 🔵
3. Navigate to "Pool" → "New Position"
4. **Create pools for:**
   - `CATBOX/ETH` - Primary trading pair (1% fee tier recommended)
   - `CATBOX/USDC` - Stablecoin pair for price stability (0.3% or 1% fee)
   - `LIVECAT/ETH` - Secondary pair (1% fee tier)
   - `DEADCAT/ETH` - Secondary pair (1% fee tier)
   - `LIVECAT/DEADCAT` - Arbitrage pair (0.05% fee tier for tight spreads)
5. Set price ranges (full range for initial liquidity, concentrated for optimization)
6. Add liquidity across all pairs
7. Monitor and adjust ranges as market evolves

**Pool Strategy:**
- Primary pool (`CATBOX/ETH`): Most of your liquidity (~50-60%)
- Arbitrage pool (`ALIVE/DEAD`): Critical for price discovery (~20-30%)
- Secondary pools: Remaining liquidity

### Option 2: Aerodrome (Base L2-Native) 🌊

Aerodrome is Base L2's native liquidity hub with incentives.

1. Go to https://aerodrome.finance/
2. **Connect wallet** (Base L2 network)
3. Navigate to "Liquidity" → "Add Liquidity"
4. **Create pools:**
   - CATBOX/ETH (Volatile pool)
   - LIVECAT/ETH (Volatile pool)
   - DEADCAT/ETH (Volatile pool)
   - LIVECAT/DEADCAT (Volatile pool, tight slippage)
5. Add liquidity
6. Stake LP tokens for AERO rewards (if available)

**Aerodrome Advantages:**
- Native Base L2 DEX with strong incentives
- Lower fees than Ethereum-based DEXs
- Growing TVL and volume
- $AERO token rewards for LPs

### Option 3: Both Uniswap + Aerodrome (Best Strategy)

Split liquidity across both platforms:
- **Uniswap V3**: 60-70% of liquidity (more established, higher volume)
- **Aerodrome**: 30-40% of liquidity (native Base L2, potential for incentives)

This maximizes visibility, volume, and arbitrage efficiency.

## Security Considerations

### Randomness

⚠️ **On-Chain RNG Considerations**: The RNG mixes `blockhash`, `prevrandao`, and transaction/caller context with user entropy. While significantly stronger than blockhash alone, on-chain RNG remains economically manipulable at high stakes. Suitable for:
- Memecoins
- Low-to-medium value applications
- Entertainment purposes

The commit-reveal pattern plus user-provided entropy mitigates manipulation by requiring commitment ahead of time.

### Access Control (Fully Decentralized)

- **Controller**: Only entity that can mint/burn tokens
- **No Owner/Admin**: Controller has ZERO administrative functions
- **Users**: Can commit/observe/rebox their own tokens only
- **Anyone**: Can force-observe stuck observations after grace period (prevents fund locks)

### Immutability Guarantees

✅ **No one can**:
- Pause any contract
- Change fees
- Upgrade contracts
- Freeze user funds
- Mint arbitrary tokens

### Best Practices

1. **Always test on testnet first**
2. **Use hardware wallet for mainnet deployment**
3. **Verify all parameters before deployment** (they're permanent!)
4. **Get professional security audit before mainnet**

## Gas Costs (Approximate)

### On Base L2 (Recommended) 🔵

[Base L2](https://base.org/) offers the **best cost-to-performance ratio** for QuantumCat:

| Operation | Gas Used | USD Cost (Base L2) | Notes |
|-----------|----------|-----------------|-------|
| commitObserve | ~100k gas | **$0.0025** | Burn CATBOX, create pending observation |
| observe | ~120k gas | **$0.003** | Reveal and mint ALIVE or DEAD |
| forceObserve | ~110k gas | **$0.003** | Anyone can finalize stuck observations |
| rebox | ~100k gas | **$0.0025** | Combine equal ALIVE+DEAD pairs into CATBOX |
| **Full Observe Cycle** | **~220k gas** | **~$0.0055** | **Commit + reveal (total gameplay cost)** |
| ERC-20 Transfer | ~50k gas | **$0.00125** | Standard token transfer |
| ERC-20 Approve | ~45k gas | **$0.0011** | Approve controller |

**Assumptions**: 1 gwei gas price, $2500 ETH. Base L2 typically runs 0.01-0.1 gwei.

### Cost Comparison: Base L2 vs Other Networks

| Network | Full Observe Cycle | Rebox | Why Base L2 is Better |
|---------|-------------------|-------|-------------------|
| **Base L2** 🔵 | **$0.005-0.01** | **$0.0025** | ✅ **10-100x cheaper than competitors** |
| Arbitrum | $0.05-0.10 | $0.025-0.05 | 5-10x more expensive |
| Optimism | $0.05-0.10 | $0.025-0.05 | 5-10x more expensive |
| Polygon | $0.02-0.05 | $0.01-0.02 | 2-5x more expensive |
| Ethereum | $20-50 | $10-25 | **1000-5000x more expensive!** |

**Base L2 saves users 99.9% on gas costs compared to Ethereum mainnet!** 🚀

### Real-World Cost Examples on Base L2:

- **Playing 100 times** (observe + rebox cycles): ~$1
- **Trading tokens**: $0.001-0.005 per swap on Uniswap/Aerodrome
- **One week of active gameplay** (20 interactions/day): ~$2.80
- **One month of active gameplay**: ~$12

**On Ethereum mainnet, the same activity would cost $20,000-50,000!**

## Testing

The project includes comprehensive test coverage:

- ✅ 60+ unit tests with 146+ test cases for core functionality
- ✅ Security tests (reentrancy, malicious receivers)
- ✅ Input validation tests
- ✅ Edge case tests
- ✅ ERC-20 compliance tests
- ✅ Randomness and entropy tests
- ✅ Commit-reveal flow tests

```bash
# Run all tests
npm test

# View coverage
npm run test:coverage
```

## Project Structure

```
solidity/
├── contracts/              # Smart contracts
│   ├── CATBOXToken.sol       # ERC-20 CATBOX token
│   ├── LIVECATToken.sol   # ERC-20 LIVECAT token
│   ├── DEADCATToken.sol    # ERC-20 DEADCAT token
│   ├── QuantumCatController.sol  # Controller logic
│   └── mocks/              # Test mocks
├── test/                   # Test files
│   ├── Controller.test.js
│   ├── Controller.comprehensive.test.js
│   └── Controller.security.test.js
├── scripts/                # Deployment scripts
│   ├── deploy.js           # Unified deployment script
│   └── verify.js           # Contract verification
├── abis/                   # Exported ABIs (auto-generated)
├── .env.example            # Environment template
├── DEPLOYMENT.md           # Deployment guide
├── hardhat.config.js       # Hardhat configuration
└── package.json            # Project metadata
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Format code (`npm run format`)
6. Submit a pull request

## Roadmap

- [x] ERC-20 token contracts (CATBOX, LIVECAT, DEADCAT)
- [x] Controller contract with quantum mechanics
- [x] Commit-reveal observation
- [x] Cryptographic random split implementation
- [x] Rebox mechanism
- [x] Immutable architecture (zero admin control)
- [x] High-entropy on-chain RNG (no legacy fallback)
- [x] Comprehensive test suite
- [x] Gas optimizations
- [x] Deployment scripts for Base
- [ ] Professional security audit
- [ ] Subgraph for The Graph
- [ ] Additional quantum-inspired features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

⚠️ **This software is provided "as is" without warranty of any kind.** Use at your own risk. The developers assume no liability for any losses or damages. Always perform thorough testing and get professional audits before deploying to mainnet with real value.

## Resources

- [EIP-20: Token Standard](https://eips.ethereum.org/EIPS/eip-20)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- **[Base L2 Documentation](https://docs.base.org/)** - Learn about Base L2 and how it works 🔵
- **[What is Base?](https://base.org/)** - Official Base L2 homepage
- **[Base Bridge](https://bridge.base.org/)** - Bridge assets to Base L2
- **[Basescan](https://basescan.org/)** - Block explorer for Base L2
- **[Coinbase Wallet](https://www.coinbase.com/wallet)** - Best wallet for Base L2
- [Uniswap on Base L2](https://app.uniswap.org/) - Trade tokens on Base L2
- [Aerodrome Finance](https://aerodrome.finance/) - Base L2-native DEX
- [ERC-20 Architecture Guide](ERC20_ARCHITECTURE.md) - Our architecture docs
- [Schrödinger's Cat](https://en.wikipedia.org/wiki/Schr%C3%B6dinger%27s_cat) - The inspiration

## Support

- GitHub Issues: [Report a bug](https://github.com/your-org/quantumcat/issues)
- Documentation: [Full docs](../README.md)

---

Made with ❤️ by the QuantumCat Team
