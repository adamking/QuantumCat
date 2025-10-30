# 🎯 QuantumCat ERC-20 Architecture

## Why ERC-20 Instead of ERC-1155?

**Problem**: ERC-1155 is not supported by most exchanges and DEXs.

**Solution**: Three separate ERC-20 tokens + Controller contract.

### ✅ Benefits of ERC-20 Architecture

| Feature | ERC-1155 | ERC-20 Architecture |
|---------|----------|---------------------|
| Exchange Listings | ❌ Limited | ✅ All exchanges |
| DEX Support | ❌ Poor | ✅ Universal |
| Uniswap Pairs | ❌ Hard | ✅ Native |
| Wallet Support | ⚠️ Some | ✅ All wallets |
| Trading Volume | ❌ Low | ✅ High potential |
| User Familiarity | ⚠️ New | ✅ Standard |
| **Memecoin Viability** | ❌ **Poor** | ✅ **Excellent** |

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│         QuantumCatController.sol                        │
│                                                           │
│  - commitObserve(): User burns QCAT, stores commitment  │
│  - observe(): Reveals, mints EITHER ALIVECAT OR DEADCAT │
│  - forceObserve(): Anyone finalizes stuck observations  │
│  - rebox(): Burns equal pairs, mints QCAT (minus fee)   │
│  - Enhanced RNG: blockhash + prevrandao + user entropy  │
│  - ZERO admin control, immutable parameters             │
└─────────────────────────────────────────────────────────┘
              │                │                │
           mint/burn        mint/burn        mint/burn
              ▼                ▼                ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ QCATToken    │  │ ALIVECATToken│  │ DEADCATToken │
    │  (ERC-20)    │  │  (ERC-20)    │  │  (ERC-20)    │
    ├──────────────┤  ├──────────────┤  ├──────────────┤
    │ Superposed   │  │ Observed     │  │ Observed     │
    │ state        │  │ alive        │  │ dead         │
    ├──────────────┤  ├──────────────┤  ├──────────────┤
    │ ✅ Tradeable │  │ ✅ Tradeable │  │ ✅ Tradeable │
    │ ✅ Listable  │  │ ✅ Listable  │  │ ✅ Listable  │
    │ ✅ DEX pairs │  │ ✅ DEX pairs │  │ ✅ DEX pairs │
    └──────────────┘  └──────────────┘  └──────────────┘
         │                  │                  │
         └──────────────────┴──────────────────┘
                      Standard ERC-20
                  (transfer, approve, etc.)
```

---

## 📝 Smart Contracts

### 1. **QCATToken.sol** (ERC-20)
- Standard ERC-20 token
- Symbol: `QCAT`
- Name: `QuantumCat`
- Only controller can mint/burn
- Initial supply minted to deployer
- Fully tradeable on all platforms

### 2. **ALIVECATToken.sol** (ERC-20)
- Standard ERC-20 token
- Symbol: `ALIVECAT`
- Name: `AliveCat`
- Only controller can mint/burn
- No initial supply (minted via observations)
- Fully tradeable on all platforms

### 3. **DEADCATToken.sol** (ERC-20)
- Standard ERC-20 token
- Symbol: `DEADCAT`
- Name: `DeadCat`
- Only controller can mint/burn
- No initial supply (minted via observations)
- Fully tradeable on all platforms

### 4. **QuantumCatController.sol** (Logic)
- Manages all quantum mechanics
- Handles commit-reveal observations
- Handles rebox operations
- Mints/burns tokens via controller role
- Immutable, zero admin control

---

## 🔄 How It Works

### Observation Flow (QCAT → ALIVECAT OR DEADCAT)

```solidity
// Step 1: User calls controller.commitObserve()
// - Controller burns QCAT from user
// - Stores commitment (amount, hash, entropy, block)
controller.commitObserve(
    100 ether,  // amount of QCAT
    keccak256("my_secret"),  // data hash
    randomBytes32  // user entropy
);

// Step 2: Wait 5 blocks (REVEAL_DELAY)

