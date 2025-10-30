import { useCallback, useRef, useEffect } from "react";

export function useSoundEffects(isMuted: boolean = false) {
  const audioContextRef = useRef<AudioContext | null>(null);
  // Track active audio nodes for cleanup
  const activeNodesRef = useRef<Set<OscillatorNode | AudioBufferSourceNode>>(new Set());

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        // Resume context immediately if suspended (handles autoplay policy)
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch((error) => {
            console.debug('Failed to resume audio context:', error);
          });
        }
      } catch (error) {
        console.debug('Failed to create audio context:', error);
      }
    } else if (audioContextRef.current.state === 'suspended') {
      // Always try to resume if suspended
      audioContextRef.current.resume().catch((error) => {
        console.debug('Failed to resume audio context:', error);
      });
    }
    return audioContextRef.current;
  }, []);

  // Cleanup effect for AudioContext and active nodes
  useEffect(() => {
    return () => {
      // Stop all active audio nodes
      activeNodesRef.current.forEach((node) => {
        try {
          node.stop();
        } catch (error) {
          // Node may have already stopped
        }
      });
      activeNodesRef.current.clear();

      // Close audio context to free system resources
      if (audioContextRef.current) {
        audioContextRef.current.close().catch((error) => {
          console.debug('Failed to close audio context:', error);
        });
        audioContextRef.current = null;
      }
    };
  }, []);
  
  const playGlitchSound = useCallback((duration: number) => {
    if (isMuted) return;

    const audioContext = getAudioContext();
    if (!audioContext) return;
    try {
      const now = audioContext.currentTime;
      const durationInSeconds = duration / 1000;

      // Create oscillator for electric buzz (like flicker sound)
      const oscillator = audioContext.createOscillator();
      const oscillatorGain = audioContext.createGain();

      // Create white noise for crackle effect
      const bufferSize = audioContext.sampleRate * durationInSeconds;
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noiseSource = audioContext.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const noiseGain = audioContext.createGain();

      // Track nodes for cleanup
      activeNodesRef.current.add(oscillator);
      activeNodesRef.current.add(noiseSource);

      // Low frequency buzz like fluorescent light
      oscillator.frequency.value = 60; // 60Hz hum
      oscillator.type = 'sawtooth';

      // Connect nodes
      oscillator.connect(oscillatorGain);
      noiseSource.connect(noiseGain);
      oscillatorGain.connect(audioContext.destination);
      noiseGain.connect(audioContext.destination);

      // Set base volumes (reduced by 25%)
      oscillatorGain.gain.value = 0.09;
      noiseGain.gain.value = 0;

      // Oscillator envelope - sustained buzz with variations
      oscillatorGain.gain.setValueAtTime(0, now);
      oscillatorGain.gain.linearRampToValueAtTime(0.09, now + 0.05);

      // Add random intensity variations throughout
      const variationCount = Math.floor(durationInSeconds * 8);
      for (let i = 0; i < variationCount; i++) {
        const time = now + 0.05 + (i / variationCount) * (durationInSeconds - 0.1);
        const intensity = 0.06 + Math.random() * 0.06;
        oscillatorGain.gain.setValueAtTime(intensity, time);
      }

      oscillatorGain.gain.linearRampToValueAtTime(0, now + durationInSeconds);

      // Add electric crackles throughout the duration
      const crackleCount = Math.floor(durationInSeconds * 25); // More frequent crackles
      for (let i = 0; i < crackleCount; i++) {
        const crackleTime = now + (Math.random() * durationInSeconds);
        const crackleIntensity = 0.0675 + Math.random() * 0.10125;
        const crackleDuration = 0.01 + Math.random() * 0.02;

        noiseGain.gain.setValueAtTime(0, crackleTime);
        noiseGain.gain.linearRampToValueAtTime(crackleIntensity, crackleTime + crackleDuration * 0.3);
        noiseGain.gain.linearRampToValueAtTime(0, crackleTime + crackleDuration);
      }

      // Play sound
      oscillator.start(now);
      noiseSource.start(now);
      oscillator.stop(now + durationInSeconds);
      noiseSource.stop(now + durationInSeconds);

      // Remove from active nodes when finished
      oscillator.onended = () => {
        activeNodesRef.current.delete(oscillator);
      };
      noiseSource.onended = () => {
        activeNodesRef.current.delete(noiseSource);
      };
    } catch (error) {
      // Ignore audio errors
      console.debug('Failed to play glitch sound:', error);
    }
  }, [isMuted, getAudioContext]);

  const playFlickerBuzz = useCallback(() => {
    if (isMuted) return;

    const audioContext = getAudioContext();
    if (!audioContext) return;

    try {
      const now = audioContext.currentTime;
      const duration = 0.4; // 400ms buzz

      // Create oscillator for electric buzz
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Track node for cleanup
      activeNodesRef.current.add(oscillator);

      // Low frequency buzz like fluorescent light
      oscillator.frequency.value = 60; // 60Hz hum
      oscillator.type = 'sawtooth';

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Volume envelope to match flicker pattern
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.06, now + 0.02);
      gainNode.gain.setValueAtTime(0, now + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.06, now + 0.08);
      gainNode.gain.setValueAtTime(0, now + 0.13);
      gainNode.gain.linearRampToValueAtTime(0.06, now + 0.17);
      gainNode.gain.setValueAtTime(0, now + 0.22);
      gainNode.gain.linearRampToValueAtTime(0.06, now + 0.25);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);

      // Play sound
      oscillator.start(now);
      oscillator.stop(now + duration);

      // Remove from active nodes when finished
      oscillator.onended = () => {
        activeNodesRef.current.delete(oscillator);
      };
    } catch (error) {
      // Ignore audio errors
      console.debug('Failed to play flicker buzz:', error);
    }
  }, [isMuted, getAudioContext]);

  return {
    playGlitchSound,
    playFlickerBuzz,
  };
}

