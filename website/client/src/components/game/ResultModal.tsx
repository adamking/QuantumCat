import { useEffect, useRef } from 'react';
import { drawAliveCat, drawDeadCat } from '@/lib/canvas-utils';

interface ResultModalProps {
  isOpen: boolean;
  isAlive: boolean;
  onClose: () => void;
}

export function ResultModal({ isOpen, isAlive, onClose }: ResultModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        if (isAlive) {
          drawAliveCat(ctx, 200, 200);
        } else {
          drawDeadCat(ctx, 200, 200);
        }
      }
    }
  }, [isOpen, isAlive]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[2000]">
      <div className="bg-[#1a1a2e] border-4 border-[#00ff41] p-8 text-center min-w-[400px] shadow-[0_0_40px_rgba(0,255,65,0.5)] animate-[popIn_0.3s_ease-out]">
        <h2
          className="font-['Press_Start_2P'] text-base mb-4 drop-shadow-[2px_2px_0_#ff00ff]"
          style={{ color: isAlive ? '#00ff41' : '#ff0055' }}
        >
          {isAlive ? '🟢 ALIVE CAT! 🟢' : '🔴 DEAD CAT! 🔴'}
        </h2>

        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          className="block mx-auto my-5 border-3 border-[#00ff41] bg-black"
        />

        <p className="font-['Press_Start_2P'] text-xs my-5 text-white">
          {isAlive
            ? 'Your cat is alive and well!'
            : 'Your cat has passed to the ghost realm...'}
        </p>

        <button
          onClick={onClose}
          className="font-['Press_Start_2P'] text-[10px] px-5 py-3 border-3 border-[#00ff41] bg-[#16213e] text-white uppercase transition-all hover:bg-[#00ff41] hover:text-[#0f0f1e] hover:shadow-[0_0_15px_#00ff41]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
