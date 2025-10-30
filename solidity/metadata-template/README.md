# QuantumCat Metadata Templates

This folder contains ERC-1155 metadata templates for the three QuantumCat token types.

## Files

- `0.json` - QCAT (superposed state)
- `1.json` - ALIVECAT (observed alive)
- `2.json` - DEADCAT (observed dead)

## How to Use

### 1. Customize the Metadata

Edit each JSON file to add your:
- Token names and descriptions
- Image URLs (must be IPFS)
- Attributes and traits
- External URLs

### 2. Create Token Images

Create three images representing:
- QCAT: A cat in a quantum/superposed state (maybe glowing, semi-transparent, or showing both states)
- ALIVECAT: A happy, healthy cat
- DEADCAT: A sad or sleeping cat (keep it lighthearted for memecoin vibes)

Recommended specs:
- Format: PNG with transparency
- Size: 512x512 or 1024x1024 pixels
- File size: < 5MB each

### 3. Upload to IPFS

**Option A: Pinata (Recommended)**

1. Sign up at https://www.pinata.cloud/
2. Create a new folder named `quantumcat-metadata`
3. Upload all 3 JSON files to the folder
4. Pin the folder
5. Get the folder CID (e.g., `QmXxxxxxxxxxxxxx`)

**Option B: NFT.Storage**

1. Sign up at https://nft.storage/
2. Upload as a folder
3. Get the folder CID

**Option C: Web3.Storage**

1. Sign up at https://web3.storage/
2. Upload as a directory
3. Get the directory CID

### 4. Upload Images to IPFS

Upload your images to IPFS using the same service. You'll get CIDs for each image like:
- `QmYyyyyyyyyyyyyy/qcat.png`
- `QmYyyyyyyyyyyyyy/alivecat.png`
- `QmYyyyyyyyyyyyyy/deadcat.png`

Update the `"image"` fields in your JSON files with these IPFS URLs.

### 5. Update Contract

Open `contracts/QuantumCat.sol` and update the URI constants (around lines 141, 145, 149):

```solidity
string public constant QCAT_URI = "ipfs://QmYourFolderCID/0.json";
string public constant ALIVECAT_URI = "ipfs://QmYourFolderCID/1.json";
string public constant DEADCAT_URI = "ipfs://QmYourFolderCID/2.json";
```

### 6. Recompile and Deploy

```bash
# Recompile contract with new URIs
npm run compile

# Test on Base Sepolia first
npm run deploy:base-sepolia

# Then deploy to Base mainnet
npm run deploy:base
```

## Example IPFS URLs

After uploading, your URLs should look like:

```
ipfs://QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/0.json
ipfs://QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/1.json
ipfs://QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/2.json
```

## Viewing Metadata

You can view your metadata through IPFS gateways:

```
https://ipfs.io/ipfs/QmYourCID/0.json
https://gateway.pinata.cloud/ipfs/QmYourCID/0.json
```

## Important Notes

⚠️ **IPFS URIs are PERMANENT in the contract!**
- Once deployed, they cannot be changed
- Always test on testnet first
- Verify all URLs work before mainnet deployment

✅ **Use reliable pinning services**
- Free tier is fine for testing
- Upgrade to paid for mainnet (better reliability)
- Consider pinning on multiple services

🎨 **Keep it fun and lighthearted**
- This is a memecoin - have fun with the art!
- Make cats cute and recognizable
- Add personality to descriptions

## Validation

Before mainnet deployment, verify:

- [ ] All JSON files are valid (use jsonlint.com)
- [ ] All image URLs work (test in browser)
- [ ] Metadata displays correctly on OpenSea testnet
- [ ] URIs are updated in contract
- [ ] Contract is recompiled
- [ ] Tested on Base Sepolia

## Resources

- ERC-1155 Metadata Standard: https://eips.ethereum.org/EIPS/eip-1155#metadata
- OpenSea Metadata Standards: https://docs.opensea.io/docs/metadata-standards
- Pinata Docs: https://docs.pinata.cloud/
- IPFS Docs: https://docs.ipfs.tech/

## Need Help?

- Discord: [Join community](https://discord.gg/quantumcat)
- GitHub: [Open an issue](https://github.com/your-org/quantumcat/issues)

