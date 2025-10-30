// Blockchain Integration
const blockchain = {
    provider: null,
    signer: null,
    contracts: {},
    isConnected: false,
    userAddress: null,
    balances: {
        qcat: 0,
        alive: 0,
        dead: 0
    }
};

// Contract addresses (update these after deployment)
const CONTRACTS = {
    QCAT: '0x0000000000000000000000000000000000000000', // Replace with deployed address
    ALIVECAT: '0x0000000000000000000000000000000000000000', // Replace with deployed address
    DEADCAT: '0x0000000000000000000000000000000000000000', // Replace with deployed address
    CONTROLLER: '0x0000000000000000000000000000000000000000' // Replace with deployed address
};

// ABIs (simplified - you'll need to load full ABIs from your artifacts)
const ABIS = {
    ERC20: [
        'function balanceOf(address owner) view returns (uint256)',
        'function approve(address spender, uint256 amount) returns (bool)',
        'function allowance(address owner, address spender) view returns (uint256)'
    ],
    CONTROLLER: [
        'function unbox(uint256 amount) external',
        'function rebox(uint256 amount) external',
        'function unboxedAmount(address user) view returns (uint256)'
    ]
};

// Initialize demo mode on load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.ethereum === 'undefined') {
        // Start in demo mode
        blockchain.demoMode = true;
        blockchain.isConnected = true;
        document.getElementById('connectButton').textContent = 'Demo Mode';
        document.getElementById('walletAddress').textContent = '(No Wallet)';
        updateBalances();
        showStatus('Playing in Demo Mode - Connect wallet for real tokens!', 'pending');
        setTimeout(() => {
            const status = document.getElementById('txStatus');
            if (status) status.classList.add('hidden');
        }, 5000);
    }
});

// Connect wallet
document.getElementById('connectButton').addEventListener('click', connectWallet);

async function connectWallet() {
    try {
        if (typeof window.ethereum === 'undefined') {
            alert('Please install MetaMask to connect a real wallet!\n\nYou can continue playing in Demo Mode.');
            return;
        }
        
        // Request account access
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        blockchain.provider = new ethers.providers.Web3Provider(window.ethereum);
        blockchain.signer = blockchain.provider.getSigner();
        blockchain.userAddress = accounts[0];
        blockchain.isConnected = true;
        
        // Update UI
        const shortAddress = `${blockchain.userAddress.slice(0, 6)}...${blockchain.userAddress.slice(-4)}`;
        document.getElementById('walletAddress').textContent = shortAddress;
        document.getElementById('connectButton').textContent = 'Connected';
        document.getElementById('connectButton').disabled = true;
        
        // Initialize contracts
        await initializeContracts();
        
        // Load balances
        await updateBalances();
        
        showStatus('Wallet connected successfully!', 'success');
        
    } catch (error) {
        console.error('Connection error:', error);
        showStatus('Failed to connect wallet: ' + error.message, 'error');
    }
}

async function initializeContracts() {
    try {
        // Check if contracts are deployed
        if (CONTRACTS.QCAT === '0x0000000000000000000000000000000000000000') {
            console.warn('Contracts not deployed yet. Using demo mode.');
            blockchain.demoMode = true;
            return;
        }
        
        blockchain.contracts.qcat = new ethers.Contract(
            CONTRACTS.QCAT,
            ABIS.ERC20,
            blockchain.signer
        );
        
        blockchain.contracts.alive = new ethers.Contract(
            CONTRACTS.ALIVECAT,
            ABIS.ERC20,
            blockchain.signer
        );
        
        blockchain.contracts.dead = new ethers.Contract(
            CONTRACTS.DEADCAT,
            ABIS.ERC20,
            blockchain.signer
        );
        
        blockchain.contracts.controller = new ethers.Contract(
            CONTRACTS.CONTROLLER,
            ABIS.CONTROLLER,
            blockchain.signer
        );
        
    } catch (error) {
        console.error('Contract initialization error:', error);
        blockchain.demoMode = true;
    }
}

async function updateBalances() {
    try {
        if (blockchain.demoMode) {
            // Demo mode - use mock balances
            blockchain.balances = {
                qcat: 10,
                alive: 5,
                dead: 3
            };
        } else {
            // Real balances
            const qcatBalance = await blockchain.contracts.qcat.balanceOf(blockchain.userAddress);
            const aliveBalance = await blockchain.contracts.alive.balanceOf(blockchain.userAddress);
            const deadBalance = await blockchain.contracts.dead.balanceOf(blockchain.userAddress);
            
            blockchain.balances = {
                qcat: parseFloat(ethers.utils.formatEther(qcatBalance)),
                alive: parseFloat(ethers.utils.formatEther(aliveBalance)),
                dead: parseFloat(ethers.utils.formatEther(deadBalance))
            };
        }
        
        // Update UI
        document.getElementById('qcatBalance').textContent = blockchain.balances.qcat.toFixed(2);
        document.getElementById('aliveBalance').textContent = blockchain.balances.alive.toFixed(2);
        document.getElementById('deadBalance').textContent = blockchain.balances.dead.toFixed(2);
        
        // Enable/disable buttons
        document.getElementById('reboxButton').disabled = !(
            blockchain.balances.alive >= 1 && blockchain.balances.dead >= 1
        );
        
    } catch (error) {
        console.error('Balance update error:', error);
        showStatus('Failed to load balances', 'error');
    }
}