// Step 3: User calls controller.observe()
// - Controller verifies data matches hash
// - Generates 50/50 random choice
// - Mints EITHER all ALIVECAT OR all DEADCAT to user
controller.observe("my_secret");
// Result: 50% chance of either:
//   - 100 ALIVECAT + 0 DEADCAT, or
//   - 0 ALIVECAT + 100 DEADCAT
```

### Rebox Flow (ALIVECAT + DEADCAT → QCAT)

```solidity
// User calls controller.rebox()
// - Controller burns equal amounts of ALIVECAT and DEADCAT
// - Controller mints QCAT to user (minus fee)
// - Requires exactly equal amounts of both tokens
controller.rebox(10 ether);  // 10 pairs
// Result: Burns 10 ALIVECAT + 10 DEADCAT, mints ~19 QCAT (5% fee)
// Note: If you have 15 ALIVECAT but only 10 DEADCAT, you can only rebox 10 pairs
```

---

## 💰 Exchange Integration

### Creating Liquidity Pools

**Uniswap v3** (Recommended):
```javascript
// 1. Go to https://app.uniswap.org/
// 2. Connect wallet (Base network)
// 3. Create pool:
//    - Token A: QCAT (paste address)
//    - Token B: ETH or USDC
//    - Fee tier: 1% (for memecoins)
//    - Price range: Set initial price
// 4. Add liquidity
```

**Aerodrome** (Base-native):
```javascript
// 1. Go to https://aerodrome.finance/
// 2. Connect wallet
// 3. Create pool: QCAT/ETH
// 4. Add liquidity
```

### Token Addresses (After Deployment)

Save these addresses - they're permanent!

```json
{
  "qcat": "0x...",
  "alivecat": "0x...",
  "deadcat": "0x...",
  "controller": "0x..."
}
```

### Adding to Wallets

Users can add tokens to MetaMask/Coinbase Wallet:

```
Network: Base
Token Address: <QCAT_ADDRESS>
Token Symbol: QCAT
Decimals: 18
```

---

## 📊 Tokenomics

### Supply Dynamics

```
Initial State:
├─ QCAT: 1,000,000 (or configured amount)
├─ ALIVECAT: 0
└─ DEADCAT: 0

After Observations:
├─ QCAT: Decreases (burned in commitObserve)
├─ ALIVECAT: Increases (minted in observe)
└─ DEADCAT: Increases (minted in observe)

After Reboxing:
├─ QCAT: Increases (minted, minus fee)
├─ ALIVECAT: Decreases (burned)
└─ DEADCAT: Decreases (burned)

Total Supply:
QCAT + ALIVECAT + DEADCAT ≈ Initial Supply (minus rebox fees)
```

### Deflationary Mechanism

- Rebox fee acts as permanent burn
- 5% fee (default) on all rebox operations
- No way to recover burned tokens
- Supply slowly decreases over time

---

## 🎮 User Interaction

### For Traders

```javascript
// Buy QCAT on Uniswap
// Just normal ERC-20 trading!

// Observe (for fun/gambling)
const dataHash = ethers.keccak256(ethers.toUtf8Bytes("my_secret"));
const entropy = ethers.randomBytes(32);
await qcat.approve(controller.address, amount);
await controller.commitObserve(amount, dataHash, entropy);
// Wait 5 blocks
await controller.observe("my_secret");

// Rebox back to QCAT
await alivecat.approve(controller.address, pairs);
await deadcat.approve(controller.address, pairs);
await controller.rebox(pairs);

// Sell on Uniswap
// Normal ERC-20 trading!
```

### For Developers

```javascript
const { ethers } = require("hardhat");

// Get contracts
const qcat = await ethers.getContractAt("QCATToken", QCAT_ADDRESS);
const alivecat = await ethers.getContractAt("ALIVECATToken", ALIVECAT_ADDRESS);
const deadcat = await ethers.getContractAt("DEADCATToken", DEADCAT_ADDRESS);
const controller = await ethers.getContractAt("QuantumCatController", CONTROLLER_ADDRESS);

// Check balances
const qcatBalance = await qcat.balanceOf(userAddress);
const alivecatBalance = await alivecat.balanceOf(userAddress);
const deadcatBalance = await deadcat.balanceOf(userAddress);

// Check pending observation
const pending = await controller.pending(userAddress);
const canObserve = await controller.canObserve(userAddress);

