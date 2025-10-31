interface QuantumSliderProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  color?: string;
}

export function QuantumSlider({
  value,
  onChange,
  label,
  min = 0,
  max = 1,
  color = "#8b5cf6",
}: QuantumSliderProps) {
  const normalizedValue = (value - min) / (max - min);
  const percentage = normalizedValue * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-mono font-bold">{label}</label>
        <span className="text-xs sm:text-sm font-mono opacity-70">{value.toFixed(2)}</span>
      </div>
      
      <div className="relative">
        {/* Track background */}
        <div className="h-2 rounded-full bg-black/20 overflow-hidden">
          {/* Filled track */}
          <div
            className="h-full transition-all duration-150 rounded-full"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(to right, ${color}88, ${color})`,
              boxShadow: `0 0 8px ${color}66`,
            }}
          />
        </div>
        
        {/* Slider input */}
        <input
          type="range"
          min={min}
          max={max}
          step={0.01}
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ margin: 0 }}
        />
        
        {/* Thumb indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full pointer-events-none transition-all duration-150"
          style={{
            left: `${percentage}%`,
            transform: `translate(-50%, -50%)`,
            background: `radial-gradient(circle at 30% 30%, ${color}, ${color}cc)`,
            boxShadow: `0 0 12px ${color}, 0 2px 4px rgba(0,0,0,0.3)`,
          }}
        />
      </div>
    </div>
  );
}

