import { useMiniGame } from '@/hooks/use-mini-game';
import { useEffect } from 'react';

interface MiniGameModalProps {
  isOpen: boolean;
  onComplete: (score: number) => void;
}

export function MiniGameModal({ isOpen, onComplete }: MiniGameModalProps) {
  const { canvasRef, isActive, score, timeLeft, start, end } = useMiniGame();

  useEffect(() => {
    if (isOpen && !isActive) {
      start();
    }
  }, [isOpen, isActive, start]);

  useEffect(() => {
    if (!isActive && isOpen && timeLeft === 0) {
      // Game ended naturally
      setTimeout(() => {
        onComplete(score);
      }, 100);
    }
  }, [isActive, isOpen, timeLeft, score, onComplete]);

  const handleSkip = () => {
    end();
    onComplete(score);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[2000]">
      <div className="bg-[#1a1a2e] border-4 border-[#00ff41] p-8 text-center max-w-[500px] shadow-[0_0_40px_rgba(0,255,65,0.5)] animate-[popIn_0.3s_ease-out]">
        <h2 className="font-['Press_Start_2P'] text-base text-[#00ff41] mb-4 drop-shadow-[2px_2px_0_#ff00ff]">
          ⚡ QUANTUM COLLAPSE GAME ⚡
        </h2>
        <p className="font-['Press_Start_2P'] text-[10px] text-white mb-5">
          Catch the green particles! Avoid the red ones!
        </p>

        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className="block mx-auto border-3 border-[#00ff41] bg-black mb-4"
          style={{ imageRendering: 'pixelated' }}
        />

        <div className="flex justify-around my-4 font-['Press_Start_2P'] text-xs text-[#00ff41]">
          <span>Score: {score}</span>
          <span>Time: {timeLeft}s</span>
        </div>

        <button
          onClick={handleSkip}
          className="mt-4 w-full font-['Press_Start_2P'] text-[10px] px-5 py-3 border-3 border-[#ff0055] bg-[#ff0055] text-white uppercase transition-all hover:bg-[#ff0055]/80"
        >
          Skip & Unbox Now
        </button>
      </div>
    </div>
  );
}
