# QuantumCat 🐱⚛️

> A quantum-inspired memecoin experiment bringing Schrödinger's cat to the blockchain

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.30-blue)](https://soliditylang.org/)
[![Base](https://img.shields.io/badge/Base-Optimized-0052FF)](https://base.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://react.dev/)

## 🌟 Overview

QuantumCat is a unique blockchain experiment that brings quantum mechanics principles to cryptocurrency through a three-token system inspired by Schrödinger's famous thought experiment. The project implements quantum superposition, observation mechanics, and wave function collapse using smart contracts, creating an engaging memecoin experience with real quantum-inspired gameplay.

### What is QuantumCat?

Just like Schrödinger's cat exists in a superposed state of being both alive and dead until observed, **QCAT tokens exist in quantum superposition** until "observed" on the blockchain. When you observe QCAT tokens, they **collapse** into EITHER all ALIVECAT OR all DEADCAT tokens (never a mix!) through a cryptographically secure random process. You can then **rebox** equal pairs of ALIVECAT + DEADCAT back into QCAT (minus a small fee)!

## 📦 Monorepo Structure

This repository contains three interconnected projects:

### 🔷 1. [Smart Contracts](/solidity) - The Core Protocol

Solidity smart contracts implementing the quantum mechanics on EVM chains.

**ERC-20 Architecture:**

Three separate ERC-20 tokens (QCAT, ALIVECAT, DEADCAT) + QuantumCatController contract for full DEX and exchange compatibility.

**Key Features:**
- ✅ **Exchange Compatible** - Standard ERC-20 tokens work with all DEXs and CEXs
- ✅ **Fully Immutable** - Zero admin control, truly decentralized
- ✅ **Cryptographic Randomness** - Commit-reveal with multi-source entropy
- ✅ **Reentrancy Protected** - Battle-tested security patterns
- ✅ **Base Optimized** - ~$0.01 per transaction (99.9% cheaper than Ethereum)
- ✅ **Comprehensive Tests** - 38+ unit tests with 100% coverage

**[📖 View Smart Contracts Documentation →](solidity/README.md)**

### 🎮 2. [Game](/game) - Schrödinger's Box Arcade

An interactive 8-bit style browser game for engaging with the quantum mechanics.

**Features:**
- 8-bit retro sealed box graphics with authentic cardboard rendering
- Interactive mini-game (catch particles before unboxing)
- Wallet integration with MetaMask
- Demo mode for testing without deployed contracts
- Real-time token balance updates

**[📖 View Game Documentation →](game/README.md)**

### 🌐 3. [Website](/website) - Landing Page

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

# Deploy to Base Sepolia testnet
npm run deploy:base-sepolia

# Deploy to Base mainnet (production)
npm run deploy:base
```

**[→ Full smart contract setup guide](solidity/README.md)**

### 🎮 Game

```bash
cd game

# Simply open index.html in your browser
open index.html

# Or serve with a local server
python -m http.server 8000
# Visit http://localhost:8000
```

**[→ Full game setup guide](game/README.md)**

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
| **QCAT** | Superposed quantum cat - exists in both states simultaneously | Initial supply or rebox equal ALIVE+DEAD pairs (1:1 ratio) |
| **ALIVECAT** | Observed alive state - the cat survived! | Observe QCAT (50% chance - you get 100% ALIVE, 0% DEAD) |
| **DEADCAT** | Observed dead state - the cat didn't make it | Observe QCAT (50% chance - you get 0% ALIVE, 100% DEAD) |

### The Quantum Mechanics

#### 1️⃣ **Observation** (QCAT → ALIVECAT *OR* DEADCAT)

```solidity
// Step 1: Commit to observing (burns QCAT immediately)
bytes32 userEntropy = keccak256(abi.encodePacked("my_secret", block.timestamp));
bytes32 dataHash = keccak256("reveal_data");
quantumCat.commitObserve(100, dataHash, userEntropy);

// Step 2: Wait 5 blocks for randomness

// Step 3: Reveal to collapse the wave function
quantumCat.observe("reveal_data");
// Result: 50/50 chance of:
//   - 100 ALIVECAT + 0 DEADCAT, OR
//   - 0 ALIVECAT + 100 DEADCAT
```

**Note**: Unlike real quantum mechanics, you get *either* all ALIVECAT *or* all DEADCAT, not a mix! This is a 50/50 random outcome that collapses ALL tokens into ONE state.

#### 2️⃣ **Rebox** (ALIVECAT + DEADCAT → QCAT)

**Reboxing requires EQUAL amounts (1:1 ratio) of ALIVECAT and DEADCAT:**

```solidity
// Combine equal pairs back into superposition
// Burns 10 ALIVECAT + 10 DEADCAT → mints 9.65 QCAT (with 3.5% fee)
quantumCat.rebox(10);

// Examples with different amounts:
// 1 ALIVE + 1 DEAD = 0.965 QCAT
// 0.5 ALIVE + 0.5 DEAD = 0.4825 QCAT
// 100 ALIVE + 100 DEAD = 96.5 QCAT
```

The rebox fee (3.5%) creates deflationary pressure on the QCAT supply over time.

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
    ALIVECAT ◄─────── QCAT ───────► DEADCAT
        │             ▲  ▲             │
        │             │  │             │
        └─────────────┘  └─────────────┘
         REBOX (1:1 ratio, minus 5% fee)
```

### Security Model

- **Commit-Reveal Pattern**: Prevents frontrunning and manipulation
- **Multi-Source Randomness**: Combines blockhash + prevrandao + user entropy + tx.origin
- **8-Block Fallback**: Dramatically increases manipulation cost for expired blockhashes
- **Reentrancy Guards**: All state-changing functions protected
- **Zero Admin Control**: No owner, no upgrades, fully autonomous

### Why Base?

QuantumCat is optimized for [Base](https://base.org/), Coinbase's Ethereum L2:

| Network | Transaction Cost | User Experience |
|---------|-----------------|-----------------|
| Ethereum Mainnet | ~$20-50 per observe | ❌ Too expensive for gameplay |
| Base | ~$0.005 per observe | ✅ Perfect for memecoins! |

**Base offers 99.9% lower fees** while maintaining Ethereum's security and decentralization.

## 🛠️ Development

### Project Commands

Each subproject has its own commands. See individual READMEs for details:

- **[Smart Contracts](solidity/README.md)**: `npm test`, `npm run deploy:base`, etc.
- **[Game](game/README.md)**: Open `index.html` or use local server
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

## 📊 Tokenomics

- **Initial Supply**: 662,607,015 QCAT (inspired by Planck's constant)
- **Observation**: Burns QCAT, mints equal amount of EITHER all ALIVECAT OR all DEADCAT (50/50 chance, no supply change)
- **Rebox Mechanics**: Burns equal amounts of ALIVECAT + DEADCAT (1:1 ratio), mints QCAT minus fee
- **Rebox Fee**: 3.5% (configurable at deployment, immutable after)
- **Deflationary Mechanism**: Rebox fee creates gradual QCAT deflation over time (~1.05%/month at 30% monthly volume)
- **No Taxes**: 0% buy/sell tax on tokens

## 🔒 Security & Auditing

### Current Status

- ✅ Comprehensive test suite (38+ tests)
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
- [Game Documentation](game/README.md)
- [Website Documentation](website/README.md)
- [Base Deployment Guide](solidity/DEPLOY_BASE.md) *(if exists)*
- [ERC-20 Architecture Guide](solidity/ERC20_ARCHITECTURE.md) *(if exists)*

### External Resources
- [EIP-20: Token Standard](https://eips.ethereum.org/EIPS/eip-20)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Base Documentation](https://docs.base.org/)
- [Uniswap Documentation](https://docs.uniswap.org/)
- [Schrödinger's Cat (Wikipedia)](https://en.wikipedia.org/wiki/Schr%C3%B6dinger%27s_cat)

### Blockchain Explorers
- [Basescan (Base Mainnet)](https://basescan.org/)
- [Base Sepolia Explorer (Testnet)](https://sepolia.basescan.org/)

### Support & Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/your-org/QuantumCat/issues)
- **Discussions**: [Join community discussions](https://github.com/your-org/QuantumCat/discussions)

## 🎯 Roadmap

### Completed ✅
- [x] ERC-20 architecture for universal DEX/exchange compatibility
- [x] Three separate token contracts (QCAT, ALIVECAT, DEADCAT)
- [x] Controller contract for quantum mechanics
- [x] Commit-reveal observation mechanism
- [x] Cryptographic randomness with multi-source entropy
- [x] Rebox mechanism with deflationary fee
- [x] Comprehensive test suite (38+ tests)
- [x] Gas optimizations
- [x] 8-bit retro game interface
- [x] React landing page with animations
- [x] Deployment scripts for Base and other networks

### In Progress 🚧
- [ ] Professional security audit
- [ ] Additional game mini-games
- [ ] Mobile-optimized game controls

### Future Plans 🔮
- [ ] Subgraph for The Graph protocol
- [ ] NFT integration for special quantum cats
- [ ] Additional quantum-inspired mechanics
- [ ] Multi-player game features
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

