# Quantum Settings Panel Implementation

## Overview
Added a quantum-themed settings FAB (Floating Action Button) that opens a panel with controls for animation speed, glitch intensity, glitch frequency, and flicker effects.

## Features Implemented

### 1. Quantum Settings Context (`src/contexts/QuantumSettingsContext.tsx`)
- Global state management for quantum settings
- Controls:
  - **Animation Speed** (0.1 - 2.0): Controls temporal flow of all animations
  - **Glitch Intensity** (0.0 - 1.0): Modulates the amplitude of glitch effects
  - **Glitch Frequency** (0.1 - 2.0): Adjusts how often quantum collapses occur
  - **Flicker Intensity** (0.0 - 1.0): Tunes the superposition uncertainty

### 2. Quantum Waveform Visualization (`src/components/ui/quantum-waveform.tsx`)
- Real-time canvas-based quantum wave visualization
- Shows interference patterns with multiple waves:
  - Primary purple wave (main quantum state)
  - Secondary cyan wave (superposition)
  - Pink glitch wave (probability density)
- Responds to frequency and amplitude settings

### 3. Quantum Knob Component (`src/components/ui/quantum-knob.tsx`)
- Custom rotary knob control with quantum-inspired design
- Features:
  - Drag to adjust values (mouse and touch support)
  - Visual tick marks
  - Gradient lighting effects
  - Real-time value display
  - Fully responsive (60px on mobile, 80px on desktop)

### 4. Quantum Settings Panel (`src/components/ui/quantum-settings-panel.tsx`)
- Floating Action Button (FAB) in bottom-left corner
- Panel displays:
  - Animated quantum waveform visualization
  - 4 interactive quantum knobs (Speed, Intensity, Frequency, Flicker)
  - Info panel explaining each control
  - Reset button to restore defaults
  - Planck's constant footer

### 5. Mobile Responsiveness
- **Mobile (< 640px)**:
  - Full-width bottom sheet panel
  - Smaller knobs (60px)
  - Reduced padding and text sizes
  - Touch-optimized controls
  - Safe area support for notched devices
  - Hides formula on small screens
  
- **Desktop (≥ 640px)**:
  - Side panel (420px wide)
  - Larger knobs (80px default, 60px in panel)
  - More spacious layout
  - Hover effects

### 6. Integration with Existing Effects
- Settings affect all glitch and flicker effects throughout the app
- CSS variables updated in real-time
- Glitch duration scales with animation speed
- Flicker patterns respond to intensity settings
- Auto-switch timing adjusts with frequency
- Text scrambling speed controlled by animation speed

## Technical Details

### CSS Variables
Added to `index.css`:
```css
--quantum-animation-speed: 1;
--quantum-glitch-intensity: 1;
```

### Effect Adjustments
1. **Glitch Duration**: `baseDuration / animationSpeed`
2. **Flicker Speed**: `40ms / animationSpeed`
3. **Text Scramble**: `75ms / animationSpeed`
4. **Auto-switch Interval**: `baseDelay / glitchFrequency`
5. **Shake Amount**: `shakeAmount * glitchIntensity`
6. **Opacity Effects**: `effectiveIntensity * flickerIntensity`

### Theme Integration
- Adapts colors based on quantum cat state (alive/dead)
- Matches existing quantum aesthetic
- Uses project color palette (purple, blue, cyan, pink)

## User Experience
1. Click settings FAB (bottom-left) to open panel
2. Adjust knobs by dragging up/down
3. Watch quantum waveform respond in real-time
4. See immediate effect on page animations
5. Reset to defaults with one click
6. Close panel by clicking backdrop or X button

## Default Settings
All settings default to 1.0 (normal):
- Animation Speed: 1.0x
- Glitch Intensity: 100%
- Glitch Frequency: 1.0x
- Flicker Intensity: 100%

## Files Modified
1. `src/App.tsx` - Added QuantumSettingsProvider
2. `src/pages/home.tsx` - Integrated settings and panel
3. `src/index.css` - Added CSS variables

## Files Created
1. `src/contexts/QuantumSettingsContext.tsx`
2. `src/components/ui/quantum-settings-panel.tsx`
3. `src/components/ui/quantum-knob.tsx`
4. `src/components/ui/quantum-waveform.tsx`

## Design Philosophy
- Quantum physics aesthetic (waveforms, Planck's constant)
- Sci-fi control panel feel
- Tactile, physical knob interactions
- Real-time visual feedback
- Mobile-first responsive design
- Accessible touch and mouse controls

