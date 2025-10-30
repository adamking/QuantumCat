import { useEffect, useRef, useCallback } from 'react';
import type { Box, Particle } from '@/lib/canvas-utils';
import { draw8BitBox } from '@/lib/canvas-utils';

interface UseCanvasProps {
  boxes: Box[];
  particles: Particle[];
  onBoxClick: (index: number) => void;
  onBoxHover: (index: number, hover: boolean) => void;
}

export function useCanvas({ boxes, particles, onBoxClick, onBoxHover }: UseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Handle mouse click
  const handleClick = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    boxes.forEach((box, index) => {
      if (x >= box.x && x <= box.x + box.width &&
          y >= box.y && y <= box.y + box.height) {
        onBoxClick(index);
      }
    });
  }, [boxes, onBoxClick]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    boxes.forEach((box, index) => {
      const isHover = x >= box.x && x <= box.x + box.width &&
                      y >= box.y && y <= box.y + box.height;
      if (isHover !== box.hover) {
        onBoxHover(index, isHover);
      }
    });
  }, [boxes, onBoxHover]);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid background
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw title
    ctx.fillStyle = '#00ff41';
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MYSTERY BOXES', canvas.width / 2, 50);

    // Draw boxes
    boxes.forEach((box) => {
      const pulseSize = Math.sin(box.pulse) * 2;

      // Box shadow/glow
      if (box.hover || box.selected) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = box.selected ? '#ff00ff' : '#00ff41';
      } else {
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00d4ff';
      }

      // Draw 8-bit sealed box
      draw8BitBox(
        ctx,
        box.x - pulseSize / 2,
        box.y - pulseSize / 2,
        box.width + pulseSize,
        box.height + pulseSize,
        box.selected,
        box.hover
      );

      ctx.shadowBlur = 0;
    });

    // Draw particles
    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 4, 4);
    });

    ctx.shadowBlur = 0;
  }, [boxes, particles]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  // Event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleClick, handleMouseMove]);

  return canvasRef;
}
