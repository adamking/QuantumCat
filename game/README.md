# Schrödinger's Box Arcade 🎮

A simple 8-bit style game for interacting with the QuantumCat ERC20 token system.

## Features

- **8-bit Sealed Boxes**: Click on cardboard sealed boxes with locks and tape
- **Mini-Game**: Play a quick catch-the-particles game before unboxing
- **Unbox Mechanic**: Break the seal to convert QCAT tokens into either all ALIVECAT or all DEADCAT (50/50 random)
- **Reseal Mechanic**: Combine equal pairs of ALIVECAT + DEADCAT back into QCAT
- **Wallet Integration**: Connect with MetaMask to interact with real tokens
- **8-bit Retro Style**: Pixel art graphics with authentic cardboard box rendering

## How to Play

### Setup

1. Open `index.html` in a web browser
2. Click "Connect Wallet" and approve the connection in MetaMask
3. Make sure you're on the correct network (Base Sepolia or Base Mainnet)

### Gameplay

1. **Select a Box**: Click on any of the sealed boxes (they glow when you hover!)
2. **Break the Seal**: Click the "BREAK SEAL & UNBOX" button to start the mini-game
3. **Play Mini-Game**: 
   - Use Arrow Keys or A/D to move
   - Catch green particles (+10 points)
   - Avoid red particles (-5 points)
   - Game lasts 10 seconds
4. **View Result**: See if you got an ALIVE or DEAD cat! (50/50 chance - all your QCAT becomes either all ALIVECAT or all DEADCAT)
5. **Rebox**: When you have equal amounts of both ALIVE and DEAD tokens, click "REBOX" to combine pairs back into QCAT

### Controls

- **Mouse**: Click to select boxes
- **Arrow Keys / A/D**: Move in mini-game
- **Buttons**: Interact with game functions

## Demo Mode

The game automatically enters demo mode if contracts aren't deployed yet. In demo mode:
- Mock balances are used (10 QCAT, 5 ALIVE, 3 DEAD)
- Transactions are simulated with 2-second delays
- No actual blockchain interaction occurs

## Configuration

To connect to real deployed contracts, edit `blockchain.js` and update the contract addresses:

```javascript
const CONTRACTS = {
    QCAT: '0xYourQCATAddress',
    ALIVECAT: '0xYourALIVECATAddress',
    DEADCAT: '0xYourDEADCATAddress',
    CONTROLLER: '0xYourControllerAddress'
};
```

## Technical Stack

- **HTML5 Canvas**: For 8-bit style graphics
- **Vanilla JavaScript**: Game logic and animations
- **Ethers.js v5**: Blockchain interaction
- **CSS3**: Retro styling with animations

## File Structure

```
game/
├── index.html       # Main HTML structure
├── style.css        # 8-bit retro styling
├── game.js          # Core game logic and rendering
├── blockchain.js    # Web3 wallet and contract interaction
└── README.md        # This file
```

## Browser Compatibility

- Chrome/Brave: ✅ Full support
- Firefox: ✅ Full support
- Safari: ⚠️ May need MetaMask mobile browser
- Edge: ✅ Full support

## MetaMask Required

This game requires MetaMask or another Web3 wallet browser extension to interact with the blockchain.

## Future Enhancements

- [ ] Sound effects and music
- [ ] More mini-game variations
- [ ] NFT integration for special cats
- [ ] Leaderboards and achievements
- [ ] Mobile touch controls
- [ ] Multiplayer features

## License

Part of the QuantumCat project.

