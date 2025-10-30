import { useCanvas } from '@/hooks/use-canvas';
import type { Box, Particle } from '@/lib/canvas-utils';

interface GameCanvasProps {
  boxes: Box[];
  particles: Particle[];
  onBoxClick: (index: number) => void;
  onBoxHover: (index: number, hover: boolean) => void;
}

export function GameCanvas({ boxes, particles, onBoxClick, onBoxHover }: GameCanvasProps) {
  const canvasRef = useCanvas({ boxes, particles, onBoxClick, onBoxHover });

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-center p-4 bg-[#0f0f1e] border-2 border-[#ff00ff]">
        <p className="font-['Press_Start_2P'] text-[8px] sm:text-[10px] my-1 text-[#ff00ff]">
          📦 Click a sealed box to select it!
        </p>
        <p className="font-['Press_Start_2P'] text-[8px] sm:text-[10px] my-1 text-[#ff00ff]">
          ⚡ Break the seal and play the mini-game to unbox
        </p>
        <p className="font-['Press_Start_2P'] text-[8px] sm:text-[10px] my-1 text-[#00d4ff] mt-2">
          💡 Works without MetaMask in Demo Mode!
        </p>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full max-w-[800px] h-auto border-3 border-[#00ff41] bg-black cursor-pointer"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
