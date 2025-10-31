import { useRef, useEffect, useState } from "react";

interface QuantumKnobProps {
  value: number; // 0-1
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  size?: number;
  color?: string;
}

export function QuantumKnob({
  value,
  onChange,
  label,
  min = 0,
  max = 1,
  size = 80,
  color = "#8b5cf6",
}: QuantumKnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);

  // Convert value to angle (-135 to 135 degrees)
  const normalizedValue = (value - min) / (max - min);
  const angle = -135 + normalizedValue * 270;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValueRef.current = value;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.touches[0]?.clientY ?? 0;
    startValueRef.current = value;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaY = startYRef.current - e.clientY;
      const sensitivity = 0.005;
      const newValue = Math.max(min, Math.min(max, startValueRef.current + deltaY * sensitivity));
      onChange(newValue);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      const deltaY = startYRef.current - (e.touches[0]?.clientY ?? 0);
      const sensitivity = 0.005;
      const newValue = Math.max(min, Math.min(max, startValueRef.current + deltaY * sensitivity));
      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, min, max, onChange, value]);

  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2">
      <div
        ref={knobRef}
        className="relative cursor-pointer select-none touch-none"
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Knob base */}
        <div
          className="absolute inset-0 rounded-full shadow-lg transition-all"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${color}dd, ${color}66)`,
            boxShadow: isDragging
              ? `0 0 20px ${color}, inset 0 2px 4px rgba(0,0,0,0.3)`
              : `0 4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.3)`,
          }}
        />

        {/* Rotation indicator line */}
        <div
          className="absolute inset-0"
          style={{ transform: `rotate(${angle}deg)`, transition: isDragging ? "none" : "transform 0.1s" }}
        >
          <div
            className="absolute top-2 left-1/2 w-1 h-6 -ml-0.5 rounded-full"
            style={{
              background: "linear-gradient(to bottom, #ffffff, rgba(255,255,255,0.4))",
              boxShadow: `0 0 4px ${color}`,
            }}
          />
        </div>

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.8), rgba(255,255,255,0.2))",
            }}
          />
        </div>

        {/* Tick marks */}
        {[...Array(11)].map((_, i) => {
          const tickAngle = -135 + i * 27;
          return (
            <div
              key={i}
              className="absolute inset-0"
              style={{ transform: `rotate(${tickAngle}deg)` }}
            >
              <div
                className="absolute top-1 left-1/2 w-0.5 h-2 -ml-px bg-white/30 rounded-full"
              />
            </div>
          );
        })}
      </div>

      {/* Label */}
      <div className="text-[10px] sm:text-xs font-mono text-center">
        <div className="font-bold">{label}</div>
        <div className="text-[8px] sm:text-[10px] opacity-70">{value.toFixed(2)}</div>
      </div>
    </div>
  );
}

