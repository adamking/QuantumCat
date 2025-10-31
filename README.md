# QuantumCat 🐱⚛️

> A quantum-inspired memecoin experiment bringing Schrödinger's cat to the blockchain

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.30-blue)](https://soliditylang.org/)
[![Base L2](https://img.shields.io/badge/Base_L2-Optimized-0052FF)](https://base.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://react.dev/)

## 🌟 Overview

QuantumCat is a unique blockchain experiment that brings quantum mechanics principles to cryptocurrency through a three-token system inspired by Schrödinger's famous thought experiment. The project implements quantum superposition, observation mechanics, and wave function collapse using smart contracts, creating an engaging memecoin experience with real quantum-inspired gameplay.

### What is QuantumCat?

Just like Schrödinger's cat exists in a superposed state of being both alive and dead until observed, **CATBOX tokens exist in quantum superposition** until "observed" on the blockchain. When you observe CATBOX tokens, they **collapse** into EITHER all LIVECAT OR all DEADCAT tokens (never a mix!) through a cryptographically secure random process. You can then **rebox** equal pairs of LIVECAT + DEADCAT back into CATBOX (minus a small fee)!

## 📦 Monorepo Structure

This repository contains three interconnected projects:

### 🔷 1. [Smart Contracts](/solidity) - The Core Protocol

Solidity smart contracts implementing the quantum mechanics on Base L2 (and other EVM chains).

**ERC-20 Architecture:**

Three separate ERC-20 tokens (CATBOX, LIVECAT, DEADCAT) + QuantumCatController contract for full DEX and exchange compatibility.

**Key Features:**
- ✅ **Exchange Compatible** - Standard ERC-20 tokens work with all DEXs and CEXs
- ✅ **Fully Immutable** - Zero admin control, truly decentralized
- ✅ **Cryptographic Randomness** - Commit-reveal with high-entropy multi-source randomness
- ✅ **Reentrancy Protected** - Battle-tested security patterns
- ✅ **Base L2 Optimized** - ~$0.01 per transaction (99.9% cheaper than Ethereum)
- ✅ **Comprehensive Tests** - 60+ unit and security tests with 100% controller coverage

**[📖 View Smart Contracts Documentation →](solidity/README.md)**

### 🌐 2. [Website](/website) - Landing Page

A beautiful React landing page explaining tokenomics and mechanics.

**Features:**
- Interactive quantum cat animation (superposition visualization)
- Complete tokenomics breakdown
- Glitch effects and procedural sound generation
- Step-by-step buying guide
- Responsive design with mobile support

**[📖 View Website Documentation →](website/README.md)**

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask or another Web3 wallet
- Git

### Clone & Setup

```bash
# Clone the repository
git clone https://github.com/your-org/QuantumCat.git
cd QuantumCat
```

### 💡 Deployment

**Production Deployment**:
- 662.6M supply, 4% rebox fee, immutable forever
- Use: `npm run deploy:production` (Base mainnet with production mode)
- ⚠️ Once deployed, NO changes possible

**Testing Deployment**:
- Configurable parameters for testing
- Use: `npm run deploy:base-sepolia` (testnet)

### 🔷 Smart Contracts

```bash
cd solidity

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Then compile contracts
npm run compile

# Run tests
npm test

# Deploy to Base L2 Sepolia testnet
npm run deploy:base-sepolia

# Deploy to Base L2 mainnet (production) 🔵 RECOMMENDED
npm run deploy:base
```

**[→ Full smart contract setup guide](solidity/README.md)**

### 🌐 Website

```bash
cd website

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

**[→ Full website setup guide](website/README.md)**

## 🧪 How It Works

### The Three-Token System

| Token | Description | How to Get |
|-------|-------------|------------|
| **CATBOX** | Superposed quantum cat - exists in both states simultaneously | Initial supply or rebox equal ALIVE+DEAD pairs (1:1 ratio) |
| **LIVECAT** | Observed alive state - the cat survived! | Observe CATBOX (50% chance - you get 100% ALIVE, 0% DEAD) |
| **DEADCAT** | Observed dead state - the cat didn't make it | Observe CATBOX (50% chance - you get 0% ALIVE, 100% DEAD) |

### The Quantum Mechanics

#### 1️⃣ **Observation** (CATBOX → LIVECAT *OR* DEADCAT)

```solidity
// Step 1: Commit to observing (burns CATBOX immediately)
bytes32 userEntropy = keccak256(abi.encodePacked("my_secret", block.timestamp));
bytes32 dataHash = keccak256("reveal_data");
quantumCat.commitObserve(100, dataHash, userEntropy);

// Step 2: Wait 5 blocks for randomness

// Step 3: Reveal to collapse the wave function
quantumCat.observe("reveal_data");
// Result: 50/50 chance of:
//   - 100 LIVECAT + 0 DEADCAT, OR
//   - 0 LIVECAT + 100 DEADCAT
```

**Note**: Unlike real quantum mechanics, you get *either* all LIVECAT *or* all DEADCAT, not a mix! This is a 50/50 random outcome that collapses ALL tokens into ONE state.

#### 2️⃣ **Rebox** (LIVECAT + DEADCAT → CATBOX)

**Reboxing requires EQUAL amounts (1:1 ratio) of LIVECAT and DEADCAT:**

```solidity
// Combine equal pairs back into superposition
// Burns 10 LIVECAT + 10 DEADCAT → mints 9.6 CATBOX (with 4% fee)
quantumCat.rebox(10);

// Examples with different amounts:
// 1 ALIVE + 1 DEAD = 0.96 CATBOX
// 0.5 ALIVE + 0.5 DEAD = 0.48 CATBOX
// 100 ALIVE + 100 DEAD = 96 CATBOX
```

The rebox fee (immutable 4%) creates deflationary pressure on the CATBOX supply over time.

#### 3️⃣ **Force Observe** (Failsafe Mechanism)

If someone commits to observe but never reveals, anyone can finalize their observation after 69 blocks to prevent fund locking.

## 🏗️ Architecture

### Token Flow Diagram

```
                    OBSERVE (50/50)
                 → ALL ALIVE or ALL DEAD
        ┌──────────────────────────────────┐
        │                                  │
        ▼                                  ▼
    LIVECAT ◄─────── CATBOX ───────► DEADCAT
        │             ▲  ▲             │
        │             │  │             │
        └─────────────┘  └─────────────┘
         REBOX (1:1 ratio, minus 4% fee)
```

### Security Model

- **Commit-Reveal Pattern**: Prevents frontrunning and manipulation
- **High-Entropy Randomness**: Combines block.timestamp + prevrandao + blockhash + tx.gasprice + tx.origin + msg.sender + gasleft() + user entropy + refBlock + address(this).balance + chainid
- **Reentrancy Guards**: All state-changing functions protected
- **Zero Admin Control**: No owner, no upgrades, fully autonomous

### Why Base L2? 🔵

QuantumCat is **built exclusively for** [**Base L2**](https://base.org/), Coinbase's Ethereum Layer 2 blockchain:

| Network | Transaction Cost | User Experience | Status |
|---------|-----------------|-----------------|--------|
| **Base L2** | **~$0.005 per observe** | ✅ **Perfect for memecoins!** | **✅ PRIMARY** |
| Ethereum Mainnet | ~$20-50 per observe | ❌ Too expensive for gameplay | ❌ Not Viable |
| Other L2s | ~$0.01-0.05 | ⚠️ Higher than Base L2 | Secondary |

**[Base L2](https://base.org/)** offers 99.9% lower fees than Ethereum mainnet while maintaining security and full EVM compatibility.

#### Base L2 Advantages:
- 🚀 **Ultra-Low Fees**: $0.005-0.01 per transaction makes gameplay affordable for everyone
- ⚡ **2-Second Blocks**: Near-instant transaction confirmations
- 🏦 **Coinbase Ecosystem**: Easy onramps via Coinbase and integrated wallets
- 🌊 **Growing DeFi**: Uniswap, Aerodrome, and thriving memecoin culture
- 🔒 **Ethereum Security**: Inherits Ethereum's security as an L2 rollup (optimistic rollup)
- 💙 **Massive User Base**: Coinbase's 100M+ users have easy access

**What is Base L2?** [Base](https://base.org/) is a secure, low-cost, builder-friendly Ethereum Layer 2 (L2) solution built by Coinbase. As an optimistic rollup, Base L2 processes transactions off-chain and settles them on Ethereum, providing the same security guarantees as Ethereum mainnet while dramatically reducing costs. [Learn more about Base L2 →](https://docs.base.org/)

## 🛠️ Development

### Project Commands

Each subproject has its own commands. See individual READMEs for details:

- **[Smart Contracts](solidity/README.md)**: `npm test`, `npm run deploy:base`, etc.
- **[Website](website/README.md)**: `npm run dev`, `npm run build`, etc.

### Testing

```bash
# Test smart contracts (from solidity/)
cd solidity
npm test                    # Run all tests
npm run test:security       # Security-specific tests
npm run test:coverage       # Generate coverage report

# Test website (from website/)
cd website
npm run check              # TypeScript type checking
npm run build              # Production build test
```

### Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new functionality
4. Ensure all tests pass
5. Format code (`npm run format` in respective directories)
6. Submit a pull request

## 📊 Tokenomics - Renounced & Immutable

- **Initial Supply**: 662,607,015 CATBOX (inspired by Planck's constant)
- **Observation**: Burns CATBOX, mints equal amount of EITHER all LIVECAT OR all DEADCAT (50/50 chance, no supply change)
- **Rebox Mechanics**: Burns equal amounts of LIVECAT + DEADCAT (1:1 ratio), mints CATBOX minus fee
- **Rebox Fee**: 4% (immutable after deployment)
- **Deflationary Mechanism**: Rebox fee creates gradual CATBOX deflation (~0.84%/month at 30% monthly volume)
- **No Taxes**: 0% buy/sell tax on tokens
- **Sustainability**: 7-10 year runway with natural market balance
- **Distribution**: 60% liquidity, 20% community, 10% team, 10% reserve

## 🔒 Security & Auditing

### Current Status

- ✅ Comprehensive test suite (60+ tests with 146+ test cases)
- ✅ Reentrancy protection on all functions
- ✅ Input validation and bounds checking
- ✅ Custom errors for gas efficiency
- ⚠️ **Not professionally audited yet**

### Security Features

- **Immutable Contracts**: Cannot be upgraded or modified after deployment
- **No Admin Functions**: Zero owner privileges, fully decentralized
- **Defense-in-Depth RNG**: Multiple entropy sources prevent manipulation
- **Reentrancy Guards**: OpenZeppelin's ReentrancyGuard on all state changes
- **Bounded Parameters**: All inputs validated with max bounds

### Recommendations

⚠️ **Before mainnet deployment with significant value:**
1. Get a professional security audit from firms like Trail of Bits, ConsenSys Diligence, or OpenZeppelin
2. Test extensively on testnets (Base Sepolia recommended)
3. Start with low liquidity to limit risk
4. Monitor contract behavior closely in early days

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

**QuantumCat is experimental software provided "as is" without warranty of any kind.**

- This is a memecoin experiment for entertainment purposes
- No intrinsic value or expectation of financial return
- Cryptocurrency investments are highly speculative and volatile
- Never invest more than you can afford to lose completely
- The randomness mechanism uses blockhash which has known limitations
- Suitable for low-to-medium value applications and memecoins
- NOT suitable for high-value applications without external oracle integration

Just like Schrödinger's cat, your investment may exist in multiple states simultaneously. Observing your wallet may collapse the wave function. Past performance is not indicative of future results. 📦🐱

## 🔗 Resources

### Documentation
- [Smart Contracts Documentation](solidity/README.md)
- [Website Documentation](website/README.md)
- [Deployment Guide](solidity/DEPLOYMENT.md)

### External Resources
- [Base L2 Documentation](https://docs.base.org/) - **Learn about Base L2 and how it works**
- [What is Base?](https://base.org/) - Official Base L2 homepage
- [Base Bridge](https://bridge.base.org/) - Bridge assets to Base L2
- [Coinbase Wallet](https://www.coinbase.com/wallet) - Best wallet for Base L2
- [EIP-20: Token Standard](https://eips.ethereum.org/EIPS/eip-20)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Uniswap on Base L2](https://app.uniswap.org/) - Trade on Base L2
- [Aerodrome Finance](https://aerodrome.finance/) - Base L2-native DEX
- [Schrödinger's Cat (Wikipedia)](https://en.wikipedia.org/wiki/Schr%C3%B6dinger%27s_cat)

### Blockchain Explorers
- [Basescan (Base L2 Mainnet)](https://basescan.org/) - **Primary Explorer**
- [Base L2 Sepolia Explorer (Testnet)](https://sepolia.basescan.org/)
- [Base Bridge](https://bridge.base.org/) - Bridge assets to Base L2

### Support & Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/your-org/QuantumCat/issues)
- **Discussions**: [Join community discussions](https://github.com/your-org/QuantumCat/discussions)

## 🎯 Roadmap

### Completed ✅
- [x] ERC-20 architecture for universal DEX/exchange compatibility
- [x] Three separate token contracts (CATBOX, LIVECAT, DEADCAT)
- [x] Controller contract for quantum mechanics
- [x] Commit-reveal observation mechanism
- [x] Cryptographic randomness with multi-source entropy
- [x] Rebox mechanism with deflationary fee
- [x] Comprehensive test suite (60+ tests with 146+ test cases)
- [x] Gas optimizations
- [x] React landing page with animations
- [x] Deployment scripts for Base and other networks

### In Progress 🚧
- [ ] Professional security audit
- [ ] Web3 wallet integration for website
- [ ] Mobile-optimized web interface

### Future Plans 🔮
- [ ] Subgraph for The Graph protocol
- [ ] NFT integration for special quantum cats
- [ ] Additional quantum-inspired mechanics
- [ ] Community governance mechanisms (via external contracts)
- [ ] Uniswap v2/v3 liquidity pool guides
- [ ] Trading bot integration examples

## 🙏 Acknowledgments

Built with:
- [OpenZeppelin Contracts](https://openzeppelin.com/contracts/) - Secure smart contract library
- [Hardhat](https://hardhat.org/) - Ethereum development environment
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Ethers.js](https://docs.ethers.org/) - Ethereum library
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

Inspired by:
- Erwin Schrödinger's famous thought experiment
- The quantum mechanics community
- The memecoin culture

---

<div align="center">

**Made with ❤️ and quantum uncertainty**

*"Until you observe it, the cat is both alive and dead... and so is your portfolio."* 📦🐱

⚛️ **Stay Superposed** ⚛️

</div>

