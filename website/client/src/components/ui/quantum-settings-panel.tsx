import { useState } from "react";
import { X, Activity, RotateCcw } from "lucide-react";
import { useQuantumSettings } from "@/contexts/QuantumSettingsContext";
import { QuantumSlider } from "./quantum-slider";
import { QuantumWaveform } from "./quantum-waveform";

interface QuantumSettingsPanelProps {
  isAlive: boolean;
}

export function QuantumSettingsPanel({ isAlive }: QuantumSettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSettings, resetSettings } = useQuantumSettings();

  return (
    <>
      {/* Settings FAB - top right corner */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 right-4 z-[80] w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center ${
          isAlive
            ? "bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            : "bg-gradient-to-br from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500"
        }`}
        aria-label="Quantum Settings"
        title="Quantum Tuning"
      >
        <Activity
          className={`w-6 h-6 ${isAlive ? "text-white" : "text-black"} transition-all duration-300 ${
            isOpen ? "scale-110" : ""
          }`}
          style={{
            animation: isOpen ? "pulse 1s ease-in-out infinite" : "none",
          }}
        />
      </button>

      {/* Expanding Settings Panel - Desktop: slides from right, Mobile: bottom sheet */}
      <div
        className={`fixed right-0 sm:right-20 bottom-0 sm:bottom-auto sm:top-4 z-[70] transition-all duration-300 ease-out ${
          isOpen 
            ? "opacity-100 translate-x-0 translate-y-0" 
            : "opacity-0 translate-x-8 sm:translate-x-8 translate-y-full sm:translate-y-0 pointer-events-none"
        }`}
      >
        <div
          className={`w-screen sm:w-[380px] max-h-[85vh] sm:max-h-[calc(100vh-2rem)] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl border-2 border-b-0 sm:border-b-2 ${
            isAlive
              ? "bg-gradient-to-br from-black/95 to-purple-950/95 border-purple-500 text-white"
              : "bg-gradient-to-br from-white/95 to-purple-50/95 border-purple-400 text-black"
          }`}
          style={{
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Header */}
          <div
            className={`sticky top-0 z-10 flex items-center justify-between p-3 border-b ${
              isAlive ? "border-purple-700/50 bg-black/80" : "border-purple-300/50 bg-white/80"
            }`}
            style={{ backdropFilter: "blur(8px)" }}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <h2 className="text-sm font-bold font-mono">QɄ₳₦₮Ʉ₥ ₮Ʉ₦ł₦₲</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1 rounded-lg transition-colors ${
                isAlive ? "hover:bg-white/10" : "hover:bg-black/10"
              }`}
              aria-label="Close settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3 pb-safe" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
            {/* Waveform Visualization */}
            <div
              className={`p-3 rounded-xl border ${
                isAlive
                  ? "bg-purple-900/30 border-purple-500/50"
                  : "bg-purple-100/50 border-purple-400/50"
              }`}
            >
              <div className="text-[10px] font-mono font-bold mb-2">
                <span>QUANTUM WAVEFORM</span>
              </div>
              <div className="h-20 rounded-lg bg-black/20 overflow-hidden">
                <QuantumWaveform
                  frequency={settings.glitchFrequency}
                  amplitude={settings.glitchIntensity}
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Control Sliders */}
            <div className="space-y-3">
              <div
                className={`p-3 rounded-xl border ${
                  isAlive
                    ? "bg-blue-900/20 border-blue-500/50"
                    : "bg-blue-100/50 border-blue-400/50"
                }`}
              >
                <QuantumSlider
                  value={settings.animationSpeed}
                  onChange={(v) => updateSettings({ animationSpeed: v })}
                  label="SPEED"
                  min={0.1}
                  max={2.0}
                  color="#3b82f6"
                />
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  isAlive
                    ? "bg-purple-900/20 border-purple-500/50"
                    : "bg-purple-100/50 border-purple-400/50"
                }`}
              >
                <QuantumSlider
                  value={settings.glitchIntensity}
                  onChange={(v) => updateSettings({ glitchIntensity: v })}
                  label="INTENSITY"
                  min={0.0}
                  max={1.0}
                  color="#8b5cf6"
                />
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  isAlive
                    ? "bg-pink-900/20 border-pink-500/50"
                    : "bg-pink-100/50 border-pink-400/50"
                }`}
              >
                <QuantumSlider
                  value={settings.glitchFrequency}
                  onChange={(v) => updateSettings({ glitchFrequency: v })}
                  label="FREQUENCY"
                  min={0.1}
                  max={2.0}
                  color="#ec4899"
                />
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  isAlive
                    ? "bg-cyan-900/20 border-cyan-500/50"
                    : "bg-cyan-100/50 border-cyan-400/50"
                }`}
              >
                <QuantumSlider
                  value={settings.flickerIntensity}
                  onChange={(v) => updateSettings({ flickerIntensity: v })}
                  label="FLICKER"
                  min={0.0}
                  max={1.0}
                  color="#06b6d4"
                />
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetSettings}
              className={`w-full py-2.5 rounded-xl font-bold font-mono text-xs transition-all flex items-center justify-center gap-2 ${
                isAlive
                  ? "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                  : "bg-gradient-to-r from-red-400 to-orange-400 hover:from-red-500 hover:to-orange-500 text-white"
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              RESET QUANTUM STATE
            </button>

            {/* Quantum Footer */}
            <div
              className={`text-center text-[9px] opacity-50 font-mono ${
                isAlive ? "text-purple-300" : "text-purple-700"
              }`}
            >
              h = 6.62607015 × 10⁻³⁴ J⋅s
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}
