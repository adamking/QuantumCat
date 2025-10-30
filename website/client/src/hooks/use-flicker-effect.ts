import { useEffect, useState, useRef } from "react";

interface FlickerState {
  showBothFlicker: boolean;
  flickerIntensity: number;
}

interface FlickerPattern {
  show: boolean;
  intensity: number;
  duration: number;
}

export function useFlickerEffect(onFlicker?: () => void, isPaused: boolean = false) {
  const [flickerState, setFlickerState] = useState<FlickerState>({
    showBothFlicker: false,
    flickerIntensity: 1,
  });

  // Use a ref to store the latest callback without causing effect re-runs
  const onFlickerRef = useRef(onFlicker);
  const isPausedRef = useRef(isPaused);

  // Track all timeouts for proper cleanup
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const isMountedRef = useRef(true);

  useEffect(() => {
    onFlickerRef.current = onFlicker;
  }, [onFlicker]);

  // Separate effect to track pause state
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isMountedRef.current = true;

    const triggerFluorescentFlicker = () => {
      // Don't start new flicker if unmounted or paused
      if (!isMountedRef.current || isPausedRef.current) return;

      // Notify that flicker is starting (for sound)
      onFlickerRef.current?.();

      // Fluorescent lights flicker multiple times rapidly with varying intensity
      const flickerPattern: FlickerPattern[] = [
        { show: true, intensity: 0.7, duration: 50 },
        { show: false, intensity: 0, duration: 30 },
        { show: true, intensity: 0.9, duration: 80 },
        { show: false, intensity: 0, duration: 40 },
        { show: true, intensity: 0.6, duration: 60 },
        { show: false, intensity: 0, duration: 50 },
        { show: true, intensity: 1, duration: 100 },
        { show: false, intensity: 0, duration: 0 },
      ];

      let currentTime = 0;
      flickerPattern.forEach((step) => {
        const timeoutId = setTimeout(() => {
          if (!isMountedRef.current || isPausedRef.current) return;
          setFlickerState({
            showBothFlicker: step.show,
            flickerIntensity: step.intensity,
          });
          timeoutsRef.current.delete(timeoutId);
        }, currentTime);
        timeoutsRef.current.add(timeoutId);
        currentTime += step.duration;
      });
    };

    // Start flickering after initial delay
    const flickerLoop = () => {
      if (!isMountedRef.current || isPausedRef.current) return;

      triggerFluorescentFlicker();
      // Schedule next flicker with random interval between 4-8 seconds
      const randomDelay = 4000 + Math.random() * 4000;
      const timeoutId = setTimeout(flickerLoop, randomDelay);
      timeoutsRef.current.add(timeoutId);
    };

    // Start after 4 seconds
    const initialTimeout = setTimeout(() => {
      flickerLoop();
    }, 4000);
    timeoutsRef.current.add(initialTimeout);

    return () => {
      isMountedRef.current = false;
      // Clear all tracked timeouts
      timeoutsRef.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      timeoutsRef.current.clear();
    };
  }, []); // Empty dependency array - only run once on mount
  
  // Handle pause/resume
  useEffect(() => {
    if (isPaused) {
      // Clear flicker state when paused
      setFlickerState({
        showBothFlicker: false,
        flickerIntensity: 1,
      });
      // Clear all pending timeouts
      timeoutsRef.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      timeoutsRef.current.clear();
    } else if (isMountedRef.current) {
      // Resume: restart flicker loop immediately
      const triggerFluorescentFlicker = () => {
        if (!isMountedRef.current || isPausedRef.current) return;

        onFlickerRef.current?.();

        const flickerPattern: FlickerPattern[] = [
          { show: true, intensity: 0.7, duration: 50 },
          { show: false, intensity: 0, duration: 30 },
          { show: true, intensity: 0.9, duration: 80 },
          { show: false, intensity: 0, duration: 40 },
          { show: true, intensity: 0.6, duration: 60 },
          { show: false, intensity: 0, duration: 50 },
          { show: true, intensity: 1, duration: 100 },
          { show: false, intensity: 0, duration: 0 },
        ];

        let currentTime = 0;
        flickerPattern.forEach((step) => {
          const timeoutId = setTimeout(() => {
            if (!isMountedRef.current || isPausedRef.current) return;
            setFlickerState({
              showBothFlicker: step.show,
              flickerIntensity: step.intensity,
            });
            timeoutsRef.current.delete(timeoutId);
          }, currentTime);
          timeoutsRef.current.add(timeoutId);
          currentTime += step.duration;
        });
      };

      const flickerLoop = () => {
        if (!isMountedRef.current || isPausedRef.current) return;

        triggerFluorescentFlicker();
        const randomDelay = 4000 + Math.random() * 4000;
        const timeoutId = setTimeout(flickerLoop, randomDelay);
        timeoutsRef.current.add(timeoutId);
      };

      // Start flicker loop after a short delay when resuming
      const resumeTimeout = setTimeout(() => {
        flickerLoop();
      }, 2000);
      timeoutsRef.current.add(resumeTimeout);
    }
  }, [isPaused]);

  return flickerState;
}

