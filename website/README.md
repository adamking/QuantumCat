# Quantum Cats 🐱⚛️

A three-token memecoin experiment in quantum superposition - observe QCAT to collapse into ALIVECAT and DEADCAT, or rebox them back!

## 🎯 Features

- **Three-Token System**: ERC-20 architecture with QCAT, ALIVECAT, and DEADCAT tokens
- **Observe & Rebox Mechanics**: 
  - Observe QCAT to collapse it into ALIVECAT + DEADCAT (with 5-block fair RNG)
  - Rebox pairs of ALIVE + DEAD back into QCAT (with 2% deflationary fee)
- **Arbitrage Triangle**: Natural price balance through QCAT ↔ ALIVE ↔ DEAD trading
- **Quantum Superposition Animation**: Interactive cat that switches between alive and dead states
- **Epic Glitch Effects**: Mind-bending visual quantum state transitions
- **Complete Landing Page**: 
  - Full three-token tokenomics breakdown
  - Observe/rebox mechanics explained
  - Four Uniswap v3 pools detailed
  - Step-by-step buying & playing guide
  - Comprehensive FAQ and disclaimer

## 🚀 Live Demo

Visit: [https://adamking.github.io/QuantumCat/](https://adamking.github.io/QuantumCat/)

## 💻 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Technology Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components

## 🎨 How It Works

### The Animation
The cat exists in quantum superposition, randomly collapsing to alive or dead states when clicked. Each state transition features:
- Dynamic glitch animation with randomized visual effects
- Procedurally generated quantum collapse sound effects
- Smooth state transitions with flicker effects
- Text scrambling during state changes

### The Tokenomics
Three separate ERC-20 tokens:
- **QCAT**: The superposed coin - starts at 662,607,015 supply
- **ALIVECAT**: Observed outcome from collapsing QCAT
- **DEADCAT**: Observed outcome from collapsing QCAT

**Observe**: Burn QCAT → Get ALIVECAT + DEADCAT (total equals QCAT burned)
- Requires commit-reveal with 5-block delay for fair RNG
- No supply change, just state transformation

**Rebox**: Burn ALIVECAT + DEADCAT pairs → Get QCAT
- 2% fee creates deflationary sink
- Burns 2 tokens, mints ~1.96 QCAT
- Expected ~0.6% monthly decay at 30% rebox volume

**Price Relationship**: P_QCAT ≈ (P_ALIVE + P_DEAD) / 1.96
- Arbitrage opportunities keep markets balanced

## 💰 Tokenomics

- **Total Supply**: 100,000,000 $QCAT
- **Tax**: 0% (no buy/sell tax)
- **Distribution**: 
  - 90% Liquidity Pool (90M tokens) - Permanently Locked
  - 10% Team & Marketing (10M tokens)
- **Chain**: Ethereum (ERC-20)
- **DEX**: Uniswap V2

### Why 10% Team Allocation?

We're transparent about our allocation. The 10% supports:
- Marketing campaigns, meme creation, and community growth
- Exchange listings and liquidity operations
- Community rewards, contests, and giveaways
- Development, maintenance, and keeping the vibes alive

This is lower than typical memecoin allocations (often 15-20%) and demonstrates our commitment to the community.

## 🔒 Security Features

✅ 90% Liquidity Permanently Locked  
✅ Zero Buy/Sell Tax  
✅ Fixed Supply (No Minting)  
✅ ERC-20 Standard Compliance  

## 🛒 How to Buy

1. Get an Ethereum wallet (MetaMask or similar)
2. Buy ETH on any major exchange
3. Swap ETH for $QCAT on Uniswap V2
4. HODL in quantum superposition!

## 📝 Deployment

The app automatically deploys to GitHub Pages when you push to main. See [DEPLOYMENT.md](./DEPLOYMENT.md) for other hosting options.

## ⚠️ Disclaimer

$QCAT is a memecoin with no intrinsic value and no expectation of financial return. This is a quantum experiment for entertainment purposes only. Do your own research. Cryptocurrency investments are highly speculative and volatile. Never invest more than you can afford to lose completely.

Just like Schrödinger's cat, your investment may exist in multiple states simultaneously. Observing your wallet may collapse the wave function. Past performance is not indicative of future results.

## 🤝 Contributing

This is a memecoin project. Feel free to fork and create your own quantum experiments!

## 📄 License

MIT

---

© 2025 Quantum Cat. All states superposed. Built with uncertainty principle.
