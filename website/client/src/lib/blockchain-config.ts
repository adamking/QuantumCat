// Contract addresses (update these after deployment)
export const CONTRACTS = {
  QCAT: '0x0000000000000000000000000000000000000000', // Replace with deployed address
  ALIVECAT: '0x0000000000000000000000000000000000000000', // Replace with deployed address
  DEADCAT: '0x0000000000000000000000000000000000000000', // Replace with deployed address
  CONTROLLER: '0x0000000000000000000000000000000000000000' // Replace with deployed address
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
  return CONTRACTS.QCAT !== '0x0000000000000000000000000000000000000000';
};
