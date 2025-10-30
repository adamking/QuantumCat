import { useState, useCallback } from 'react';
import type { Box, Particle } from '@/lib/canvas-utils';
import { createParticles } from '@/lib/canvas-utils';

export interface GameState {
  boxes: Box[];
  selectedBox: number | null;
  score: number;
  totalUnboxed: number;
  aliveCount: number;
  deadCount: number;
  particles: Particle[];
}

export function useGameState(initialBoxes: Box[]) {
  const [state, setState] = useState<GameState>({
    boxes: initialBoxes,
    selectedBox: null,
    score: 0,
    totalUnboxed: 0,
    aliveCount: 0,
    deadCount: 0,
    particles: []
  });

  const selectBox = useCallback((index: number) => {
    setState(prev => {
      const newBoxes = prev.boxes.map((box, i) => ({
        ...box,
        selected: i === index
      }));

      const box = newBoxes[index];
      if (!box) return prev;

      const newParticles = createParticles(
        box.x + box.width / 2,
        box.y + box.height / 2
      );

      return {
        ...prev,
        boxes: newBoxes,
        selectedBox: index,
        particles: [...prev.particles, ...newParticles]
      };
    });
  }, []);

  const updateBoxHover = useCallback((index: number, hover: boolean) => {
    setState(prev => ({
      ...prev,
      boxes: prev.boxes.map((box, i) =>
        i === index ? { ...box, hover } : box
      )
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedBox: null,
      boxes: prev.boxes.map(box => ({ ...box, selected: false }))
    }));
  }, []);

  const recordUnbox = useCallback((isAlive: boolean) => {
    setState(prev => ({
      ...prev,
      totalUnboxed: prev.totalUnboxed + 1,
      aliveCount: prev.aliveCount + (isAlive ? 1 : 0),
      deadCount: prev.deadCount + (isAlive ? 0 : 1)
    }));
  }, []);

  const addScore = useCallback((points: number) => {
    setState(prev => ({
      ...prev,
      score: prev.score + points
    }));
  }, []);

  const updateParticles = useCallback(() => {
    setState(prev => ({
      ...prev,
      particles: prev.particles
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 1
        }))
        .filter(p => p.life > 0)
    }));
  }, []);

  const updateBoxPulse = useCallback(() => {
    setState(prev => ({
      ...prev,
      boxes: prev.boxes.map(box => ({
        ...box,
        pulse: box.pulse + 0.05
      }))
    }));
  }, []);

  return {
    state,
    selectBox,
    updateBoxHover,
    clearSelection,
    recordUnbox,
    addScore,
    updateParticles,
    updateBoxPulse
  };
}
