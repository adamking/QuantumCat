// Contract addresses on Base L2 (update these after deployment)
// Base Mainnet Chain ID: 8453
// Base Sepolia Testnet Chain ID: 84532
export const CONTRACTS = {
  CATBOX: '0x0000000000000000000000000000000000000000', // Replace with deployed Base address
  LIVECAT: '0x0000000000000000000000000000000000000000', // Replace with deployed Base address
  DEADCAT: '0x0000000000000000000000000000000000000000', // Replace with deployed Base address
  CONTROLLER: '0x0000000000000000000000000000000000000000' // Replace with deployed Base address
};

// Network Configuration for Base L2
export const NETWORK_CONFIG = {
  chainId: 8453, // Base Mainnet
  chainName: 'Base',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['https://mainnet.base.org'],
  blockExplorerUrls: ['https://basescan.org']
};

// Testnet Configuration (Base Sepolia)
export const TESTNET_CONFIG = {
  chainId: 84532, // Base Sepolia
  chainName: 'Base Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia.basescan.org']
};

// ABIs (simplified - you'll need to load full ABIs from your artifacts)
export const ABIS = {
  ERC20: [
    'function balanceOf(address owner) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)'
  ],
  CONTROLLER: [
    'function commitObserve(uint256 amount, bytes32 dataHash, bytes32 userEntropy) external',
    'function observe(bytes memory data) external',
    'function rebox(uint256[] calldata pairs) external',
    'function pending(address user) view returns (uint64 refBlock, bool active, bytes32 dataHash, bytes32 userEntropy, uint256 amount)'
  ]
};

// Check if contracts are deployed
export const isContractsDeployed = () => {
  return CONTRACTS.CATBOX !== '0x0000000000000000000000000000000000000000';
};
