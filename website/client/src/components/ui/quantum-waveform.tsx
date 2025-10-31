import { useEffect, useRef } from "react";

interface QuantumWaveformProps {
  frequency: number; // 0-1
  amplitude: number; // 0-1
  className?: string;
}

export function QuantumWaveform({ frequency, amplitude, className = "" }: QuantumWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const centerY = height / 2;
      const baseFreq = 0.02 + frequency * 0.08;
      const baseAmp = amplitude * (height * 0.35);

      // Draw quantum wave interference pattern
      ctx.beginPath();
      ctx.strokeStyle = "rgba(139, 92, 246, 0.8)"; // Purple
      ctx.lineWidth = 2;

      for (let x = 0; x < width; x++) {
        const wave1 = Math.sin(x * baseFreq + timeRef.current) * baseAmp;
        const wave2 = Math.sin(x * baseFreq * 1.5 - timeRef.current * 0.7) * (baseAmp * 0.7);
        const y = centerY + wave1 + wave2;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw secondary wave (cyan - representing superposition)
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 255, 255, 0.5)";
      ctx.lineWidth = 1.5;

      for (let x = 0; x < width; x++) {
        const wave1 = Math.cos(x * baseFreq * 0.8 - timeRef.current * 1.2) * (baseAmp * 0.6);
        const wave2 = Math.cos(x * baseFreq * 2 + timeRef.current * 0.5) * (baseAmp * 0.4);
        const y = centerY + wave1 + wave2;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw probability density (pink glitch)
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 0, 193, 0.4)";
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x++) {
        const noise = (Math.random() - 0.5) * baseAmp * 0.3 * frequency;
        const wave = Math.sin(x * baseFreq * 3 + timeRef.current * 2) * (baseAmp * 0.3);
        const y = centerY + wave + noise;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      timeRef.current += 0.02 + frequency * 0.03;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [frequency, amplitude]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

