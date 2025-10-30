import { useState, useEffect, useCallback } from 'react';
import { ethers, BrowserProvider, Contract } from 'ethers';
import type { Signer } from 'ethers';
import { CONTRACTS, ABIS, isContractsDeployed } from '@/lib/blockchain-config';

interface TokenBalances {
  qcat: number;
  alive: number;
  dead: number;
}

interface BlockchainState {
  provider: BrowserProvider | null;
  signer: Signer | null;
  isConnected: boolean;
  isDemoMode: boolean;
  userAddress: string | null;
  balances: TokenBalances;
}

export function useBlockchain() {
  const [state, setState] = useState<BlockchainState>({
    provider: null,
    signer: null,
    isConnected: false,
    isDemoMode: false,
    userAddress: null,
    balances: {
      qcat: 0,
      alive: 0,
      dead: 0
    }
  });

  const [contracts, setContracts] = useState<{
    qcat: Contract | null;
    alive: Contract | null;
    dead: Contract | null;
    controller: Contract | null;
  }>({
    qcat: null,
    alive: null,
    dead: null,
    controller: null
  });

  // Initialize demo mode if no wallet available
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') {
      setState(prev => ({
        ...prev,
        isDemoMode: true,
        isConnected: true,
        balances: {
          qcat: 10,
          alive: 5,
          dead: 3
        }
      }));
    }
  }, []);

  // Initialize contracts
  const initializeContracts = useCallback(async (signer: Signer) => {
    try {
      if (!isContractsDeployed()) {
        console.warn('Contracts not deployed yet. Using demo mode.');
        setState(prev => ({ ...prev, isDemoMode: true }));
        return;
      }

      const qcatContract = new Contract(CONTRACTS.QCAT, ABIS.ERC20, signer);
      const aliveContract = new Contract(CONTRACTS.ALIVECAT, ABIS.ERC20, signer);
      const deadContract = new Contract(CONTRACTS.DEADCAT, ABIS.ERC20, signer);
      const controllerContract = new Contract(CONTRACTS.CONTROLLER, ABIS.CONTROLLER, signer);

      setContracts({
        qcat: qcatContract,
        alive: aliveContract,
        dead: deadContract,
        controller: controllerContract
      });
    } catch (error) {
      console.error('Contract initialization error:', error);
      setState(prev => ({ ...prev, isDemoMode: true }));
    }
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask to connect a wallet!');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = accounts[0];

      setState(prev => ({
        ...prev,
        provider,
        signer,
        userAddress,
        isConnected: true
      }));

      await initializeContracts(signer);

      return { success: true };
    } catch (error: any) {
      console.error('Connection error:', error);
      return { success: false, error: error.message };
    }
  }, [initializeContracts]);

  // Update balances
  const updateBalances = useCallback(async () => {
    try {
      if (state.isDemoMode) {
        // Demo mode already has balances set
        return;
      }

      const { qcat, alive, dead } = contracts;
      if (!qcat || !alive || !dead || !state.userAddress) {
        return;
      }

      const qcatBalance = await qcat.balanceOf!(state.userAddress);
      const aliveBalance = await alive.balanceOf!(state.userAddress);
      const deadBalance = await dead.balanceOf!(state.userAddress);

      setState(prev => ({
        ...prev,
        balances: {
          qcat: parseFloat(ethers.formatEther(qcatBalance)),
          alive: parseFloat(ethers.formatEther(aliveBalance)),
          dead: parseFloat(ethers.formatEther(deadBalance))
        }
      }));
    } catch (error) {
      console.error('Balance update error:', error);
      throw error;
    }
  }, [state.isDemoMode, state.userAddress, contracts]);

  // Unbox function (commit-reveal pattern)
  const unbox = useCallback(async (): Promise<{ isAlive: boolean }> => {
    try {
      if (state.isDemoMode) {
        // Demo mode - simulate transaction
        return new Promise((resolve) => {
          setTimeout(() => {
            const isAlive = Math.random() > 0.5;
            setState(prev => ({
              ...prev,
              balances: {
                qcat: prev.balances.qcat - 1,
                alive: prev.balances.alive + (isAlive ? 1 : 0),
                dead: prev.balances.dead + (isAlive ? 0 : 1)
              }
            }));
            resolve({ isAlive });
          }, 2000);
        });
      }

      const { qcat, controller } = contracts;
      if (!qcat || !controller) {
        throw new Error('Contracts not initialized');
      }

      const amount = ethers.parseEther('1');

      // Check allowance
      const allowance = await qcat.allowance!(
        state.userAddress!,
        CONTRACTS.CONTROLLER
      );

      // Approve if needed
      if (allowance < amount) {
        const approveTx = await qcat.approve!(
          CONTRACTS.CONTROLLER,
          ethers.MaxUint256
        );
        await approveTx.wait();
      }

      // Generate user entropy
      const userEntropy = ethers.randomBytes(32);
      const data = ethers.randomBytes(32); // Random reveal data
      const dataHash = ethers.keccak256(data);

      // Commit observe
      const commitTx = await controller.commitObserve!(amount, dataHash, userEntropy);
      await commitTx.wait();

      // Wait 5 blocks (approximately 60 seconds on most networks)
      await new Promise(resolve => setTimeout(resolve, 60000));

      // Reveal observe
      const observeTx = await controller.observe!(data);
      await observeTx.wait();

      // Parse events to determine result
      // For now, return random - you'll need to parse actual events
      return { isAlive: Math.random() > 0.5 };
    } catch (error) {
      console.error('Unbox error:', error);
      throw error;
    }
  }, [state.isDemoMode, state.userAddress, contracts]);

  // Rebox function
  const rebox = useCallback(async () => {
    try {
      if (state.isDemoMode) {
        // Demo mode - simulate transaction
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            setState(prev => ({
              ...prev,
              balances: {
                qcat: prev.balances.qcat + 1,
                alive: prev.balances.alive - 1,
                dead: prev.balances.dead - 1
              }
            }));
            resolve();
          }, 2000);
        });
      }

      const { alive, dead, controller } = contracts;
      if (!alive || !dead || !controller) {
        throw new Error('Contracts not initialized');
      }

      const amount = ethers.parseEther('1');

      // Check and approve ALIVE tokens
      const aliveAllowance = await alive.allowance!(
        state.userAddress!,
        CONTRACTS.CONTROLLER
      );
      if (aliveAllowance < amount) {
        const approveTx = await alive.approve!(
          CONTRACTS.CONTROLLER,
          ethers.MaxUint256
        );
        await approveTx.wait();
      }

      // Check and approve DEAD tokens
      const deadAllowance = await dead.allowance!(
        state.userAddress!,
        CONTRACTS.CONTROLLER
      );
      if (deadAllowance < amount) {
        const approveTx = await dead.approve!(
          CONTRACTS.CONTROLLER,
          ethers.MaxUint256
        );
        await approveTx.wait();
      }

      // Rebox (using pairs array - [aliveAmount, deadAmount])
      const pairs = [amount, amount]; // 1 ALIVE + 1 DEAD = 1 QCAT
      const tx = await controller.rebox!(pairs);
      await tx.wait();
    } catch (error) {
      console.error('Rebox error:', error);
      throw error;
    }
  }, [state.isDemoMode, state.userAddress, contracts]);

  // Handle account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setState(prev => ({
            ...prev,
            isConnected: false,
            userAddress: null
          }));
        } else {
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [connectWallet]);

  // Update balances when connected
  useEffect(() => {
    if (state.isConnected && !state.isDemoMode) {
      updateBalances();
    }
  }, [state.isConnected, state.isDemoMode, updateBalances]);

  return {
    ...state,
    connectWallet,
    updateBalances,
    unbox,
    rebox
  };
}
