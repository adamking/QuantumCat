import { createContext, useContext, useState, ReactNode } from "react";

export interface QuantumSettings {
  animationSpeed: number; // 0.1 to 2.0 (multiplier)
  glitchIntensity: number; // 0.0 to 1.0
  glitchFrequency: number; // 0.1 to 2.0 (multiplier - affects how often glitches occur)
  flickerIntensity: number; // 0.0 to 1.0
}

interface QuantumSettingsContextType {
  settings: QuantumSettings;
  updateSettings: (newSettings: Partial<QuantumSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: QuantumSettings = {
  animationSpeed: 1.0,
  glitchIntensity: 1.0,
  glitchFrequency: 1.0,
  flickerIntensity: 1.0,
};

const QuantumSettingsContext = createContext<QuantumSettingsContextType | undefined>(undefined);

export function QuantumSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<QuantumSettings>(defaultSettings);

  const updateSettings = (newSettings: Partial<QuantumSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <QuantumSettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </QuantumSettingsContext.Provider>
  );
}

export function useQuantumSettings() {
  const context = useContext(QuantumSettingsContext);
  if (context === undefined) {
    throw new Error("useQuantumSettings must be used within a QuantumSettingsProvider");
  }
  return context;
}