// Calculate rebox output
const [qcatOut, fee] = await controller.calculateReboxOutput(pairs);
```

---

## 🚀 Deployment

### Step 1: Deploy Contracts

```bash
npm run deploy:base-sepolia  # Testnet
npm run deploy:base          # Mainnet
```

### Step 2: Save Addresses

The deployment script outputs:
```
QCAT Token:        0x...
ALIVECAT Token:    0x...
DEADCAT Token:     0x...
Controller:        0x...
```

**Save these addresses!** You'll need them for:
- Frontend integration
- Exchange listings
- Creating liquidity pools
- Marketing materials

### Step 3: Verify Contracts

Automatic if `BASESCAN_API_KEY` is set. Otherwise:

```bash
npx hardhat verify --network base <QCAT_ADDRESS> <CONTROLLER> <HOLDER> <SUPPLY>
npx hardhat verify --network base <ALIVECAT_ADDRESS> <CONTROLLER>
npx hardhat verify --network base <DEADCAT_ADDRESS> <CONTROLLER>
npx hardhat verify --network base <CONTROLLER_ADDRESS> <QCAT> <ALIVECAT> <DEADCAT> <FEE>
```

### Step 4: Create Liquidity

1. Approve tokens: `qcat.approve(UNISWAP_ROUTER, amount)`
2. Add liquidity on Uniswap/Aerodrome
3. Lock liquidity (recommended for trust)

### Step 5: Marketing

- [ ] Update website with addresses
- [ ] Create Uniswap link for easy buying
- [ ] Submit to CoinGecko
- [ ] Submit to CoinMarketCap
- [ ] Post on social media
- [ ] Engage Base community

---

## 🔐 Security

### Immutability

✅ **No one can**:
- Pause any contract
- Upgrade contracts
- Change fees
- Mint QCAT (except initial supply + rebox)
- Change controller
- Freeze funds

### Randomness

⚠️ **Blockhash-based RNG**:
- Suitable for memecoins and entertainment
- Commit-reveal prevents frontrunning
- User entropy adds defense
- 8-block fallback increases manipulation cost
- **Not suitable for high-value applications**

### Access Control

- Controller is the only minter/burner
- Controller has no admin functions
- Controller is immutable
- No ownership, no privileged roles

---

## 📈 Advantages Over ERC-1155

| Factor | Old (ERC-1155) | New (ERC-20) |
|--------|----------------|--------------|
| **Exchange Listings** | Virtually impossible | Easy |
| **DEX Trading** | Limited/custom | Native support |
| **Liquidity Pools** | Hard to create | Standard Uniswap pairs |
| **Wallet Support** | Limited | Universal |
| **Trading Volume** | Very low | High potential |
| **User Adoption** | Confusing | Familiar |
| **Price Discovery** | Poor | Excellent |
| **Arbitrage** | Limited | Enabled |
| **Token Standards** | Non-standard | Industry standard |
| **Integration Effort** | High | Low |

---

## 🎯 Marketing Angles

### For Traders
- "Trade on Uniswap like any other token"
- "Create your own QCAT/ETH pool"
- "Arbitrage between QCAT, ALIVECAT, DEADCAT"

### For Exchanges
- "Standard ERC-20 - easy to list"
- "Three tokens, one ecosystem"
- "Unique mechanics drive trading volume"

### For Community
- "Own the means of observation"
- "No admin keys, truly decentralized"
- "Quantum mechanics meet DeFi"

---

## 📚 Resources

- **Contracts**: All open source on GitHub
- **Basescan**: View verified contracts
- **Uniswap**: Create liquidity pools
- **CoinGecko**: Submit for listing
- **Discord**: Join community

---

## 🆘 FAQ

### Q: Why three separate tokens?
**A**: Exchange compatibility! Most exchanges only support ERC-20, not ERC-1155.

### Q: Can I trade ALIVECAT and DEADCAT separately?
**A**: Yes! Each is a fully independent ERC-20 token.

### Q: What happens if I only have ALIVECAT?
**A**: You can trade it on exchanges, but need equal amounts of DEADCAT to rebox back to QCAT. This creates an interesting market dynamic where you need to either observe more QCAT tokens (hoping for DEADCAT) or trade for DEADCAT on exchanges.

### Q: Can I create my own ALIVECAT/DEADCAT pool?
**A**: Yes! Since they're standard ERC-20s, you can create any pair. An ALIVECAT/DEADCAT trading pair would be useful for balancing your tokens before reboxing.

### Q: Is this audited?
**A**: The original ERC-1155 version was tested. New version needs audit before mainnet.

### Q: Can the team rug pull?
**A**: No! Zero admin control. Contracts are immutable.

---

## ✅ Pre-Launch Checklist

- [ ] All contracts deployed
- [ ] All contracts verified on Basescan
- [ ] Initial QCAT/ETH pool created
- [ ] Liquidity locked (optional but recommended)
- [ ] Addresses documented
- [ ] Frontend updated
- [ ] CoinGecko submission
- [ ] CoinMarketCap submission
- [ ] Social media announcement
- [ ] Community engaged
- [ ] Trading enabled

---

**Ready to launch your exchange-compatible quantum memecoin! 🐱⚛️✨**

