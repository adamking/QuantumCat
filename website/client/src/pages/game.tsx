import { useState, useEffect, useMemo } from 'react';
import { useBlockchain } from '@/hooks/use-blockchain';
import { useGameState } from '@/hooks/use-game-state';
import { useToast } from '@/hooks/use-toast';
import { createBoxes } from '@/lib/canvas-utils';
import { WalletConnect } from '@/components/game/WalletConnect';
import { TokenBalances } from '@/components/game/TokenBalances';
import { GameCanvas } from '@/components/game/GameCanvas';
import { ActionButtons } from '@/components/game/ActionButtons';
import { StatsPanel } from '@/components/game/StatsPanel';
import { MiniGameModal } from '@/components/game/MiniGameModal';
import { ResultModal } from '@/components/game/ResultModal';

export default function Game() {
  const { toast } = useToast();

  // Initialize boxes once
  const initialBoxes = useMemo(() => createBoxes(800, 600), []);

  // Game state
  const {
    state: gameState,
    selectBox,
    updateBoxHover,
    clearSelection,
    recordUnbox,
    addScore,
    updateParticles,
    updateBoxPulse
  } = useGameState(initialBoxes);

  // Blockchain state
  const blockchain = useBlockchain();

  // Modal states
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<{ isAlive: boolean } | null>(null);

  // Update particles and pulse animations
  useEffect(() => {
    const interval = setInterval(() => {
      updateParticles();
      updateBoxPulse();
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [updateParticles, updateBoxPulse]);

  // Show demo mode message on mount
  useEffect(() => {
    if (blockchain.isDemoMode) {
      toast({
        title: "Playing in Demo Mode",
        description: "Connect wallet for real tokens!",
        duration: 5000,
      });
    }
  }, [blockchain.isDemoMode, toast]);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    const result = await blockchain.connectWallet();
    if (result.success) {
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to MetaMask!",
      });
    } else {
      toast({
        title: "Connection Failed",
        description: result.error || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  // Handle unbox button click
  const handleUnboxClick = () => {
    if (gameState.selectedBox === null) {
      toast({
        title: "No Box Selected",
        description: "Please select a box first!",
        variant: "destructive",
      });
      return;
    }

    if (blockchain.balances.qcat <= 0) {
      toast({
        title: "Insufficient Balance",
        description: "You need QCAT tokens to unbox!",
        variant: "destructive",
      });
      return;
    }

    // Start mini-game
    setShowMiniGame(true);
  };

  // Handle mini-game completion
  const handleMiniGameComplete = async (miniGameScore: number) => {
    setShowMiniGame(false);

    // Add mini-game score to session score
    addScore(miniGameScore);

    // Show unboxing toast
    toast({
      title: "Unboxing...",
      description: "Opening your quantum cat...",
    });

    try {
      // Perform unbox
      const result = await blockchain.unbox();

      // Record result
      recordUnbox(result.isAlive);
      setLastResult(result);
      setShowResult(true);

      // Update balances after delay
      setTimeout(() => {
        blockchain.updateBalances();
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Unbox Failed",
        description: error.message || "Failed to unbox",
        variant: "destructive",
      });
    }
  };

  // Handle rebox
  const handleRebox = async () => {
    if (blockchain.balances.alive < 1 || blockchain.balances.dead < 1) {
      toast({
        title: "Insufficient Tokens",
        description: "You need at least 1 ALIVE and 1 DEAD token to rebox!",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Reboxing...",
      description: "Combining cats back to quantum state...",
    });

    try {
      await blockchain.rebox();

      toast({
        title: "Rebox Complete",
        description: "Successfully reboxed! QCAT created.",
      });

      // Update balances after delay
      setTimeout(() => {
        blockchain.updateBalances();
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Rebox Failed",
        description: error.message || "Failed to rebox",
        variant: "destructive",
      });
    }
  };

  // Handle result modal close
  const handleResultClose = () => {
    setShowResult(false);
    clearSelection();
  };

  return (
    <div className="min-h-screen bg-[#0f0f1e] text-white" style={{
      backgroundImage: `repeating-linear-gradient(0deg, rgba(0, 255, 65, 0.05) 0px, transparent 1px, transparent 2px, rgba(0, 255, 65, 0.05) 3px),
        repeating-linear-gradient(90deg, rgba(0, 255, 65, 0.05) 0px, transparent 1px, transparent 2px, rgba(0, 255, 65, 0.05) 3px)`,
      backgroundSize: '20px 20px'
    }}>
      <div className="max-w-[1200px] mx-auto p-5">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center p-5 bg-[#1a1a2e] border-3 border-[#00ff41] mb-5 shadow-[0_0_20px_rgba(0,255,65,0.3)] gap-4">
          <h1 className="font-['Press_Start_2P'] text-sm sm:text-lg text-[#00ff41] drop-shadow-[2px_2px_0_#ff00ff] animate-pulse">
            🐱 SCHRÖDINGER'S BOX ARCADE
          </h1>
          <WalletConnect
            isConnected={blockchain.isConnected}
            isDemoMode={blockchain.isDemoMode}
            userAddress={blockchain.userAddress}
            onConnect={handleConnectWallet}
          />
        </header>

        {/* Game Container */}
        <div className="bg-[#1a1a2e] border-3 border-[#00ff41] p-5 shadow-[0_0_30px_rgba(0,255,65,0.2)]">
          {/* Token Balances */}
          <TokenBalances
            qcat={blockchain.balances.qcat}
            alive={blockchain.balances.alive}
            dead={blockchain.balances.dead}
          />

          {/* Game Canvas */}
          <div className="my-5">
            <GameCanvas
              boxes={gameState.boxes}
              particles={gameState.particles}
              onBoxClick={selectBox}
              onBoxHover={updateBoxHover}
            />
          </div>

          {/* Action Buttons */}
          <ActionButtons
            canUnbox={gameState.selectedBox !== null && blockchain.balances.qcat > 0}
            canRebox={blockchain.balances.alive >= 1 && blockchain.balances.dead >= 1}
            onUnbox={handleUnboxClick}
            onRebox={handleRebox}
            onRefresh={blockchain.updateBalances}
          />

          {/* Stats Panel */}
          <StatsPanel
            totalUnboxed={gameState.totalUnboxed}
            sessionScore={gameState.score}
            aliveCount={gameState.aliveCount}
            deadCount={gameState.deadCount}
          />
        </div>
      </div>

      {/* Modals */}
      <MiniGameModal
        isOpen={showMiniGame}
        onComplete={handleMiniGameComplete}
      />

      {lastResult && (
        <ResultModal
          isOpen={showResult}
          isAlive={lastResult.isAlive}
          onClose={handleResultClose}
        />
      )}
    </div>
  );
}