async function unbox() {
    try {
        if (blockchain.demoMode) {
            // Demo mode - simulate transaction
            return new Promise((resolve) => {
                setTimeout(() => {
                    const isAlive = Math.random() > 0.5;
                    if (isAlive) {
                        blockchain.balances.alive++;
                    } else {
                        blockchain.balances.dead++;
                    }
                    blockchain.balances.qcat--;
                    resolve({ isAlive });
                }, 2000);
            });
        }
        
        // Check allowance
        const amount = ethers.utils.parseEther('1');
        const allowance = await blockchain.contracts.qcat.allowance(
            blockchain.userAddress,
            CONTRACTS.CONTROLLER
        );
        
        // Approve if needed
        if (allowance.lt(amount)) {
            showStatus('Approving QCAT tokens...', 'pending');
            const approveTx = await blockchain.contracts.qcat.approve(
                CONTRACTS.CONTROLLER,
                ethers.constants.MaxUint256
            );
            await approveTx.wait();
        }
        
        // Unbox
        showStatus('Unboxing... (confirm transaction)', 'pending');
        const tx = await blockchain.contracts.controller.unbox(amount);
        
        showStatus('Transaction submitted, waiting for confirmation...', 'pending');
        const receipt = await tx.wait();
        
        // Parse events to determine result
        // This depends on your contract events
        // For now, return random
        return { isAlive: Math.random() > 0.5 };
        
    } catch (error) {
        console.error('Unbox error:', error);
        throw error;
    }
}

async function rebox() {
    try {
        if (blockchain.demoMode) {
            // Demo mode - simulate transaction
            return new Promise((resolve) => {
                setTimeout(() => {
                    blockchain.balances.alive--;
                    blockchain.balances.dead--;
                    blockchain.balances.qcat++;
                    resolve(true);
                }, 2000);
            });
        }
        
        const amount = ethers.utils.parseEther('1');
        
        // Check and approve ALIVE tokens
        const aliveAllowance = await blockchain.contracts.alive.allowance(
            blockchain.userAddress,
            CONTRACTS.CONTROLLER
        );
        if (aliveAllowance.lt(amount)) {
            showStatus('Approving ALIVE tokens...', 'pending');
            const approveTx = await blockchain.contracts.alive.approve(
                CONTRACTS.CONTROLLER,
                ethers.constants.MaxUint256
            );
            await approveTx.wait();
        }
        
        // Check and approve DEAD tokens
        const deadAllowance = await blockchain.contracts.dead.allowance(
            blockchain.userAddress,
            CONTRACTS.CONTROLLER
        );
        if (deadAllowance.lt(amount)) {
            showStatus('Approving DEAD tokens...', 'pending');
            const approveTx = await blockchain.contracts.dead.approve(
                CONTRACTS.CONTROLLER,
                ethers.constants.MaxUint256
            );
            await approveTx.wait();
        }
        
        // Rebox
        showStatus('Reboxing... (confirm transaction)', 'pending');
        const tx = await blockchain.contracts.controller.rebox(amount);
        
        showStatus('Transaction submitted, waiting for confirmation...', 'pending');
        await tx.wait();
        
        showStatus('Successfully reboxed!', 'success');
        return true;
        
    } catch (error) {
        console.error('Rebox error:', error);
        throw error;
    }
}

// Handle account changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            blockchain.isConnected = false;
            document.getElementById('connectButton').textContent = 'Connect Wallet';
            document.getElementById('connectButton').disabled = false;
            document.getElementById('walletAddress').textContent = '';
        } else {
            blockchain.userAddress = accounts[0];
            connectWallet();
        }
    });
    
    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}

// Export for game.js
window.blockchain = {
    get isConnected() { return blockchain.isConnected; },
    updateBalances,
    unbox,
    rebox,
    get balances() { return blockchain.balances; },
    get demoMode() { return blockchain.demoMode; }
};

function showStatus(message, type) {
    if (typeof gameState !== 'undefined' && gameState.showStatus) {
        gameState.showStatus(message, type);
    } else {
        const status = document.getElementById('txStatus');
        if (status) {
            status.textContent = message;
            status.className = `tx-status ${type}`;
            status.classList.remove('hidden');
            
            if (type !== 'pending') {
                setTimeout(() => {
                    status.classList.add('hidden');
                }, 5000);
            }
        }
    }
}

