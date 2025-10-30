# QuantumCat 🐱⚛️

> A quantum-inspired ERC-1155 token system with observation mechanics and cryptographic randomness
> **Optimized for Base - Ultra-low fees, perfect for memecoin gameplay**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.30-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.26-orange)](https://hardhat.org/)
[![Base](https://img.shields.io/badge/Base-Optimized-0052FF)](https://base.org/)

## Overview

QuantumCat implements a unique token system inspired by quantum mechanics, specifically Schrödinger's cat thought experiment. The system features:

- **Three token types**: QCAT (superposed), ALIVECAT, and DEADCAT
- **Commit-reveal observation mechanism**: Users commit to observing tokens, which "collapse" into EITHER all ALIVECAT OR all DEADCAT (50/50 random) after a delay
- **Cryptographic randomness**: Observation outcomes use secure multi-source randomness (blockhash + prevrandao + user entropy)
- **Rebox mechanism**: Combine equal ALIVECAT/DEADCAT pairs back into QCAT (with immutable fee)
- **Fully Immutable**: ZERO admin control - true decentralized memecoin with no upgrades possible
- **🔵 Optimized for Base**: Ultra-low fees (~$0.01 per interaction) make gameplay accessible to everyone

## Key Features

### 🔒 Security & Decentralization
- **Immutable Contract**: No upgrades, no admin control, fully decentralized
- **No Owner/Admin**: Zero administrative functions - contract runs autonomously forever
- **Reentrancy Protection**: Guards against reentrancy attacks on all state-changing functions
- **Custom Errors**: Gas-efficient error handling
- **Permanent Parameters**: All settings (URIs, fees) locked at deployment

### ⚡ Gas Optimizations
- Optimized storage layout (packed structs)
- Unchecked arithmetic where safe
- Custom errors instead of require strings
- 1000+ compiler runs optimization

### 🧪 Quantum Mechanics
- **Commit-Reveal Pattern**: Prevents manipulation of observation outcomes
- **Multi-Source Randomness**: Combines blockhash + prevrandao + user-provided entropy + tx.origin for unpredictability
- **Double-Hashing**: Prevents length extension attacks on keccak256
- **8-Block Fallback**: Uses 8 recent blockhashes to dramatically increase manipulation cost
- **Defense-in-Depth Security**: Requires validator manipulation AND user secret compromise AND transaction replay to attack
- **Self-Contained**: No external oracles or dependencies required

## Token Types

| Token ID | Name | Description |
|----------|------|-------------|
| 0 | QCAT | Superposed quantum cat - can be observed |
| 1 | ALIVECAT | Observed alive state |
| 2 | DEADCAT | Observed dead state |

## How It Works

### 1. Observation (QCAT → ALIVECAT OR DEADCAT)

```solidity
// Step 1: Commit observation (burns QCAT immediately)
bytes32 userEntropy = keccak256(abi.encodePacked("my_secret_salt", block.timestamp));
bytes32 dataHash = keccak256("my_reveal_data");
quantumCat.commitObserve(100, dataHash, userEntropy);

// Step 2: Wait for REVEAL_DELAY blocks (5 blocks)

// Step 3: Reveal with original data
bytes memory data = "my_reveal_data";
quantumCat.observe(data);
// Result: 50/50 chance of either:
//   - 100 ALIVECAT + 0 DEADCAT, or
//   - 0 ALIVECAT + 100 DEADCAT
```

**Parameters:**
- `amount`: Number of QCAT tokens to observe
- `dataHash`: Commitment hash of reveal data
- `userEntropy`: User-provided 32 bytes of entropy (must be non-zero)
- `data`: Secret data that matches the hash

### 2. Force Observe

If a user fails to reveal their observation, anyone can finalize it after the grace period:

```solidity
// After REVEAL_DELAY + GRACE blocks (5 + 64 = 69 blocks)
quantumCat.forceObserve(userAddress);
```

### 3. Rebox (ALIVECAT + DEADCAT → QCAT)

Combine equal pairs of observed cats back into superposed state:

```solidity
// Burn 10 ALIVECAT + 10 DEADCAT, mint ~19 QCAT (with 5% fee)
// Note: Requires exactly equal amounts of ALIVECAT and DEADCAT
quantumCat.rebox(10);

// Or rebox all available pairs
quantumCat.reboxMax(0);
```

## Architecture

### Smart Contracts

```
contracts/
├── QuantumCat.sol          # Main immutable memecoin contract
└── mocks/                  # Test mock contracts
    ├── MaliciousReceiver.sol
    ├── MockERC1155Receiver.sol
    └── ReentrancyAttacker.sol
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
cd quantumcat

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

## Configuration

Edit `.env` with your settings (see `DEPLOY_BASE.md` for detailed guide):

```env
# RPC URLs (Required for deployment)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_RPC_URL=https://mainnet.base.org

# Or use Alchemy for better reliability
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY

# Deployment (Required)
PRIVATE_KEY=your_private_key_here
INITIAL_HOLDER_ADDRESS=0x...
INITIAL_QCAT_SUPPLY=1000000000000000000000000
REBOX_FEE_BPS=500  # 5% (IMMUTABLE after deployment)

# Basescan API key (Optional, for verification)
BASESCAN_API_KEY=your_api_key
```

⚠️ **CRITICAL**: Before mainnet deployment, update IPFS URIs in `contracts/QuantumCat.sol` (lines ~141, 145, 149)!

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

**📘 For detailed Base deployment guide, see [DEPLOY_BASE.md](DEPLOY_BASE.md)**

### Local Development

```bash
# Start local node
npm run node

# In another terminal, deploy
npm run deploy:localhost
```

### Base Sepolia (Testnet) - Recommended for Testing

```bash
# Get testnet ETH: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
npm run deploy:base-sepolia
```

### Base Mainnet - Recommended for Production 🔵

```bash
# ⚠️ WARNING: Deployment is PERMANENT and IMMUTABLE!
# All parameters (URIs, fees) cannot be changed after deployment
# Double-check all .env settings and IPFS URIs in contract before running!
npm run deploy:base

# Deployment cost: ~$0.10-0.30 on Base
# User operations: ~$0.01 per commit-reveal cycle
```

### Alternative Networks

```bash
npm run deploy:arbitrum    # Arbitrum One
npm run deploy:optimism    # Optimism
npm run deploy:sepolia     # Ethereum Sepolia (testnet)
npm run deploy:mainnet     # Ethereum mainnet (expensive!)
```

### Verify on Basescan (Optional)

Verification happens automatically if `BASESCAN_API_KEY` is set in `.env`. Get one at: https://basescan.org/myapikey

## Security Considerations

### Randomness

⚠️ **Blockhash RNG Limitations**: The RNG uses `blockhash()` which can be manipulated by miners/validators within constraints. Suitable for:
- Memecoins
- Low-to-medium value applications
- Entertainment purposes

The commit-reveal pattern mitigates manipulation by requiring commitment to future blockhash.

### Access Control (Fully Decentralized)

- **No Owner/Admin**: Contract has ZERO administrative functions
- **Users**: Can commit/observe/rebox their own tokens only
- **Anyone**: Can force-observe stuck observations after grace period (prevents fund locks)

### Immutability Guarantees

✅ **No one can**:
- Pause the contract
- Change token URIs
- Modify rebox fees
- Upgrade the contract
- Freeze user funds

### Best Practices

1. **Always test on testnet first**
2. **Use hardware wallet for mainnet deployment**
3. **Verify all parameters before deployment** (they're permanent!)
4. **Get professional security audit before mainnet**
5. **Use IPFS or on-chain URIs for metadata** (avoid centralized APIs)

## Gas Costs (Approximate)

### On Base (Recommended) 🔵

| Operation | Gas Cost | USD (1 gwei, $2500 ETH) |
|-----------|----------|-------------------------|
| commitObserve | ~80k | ~$0.002 |
| observe | ~90k | ~$0.0025 |
| forceObserve | ~95k | ~$0.003 |
| rebox | ~70k | ~$0.002 |
| reboxMax | ~75k | ~$0.002 |
| safeTransferFrom | ~60k | ~$0.0015 |
| **Full Observe Cycle** | **~170k** | **~$0.005** |

### On Ethereum Mainnet (Not Recommended)

| Operation | USD (30 gwei, $2500 ETH) |
|-----------|--------------------------|
| Full Observe Cycle | **$20-50** |

**Base saves users 99.9% on gas costs!** 🚀

## Testing

The project includes comprehensive test coverage:

- ✅ 38+ unit tests for core functionality
- ✅ Security tests (reentrancy, malicious receivers)
- ✅ Input validation tests
- ✅ Edge case tests
- ✅ ERC-1155 compliance tests
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
qcat/
├── contracts/              # Smart contracts
│   ├── QuantumCat.sol     # Main immutable contract
│   └── mocks/             # Test mocks
├── test/                   # Test files
│   ├── QuantumCat.test.js
│   └── QuantumCat.security.test.js
├── scripts/                # Deployment scripts
│   └── deploy.js          # Immutable deployment
├── deployments/            # Deployment artifacts
├── .env.example            # Environment template
├── CLAUDE.md               # AI assistant guide
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

- [x] Core ERC-1155 functionality
- [x] Commit-reveal observation
- [x] Cryptographic random split implementation
- [x] Rebox mechanism
- [x] Immutable memecoin architecture (zero admin control)
- [x] Built-in blockhash RNG
- [x] Comprehensive test suite
- [x] Gas optimizations
- [x] Deployment scripts
- [ ] Frontend dApp
- [ ] Subgraph for The Graph
- [ ] Additional quantum-inspired features
- [ ] Community governance (external contracts)
- [ ] Professional security audit

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

⚠️ **This software is provided "as is" without warranty of any kind.** Use at your own risk. The developers assume no liability for any losses or damages. Always perform thorough testing and get professional audits before deploying to mainnet with real value.

## Resources

- [EIP-1155: Multi Token Standard](https://eips.ethereum.org/EIPS/eip-1155)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Schrödinger's Cat](https://en.wikipedia.org/wiki/Schr%C3%B6dinger%27s_cat)

## Support

- GitHub Issues: [Report a bug](https://github.com/your-org/quantumcat/issues)
- Documentation: [Full docs](https://docs.quantumcat.xyz)
- Discord: [Join community](https://discord.gg/quantumcat)

---

Made with ❤️ by the QuantumCat Team
