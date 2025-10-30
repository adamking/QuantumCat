// Canvas drawing utilities for 8-bit style graphics

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
  hover: boolean;
  pulse: number;
  selected: boolean;
  sealed: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

// Draw 8-bit sealed box
export function draw8BitBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  selected: boolean,
  hover: boolean
) {
  // Simple cardboard brown colors
  const boxColor = '#8B4513';      // Main cardboard brown
  const darkColor = '#654321';     // Darker shade
  const lightColor = '#A0522D';    // Lighter shade

  // Main box body
  ctx.fillStyle = boxColor;
  ctx.fillRect(x, y, width, height);

  // Simple 3D effect - dark shading on bottom and right
  ctx.fillStyle = darkColor;
  ctx.fillRect(x, y + height - 12, width, 12);        // Bottom edge
  ctx.fillRect(x + width - 12, y, 12, height);        // Right edge

  // Light highlight on top and left
  ctx.fillStyle = lightColor;
  ctx.fillRect(x, y, width, 8);                        // Top edge
  ctx.fillRect(x, y, 8, height);                       // Left edge

  // Box flap line in the middle
  ctx.fillStyle = darkColor;
  ctx.fillRect(x + 10, y + height / 2 - 1, width - 20, 2);

  // Black border
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, width, height);

  // Add glow effect when hovering or selected
  if (hover || selected) {
    ctx.strokeStyle = selected ? '#ff00ff' : '#00ff41';
    ctx.lineWidth = 4;
    ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
  }

  // Simple question mark or text
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  ctx.fillStyle = '#000';
  ctx.font = '48px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', centerX, centerY);

  // Small label at bottom
  if (selected) {
    ctx.fillStyle = '#fff';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('SELECTED', centerX, y + height - 20);
  }
}

// Draw 8-bit alive cat sprite
export function drawAliveCat(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  // Simple 8-bit cat sprite
  const pixelSize = 10;
  const offsetX = 60;
  const offsetY = 60;

  // Green cat
  ctx.fillStyle = '#00ff41';
  const catPattern = [
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 1, 1, 1, 1, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0]
  ];

  catPattern.forEach((row, y) => {
    row.forEach((pixel, x) => {
      if (pixel) {
        ctx.fillRect(
          offsetX + x * pixelSize,
          offsetY + y * pixelSize,
          pixelSize,
          pixelSize
        );
      }
    });
  });

  // Eyes
  ctx.fillStyle = '#000';
  ctx.fillRect(offsetX + 3 * pixelSize, offsetY + 3 * pixelSize, pixelSize, pixelSize);
  ctx.fillRect(offsetX + 6 * pixelSize, offsetY + 3 * pixelSize, pixelSize, pixelSize);
}

// Draw 8-bit dead cat sprite
export function drawDeadCat(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  const pixelSize = 10;
  const offsetX = 60;
  const offsetY = 60;

  // Red/ghost cat
  ctx.fillStyle = '#ff0055';
  const catPattern = [
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 1, 1, 1, 1, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0]
  ];

  catPattern.forEach((row, y) => {
    row.forEach((pixel, x) => {
      if (pixel) {
        ctx.fillRect(
          offsetX + x * pixelSize,
          offsetY + y * pixelSize,
          pixelSize,
          pixelSize
        );
      }
    });
  });

  // X_X eyes
  ctx.fillStyle = '#000';
  // Left eye X
  ctx.fillRect(offsetX + 2 * pixelSize, offsetY + 3 * pixelSize, pixelSize * 2, 2);
  ctx.fillRect(offsetX + 3 * pixelSize, offsetY + 2 * pixelSize, 2, pixelSize * 2);
  // Right eye X
  ctx.fillRect(offsetX + 6 * pixelSize, offsetY + 3 * pixelSize, pixelSize * 2, 2);
  ctx.fillRect(offsetX + 7 * pixelSize, offsetY + 2 * pixelSize, 2, pixelSize * 2);
}

// Create particle effects
export function createParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 20; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 60,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`
    });
  }
  return particles;
}

// Create grid of mystery boxes
export function createBoxes(canvasWidth: number, _canvasHeight: number): Box[] {
  const cols = 4;
  const rows = 3;
  const boxSize = 100;
  const padding = 50;
  const startX = (canvasWidth - (cols * boxSize + (cols - 1) * padding)) / 2;
  const startY = 100;

  const boxes: Box[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      boxes.push({
        x: startX + col * (boxSize + padding),
        y: startY + row * (boxSize + padding),
        width: boxSize,
        height: boxSize,
        hover: false,
        pulse: 0,
        sealed: true,
        selected: false
      });
    }
  }
  return boxes;
}
