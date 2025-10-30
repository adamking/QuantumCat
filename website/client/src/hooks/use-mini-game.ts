import { useState, useEffect, useRef, useCallback } from 'react';

interface MiniGameItem {
  x: number;
  y: number;
  width: number;
  height: number;
  isGood: boolean;
  speed: number;
}

interface MiniGamePlayer {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export function useMiniGame() {
  const [isActive, setIsActive] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [items, setItems] = useState<MiniGameItem[]>([]);
  const [player, setPlayer] = useState<MiniGamePlayer>({
    x: 180,
    y: 250,
    width: 40,
    height: 40,
    speed: 5
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const spawnIntervalRef = useRef<NodeJS.Timeout>();
  const timerIntervalRef = useRef<NodeJS.Timeout>();
  const animationFrameRef = useRef<number>();

  // Spawn items
  const spawnItem = useCallback(() => {
    const isGood = Math.random() > 0.3; // 70% good, 30% bad
    const newItem: MiniGameItem = {
      x: Math.random() * 380,
      y: -20,
      width: 20,
      height: 20,
      isGood,
      speed: 2 + Math.random() * 2
    };
    setItems(prev => [...prev, newItem]);
  }, []);

  // Update game state
  const update = useCallback(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update player position
    setPlayer(prev => {
      let newX = prev.x;
      if (keysRef.current['ArrowLeft'] || keysRef.current['a']) {
        newX = Math.max(0, prev.x - prev.speed);
      }
      if (keysRef.current['ArrowRight'] || keysRef.current['d']) {
        newX = Math.min(canvas.width - prev.width, prev.x + prev.speed);
      }
      return { ...prev, x: newX };
    });

    // Draw player (box)
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, player.width, player.height);

    // Update and draw items
    setItems(prevItems => {
      const updatedItems: MiniGameItem[] = [];

      prevItems.forEach(item => {
        const newY = item.y + item.speed;
        const updatedItem = { ...item, y: newY };

        // Check collision
        if (
          updatedItem.y + updatedItem.height > player.y &&
          updatedItem.y < player.y + player.height &&
          updatedItem.x + updatedItem.width > player.x &&
          updatedItem.x < player.x + player.width
        ) {
          // Collision detected
          if (updatedItem.isGood) {
            setScore(s => s + 10);
          } else {
            setScore(s => Math.max(0, s - 5));
          }
          return; // Don't add this item
        }

        // Keep item if still on screen
        if (updatedItem.y < canvas.height) {
          updatedItems.push(updatedItem);
        }
      });

      return updatedItems;
    });

    // Draw items
    items.forEach(item => {
      ctx.fillStyle = item.isGood ? '#00ff41' : '#ff0055';
      ctx.beginPath();
      ctx.arc(item.x + 10, item.y + 10, 10, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw instructions
    ctx.fillStyle = '#fff';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText('Use Arrow Keys', 10, 20);

    animationFrameRef.current = requestAnimationFrame(update);
  }, [isActive, items, player]);

  // Start game
  const start = useCallback(() => {
    setIsActive(true);
    setScore(0);
    setTimeLeft(10);
    setItems([]);
    setPlayer({
      x: 180,
      y: 250,
      width: 40,
      height: 40,
      speed: 5
    });

    // Start spawn interval
    spawnIntervalRef.current = setInterval(spawnItem, 500);

    // Start timer
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [spawnItem]);

  // End game
  const end = useCallback(() => {
    setIsActive(false);

    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Auto-end when time runs out
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      end();
    }
  }, [timeLeft, isActive, end]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    if (isActive) {
      animationFrameRef.current = requestAnimationFrame(update);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, update]);

  return {
    canvasRef,
    isActive,
    score,
    timeLeft,
    start,
    end
  };
}
