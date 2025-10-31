# QuantumCat Deployment Guide

Complete guide for deploying the QuantumCat three-token system to any EVM network.

## Table of Contents
- [Quick Start](#quick-start)
- [Deployment Modes](#deployment-modes)
- [Network Commands](#network-commands)
- [Configuration](#configuration)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Testing (Testnet)
```bash
# Deploy to Base Sepolia testnet
cd solidity
npm run deploy:base-sepolia
```

### Production (Mainnet - IMMUTABLE!)
```bash
# Deploy to Base mainnet with production settings
cd solidity
npm run deploy:production
```

> ⚠️ **Production deployments are PERMANENT and IMMUTABLE**

---

## Deployment Script

### Unified Script: `scripts/deploy.js`

Single script handles both testing and production deployments.

**What it deploys:**
1. **QCAT Token** (ERC-20) - Initial supply: 662,607,015
2. **ALIVECAT Token** (ERC-20) - Initial supply: 0
3. **DEADCAT Token** (ERC-20) - Initial supply: 0
4. **QuantumCatController** - Manages observe & rebox mechanics

**Key features:**
- Mode-based configuration (testing vs production)
- Automatic contract verification
- Deployment info saved to JSON
- Safety confirmations for mainnet
- Network auto-detection

---

## Deployment Modes

### 1. Testing Mode (Default)

**Use for:** Testnets, development, experimentation

**Features:**
- Configurable via environment variables
- Custom supply and fee parameters
- Shorter confirmation delays
- Labeled as "test" in deployment records

**Example:**
```bash
# Deploy with defaults (662.6M supply, 4% fee)
npm run deploy:base-sepolia

# Deploy with custom parameters
INITIAL_QCAT_SUPPLY=1000000 \
REBOX_FEE_BPS=500 \
npm run deploy:base-sepolia
```

**Environment Variables:**
```bash
DEPLOYMENT_MODE=testing  # Optional, this is default
INITIAL_HOLDER_ADDRESS=0x...  # Optional, defaults to deployer
INITIAL_QCAT_SUPPLY=662607015  # Optional, in whole tokens
REBOX_FEE_BPS=400  # Optional, 400 = 4%
SKIP_CONFIRMATION=false  # Optional
```

---

### 2. Production Mode

**Use for:** Final mainnet deployment

**Features:**
- Hardcoded optimal values (662.6M supply, 4% fee)
- 15-second confirmation delay
- Labeled as "production" and "renounced"
- Detailed distribution calculations
- **IMMUTABLE** - cannot be changed!

**Example:**
```bash
# Production deployment to Base mainnet
DEPLOYMENT_MODE=production npm run deploy:production
```

**Hardcoded Production Values:**
```javascript
Initial Supply: 662,607,015 QCAT
Rebox Fee: 4% (400 basis points)
Monthly Deflation: ~0.84% at 30% volume
Network: Base L2 (recommended)
```

**Environment Variables:**
```bash
DEPLOYMENT_MODE=production  # REQUIRED
INITIAL_HOLDER_ADDRESS=0x...  # Optional, defaults to deployer
BASESCAN_API_KEY=...  # Required for verification
SKIP_CONFIRMATION=false  # NOT recommended
```

> 🚨 **Production mode ignores custom supply/fee parameters!**

---

## Network Commands

| Command | Network | Chain ID | Mode | Gas Cost |
|---------|---------|----------|------|----------|
| `npm run deploy:localhost` | Local | 31337 | Testing | Free |
| `npm run deploy:base-sepolia` | Base Sepolia | 84532 | Testing | Free (testnet) |
| `npm run deploy:base` | Base Mainnet | 8453 | Testing | ~$0.50 |
| `npm run deploy:production` | Base Mainnet | 8453 | **Production** | ~$0.50 |
| `npm run deploy:sepolia` | Sepolia | 11155111 | Testing | Free (testnet) |
| `npm run deploy:mainnet` | Ethereum | 1 | Testing | ~$50-200 |

> 💡 **Recommended:** Use Base L2 for ultra-low fees (~$0.005 per transaction)

---

## Configuration

### Environment Setup

Create `.env` file in `/solidity/`:

```bash
# ============================================
# Required for ALL deployments
# ============================================
PRIVATE_KEY=your_private_key_here

# ============================================
# Optional: Custom Parameters (Testing Mode)
# ============================================
INITIAL_HOLDER_ADDRESS=0x...
INITIAL_QCAT_SUPPLY=662607015
REBOX_FEE_BPS=400

# ============================================
# Optional: Skip Confirmations
# ============================================
# NOT recommended for mainnet!
SKIP_CONFIRMATION=false

# ============================================
# Required for Contract Verification
# ============================================
BASESCAN_API_KEY=your_basescan_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# ============================================
# Optional: Custom RPC URLs
# ============================================
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
MAINNET_RPC_URL=https://eth.llamarpc.com
SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

### Getting API Keys

**Basescan (for Base network):**
1. Visit https://basescan.org/myapikey
2. Create account and generate API key
3. Add to `.env` as `BASESCAN_API_KEY`

**Etherscan (for Ethereum):**
1. Visit https://etherscan.io/myapikey
2. Create account and generate API key
3. Add to `.env` as `ETHERSCAN_API_KEY`

---

## Deployment Process

### Step-by-Step Flow

```
1. Pre-Deployment Checks
   ├── Verify deployer balance
   ├── Confirm network is correct
   └── Review parameters

2. Deploy Tokens
   ├── Compute controller address (CREATE)
   ├── Deploy QCAT Token
   ├── Deploy ALIVECAT Token
   └── Deploy DEADCAT Token

3. Deploy Controller
   ├── Deploy QuantumCatController
   └── Verify controller address matches

4. Verify Contracts
   ├── Wait for confirmations (6 blocks)
   ├── Verify QCAT on explorer
   ├── Verify ALIVECAT on explorer
   ├── Verify DEADCAT on explorer
   └── Verify Controller on explorer

5. Save Deployment Info
   └── Write JSON to deployments/ directory
```

### Deployment Output

**Saved to:** `solidity/deployments/`

**File naming:**
- Testing: `{network}-test-{timestamp}.json`
- Production: `{network}-production-{timestamp}.json`

**Example output:**
```json
{
  "mode": "production",
  "network": "base",
  "chainId": "8453",
  "deployer": "0x...",
  "timestamp": "2024-10-31T...",
  "contracts": {
    "qcat": "0x...",
    "alivecat": "0x...",
    "deadcat": "0x...",
    "controller": "0x..."
  },
  "parameters": {
    "initialSupply": "662607015.0",
    "reboxFeeBps": 400,
    "reboxFeePercent": "4.00%",
    "immutable": true,
    "renounced": true
  },
  "distribution": {
    "liquidity": "60% (397,564,209 QCAT)",
    "community": "20% (132,521,403 QCAT)",
    "team": "10% (66,260,701 QCAT)",
    "reserve": "10% (66,260,702 QCAT)"
  },
  "links": {
    "qcat": "https://basescan.org/token/0x...",
    "alivecat": "https://basescan.org/token/0x...",
    "deadcat": "https://basescan.org/token/0x...",
    "controller": "https://basescan.org/address/0x..."
  }
}
```

---

## Post-Deployment

### For Testing Deployments

1. **Test Functions**
   ```bash
   # Test observation
   npx hardhat run scripts/test-observe.js --network baseSepolia
   
   # Test rebox
   npx hardhat run scripts/test-rebox.js --network baseSepolia
   ```

2. **Create Test Liquidity**
   - Add small amounts to Uniswap testnet
   - Test swaps and price discovery
   - Verify arbitrage mechanics

3. **Verify Mechanics**
   - Commit-reveal observation works
   - Rebox calculates fees correctly
   - State changes are as expected

---

### For Production Deployments

#### ⏰ First 24 Hours (Critical!)

**1. Add Liquidity to Base DEXs**

```
Total: 397,564,209 QCAT (60% of supply)

├── Uniswap V3 (75%): 298,173,157 QCAT
│   └── QCAT/ETH pair (1% fee tier)
│
└── Aerodrome (25%): 99,391,052 QCAT
    └── QCAT/USDC pair (0.3% fee tier)
```

**Commands:**
```bash
# Add to Uniswap V3 on Base
# Visit: https://app.uniswap.org/
# Select Base network
# Add liquidity to QCAT/ETH pair

# Add to Aerodrome on Base
# Visit: https://aerodrome.finance/
# Add liquidity to QCAT/USDC pair
```

**2. Lock Liquidity (CRITICAL!)**

Burn or send LP tokens to burn address:
```
Burn Address: 0x000000000000000000000000000000000000dEaD
```

This makes liquidity **permanent** and **irremovable**.

**3. Distribute Tokens**

```javascript
// 20% Community Rewards: 132,521,403 QCAT
// Airdrops, liquidity mining, trading competitions

// 10% Team: 66,260,701 QCAT
// Deploy timelock vesting contract (12 months linear)

// 10% Strategic Reserve: 66,260,702 QCAT
// Multisig wallet for CEX listings, partnerships
```

**4. Set Up Vesting**

Deploy timelock contract for team allocation:
```bash
npx hardhat run scripts/deploy-vesting.js --network base
```

**5. Announce Renouncement**

- Publish contract addresses
- Verify on Basescan
- Announce full decentralization
- Share deployment JSON publicly

---

## Token Distribution Details

### Total Supply: 662,607,015 QCAT

| Allocation | Percentage | Amount (QCAT) | Purpose |
|------------|------------|---------------|---------|
| **Liquidity Pools** | 60% | 397,564,209 | Uniswap + Aerodrome on Base |
| **Community Rewards** | 20% | 132,521,403 | Liquidity mining, airdrops, events |
| **Team** | 10% | 66,260,701 | 12-month linear vesting |
| **Strategic Reserve** | 10% | 66,260,702 | CEX listings, partnerships |

### Liquidity Breakdown

**60% Total Liquidity (397,564,209 QCAT)**

```
Uniswap V3 (75%): 298,173,157 QCAT
├── QCAT/ETH: Primary trading pair (1% fee)
└── QCAT/USDC: Stablecoin pair (0.3% fee)

Aerodrome (25%): 99,391,052 QCAT
├── QCAT/USDC: Base-native DEX (0.3% fee)
└── ALIVE/DEAD: Arbitrage pair (0.05% fee)
```

---

## Troubleshooting

### Deployment Failures

**Error: Insufficient funds**
```bash
# Check deployer balance
npx hardhat run scripts/check-balance.js --network base

# Base deployment needs ~0.005 ETH
# Ethereum deployment needs ~0.5 ETH
```

**Error: Controller address mismatch**
```
This indicates a nonce issue or concurrent transaction.
DO NOT PROCEED - restart deployment from fresh nonce.
```

**Error: Already deployed**
```bash
# Use a different deployer address or
# Continue with existing deployment
```

---

### Verification Failures

**Error: API key missing**
```bash
# Add to .env
BASESCAN_API_KEY=your_key_here
```

**Error: Timeout during verification**
```bash
# Wait a few blocks and verify manually
npm run verify
```

**Error: Already verified**
```
This is fine - contract is already verified!
```

---

### Post-Deployment Issues

**Can't add liquidity**
- Ensure you have both tokens
- Check token approvals
- Verify contract addresses

**Tokens not showing in wallet**
- Add token address manually
- Use Basescan to verify deployment
- Check correct network (Base vs Ethereum)

**Rebox not working**
- Need EQUAL amounts of ALIVE + DEAD
- Check token balances
- Verify approvals to controller

---

## Security Checklist

### Before Production Deployment

- [ ] Test extensively on testnets
- [ ] Verify all contract code
- [ ] Review deployment parameters
- [ ] Use hardware wallet for mainnet
- [ ] Have sufficient ETH for gas
- [ ] API keys configured for verification
- [ ] Team ready for post-deployment tasks

### After Production Deployment

- [ ] Verify all contracts on Basescan
- [ ] Check initial token distribution
- [ ] Add liquidity within 24 hours
- [ ] Burn/lock LP tokens immediately
- [ ] Set up team vesting
- [ ] Deploy multisig for reserve
- [ ] Announce contract addresses
- [ ] Monitor initial trading activity

---

## Production Deployment Characteristics

### Immutability

- ✅ No owner or admin functions
- ✅ No upgradeable proxies
- ✅ Parameters hardcoded at deployment
- ✅ Cannot pause or freeze
- ✅ Cannot modify supply or fees
- ✅ Fully autonomous and trustless

### Parameters (Hardcoded)

```javascript
Total Supply: 662,607,015 QCAT
Rebox Fee: 4% (400 basis points)
Reveal Delay: 5 blocks
Grace Period: 64 blocks
Max Data Size: 256 bytes
```

### Economics

```
Deflationary Rate: ~0.84% per month at 30% volume
Sustainability: 7-10 year runway with natural balance
Price Relationship: P_QCAT ≈ (P_ALIVE + P_DEAD) / 2.07
```

---

## Migration from Old Scripts

### Old Scripts (Deprecated)

- ❌ `deploy-erc20.js.deprecated`
- ❌ `deploy-renounced.js.deprecated`

### New Script (Active)

- ✅ `deploy.js`

### Command Migration

| Old | New |
|-----|-----|
| `npm run deploy:renounced` | `npm run deploy:production` |
| All other commands | No change |

---

## Quick Reference

### Essential Commands

```bash
# Testing
npm run deploy:base-sepolia

# Production
npm run deploy:production

# Verify contracts
npm run verify

# Check deployment
cat deployments/base-production-*.json
```

### Important Addresses

- **Base Mainnet ChainID:** 8453
- **Base Sepolia ChainID:** 84532
- **Burn Address:** 0x000000000000000000000000000000000000dEaD
- **Zero Address:** 0x0000000000000000000000000000000000000000

### Resources

- Base Docs: https://docs.base.org/
- Basescan: https://basescan.org/
- Uniswap: https://app.uniswap.org/
- Aerodrome: https://aerodrome.finance/

---

## Support

- **Documentation:** [/solidity/README.md](README.md)
- **Issues:** https://github.com/your-org/QuantumCat/issues
- **Discussions:** https://github.com/your-org/QuantumCat/discussions

---

**Remember:** Production deployments are **PERMANENT**. Test thoroughly first! 🚀

