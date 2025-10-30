// Game State
const gameState = {
    canvas: null,
    ctx: null,
    boxes: [],
    selectedBox: null,
    score: 0,
    totalUnboxed: 0,
    aliveCount: 0,
    deadCount: 0,
    animationFrame: null,
    particles: []
};

// Mini-Game State
const miniGame = {
    canvas: null,
    ctx: null,
    player: { x: 200, y: 250, width: 40, height: 40, speed: 5 },
    items: [],
    score: 0,
    timeLeft: 10,
    isActive: false,
    keys: {},
    interval: null
};

// Initialize game when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setupEventListeners();
});

function initializeGame() {
    // Main canvas
    gameState.canvas = document.getElementById('gameCanvas');
    gameState.ctx = gameState.canvas.getContext('2d');
    
    // Mini-game canvas
    miniGame.canvas = document.getElementById('miniGameCanvas');
    miniGame.ctx = miniGame.canvas.getContext('2d');
    
    // Create mystery boxes
    createBoxes();
    
    // Start render loop
    renderGame();
}

function createBoxes() {
    const cols = 4;
    const rows = 3;
    const boxSize = 100;
    const padding = 50;
    const startX = (gameState.canvas.width - (cols * boxSize + (cols - 1) * padding)) / 2;
    const startY = 100;
    
    gameState.boxes = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            gameState.boxes.push({
                x: startX + col * (boxSize + padding),
                y: startY + row * (boxSize + padding),
                width: boxSize,
                height: boxSize,
                hover: false,
                pulse: 0,
                sealed: true
            });
        }
    }
}

function draw8BitBox(ctx, x, y, width, height, selected, hover) {
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
    ctx.font = '48px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', centerX, centerY);
    
    // Small label at bottom
    if (selected) {
        ctx.fillStyle = '#fff';
        ctx.font = '8px "Press Start 2P"';
        ctx.fillText('SELECTED', centerX, y + height - 20);
    }
}

function setupEventListeners() {
    // Canvas click
    gameState.canvas.addEventListener('click', handleCanvasClick);
    gameState.canvas.addEventListener('mousemove', handleCanvasMouseMove);
    
    // Buttons
    document.getElementById('unboxButton').addEventListener('click', startUnboxSequence);
    document.getElementById('reboxButton').addEventListener('click', handleRebox);
    document.getElementById('refreshButton').addEventListener('click', () => {
        if (window.blockchain && window.blockchain.updateBalances) {
            window.blockchain.updateBalances();
        }
    });
    document.getElementById('skipMiniGame').addEventListener('click', skipMiniGame);
    document.getElementById('closeResult').addEventListener('click', closeResultModal);
    
    // Keyboard for mini-game
    document.addEventListener('keydown', (e) => {
        miniGame.keys[e.key] = true;
    });
    document.addEventListener('keyup', (e) => {
        miniGame.keys[e.key] = false;
    });
}

function handleCanvasClick(e) {
    const rect = gameState.canvas.getBoundingClientRect();
    const scaleX = gameState.canvas.width / rect.width;
    const scaleY = gameState.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    gameState.boxes.forEach((box, index) => {
        if (x >= box.x && x <= box.x + box.width &&
            y >= box.y && y <= box.y + box.height) {
            selectBox(index);
        }
    });
}

function handleCanvasMouseMove(e) {
    const rect = gameState.canvas.getBoundingClientRect();
    const scaleX = gameState.canvas.width / rect.width;
    const scaleY = gameState.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    gameState.boxes.forEach(box => {
        box.hover = x >= box.x && x <= box.x + box.width &&
                    y >= box.y && y <= box.y + box.height;
    });
}

function selectBox(index) {
    gameState.selectedBox = index;
    gameState.boxes[index].selected = true;
    
    // Enable unbox button (works in demo mode too)
    document.getElementById('unboxButton').disabled = false;
    
    createParticles(
        gameState.boxes[index].x + gameState.boxes[index].width / 2,
        gameState.boxes[index].y + gameState.boxes[index].height / 2
    );
}

function createParticles(x, y) {
    for (let i = 0; i < 20; i++) {
        gameState.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 60,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`
        });
    }
}

function startUnboxSequence() {
    if (gameState.selectedBox === null) {
        showStatus('Please select a box first!', 'error');
        return;
    }
    
    // Check QCAT balance
    const qcatBalance = window.blockchain ? window.blockchain.balances.qcat : 10;
    if (qcatBalance <= 0) {
        showStatus('You need QCAT tokens to unbox!', 'error');
        return;
    }
    
    // Start mini-game
    startMiniGame();
}

function startMiniGame() {
    miniGame.isActive = true;
    miniGame.score = 0;
    miniGame.timeLeft = 10;
    miniGame.items = [];
    miniGame.player.x = 180;
    
    // Show modal
    document.getElementById('miniGameModal').classList.remove('hidden');
    document.getElementById('miniGameScore').textContent = '0';
    document.getElementById('miniGameTime').textContent = '10';
    
    // Start game loop
    miniGame.interval = setInterval(updateMiniGame, 1000 / 60);
    
    // Spawn items
    miniGame.spawnInterval = setInterval(spawnMiniGameItem, 500);
    
    // Timer
    miniGame.timerInterval = setInterval(() => {
        miniGame.timeLeft--;
        document.getElementById('miniGameTime').textContent = miniGame.timeLeft;
        if (miniGame.timeLeft <= 0) {
            endMiniGame();
        }
    }, 1000);
}

function spawnMiniGameItem() {
    const isGood = Math.random() > 0.3; // 70% good, 30% bad
    miniGame.items.push({
        x: Math.random() * (miniGame.canvas.width - 20),
        y: -20,
        width: 20,
        height: 20,
        isGood: isGood,
        speed: 2 + Math.random() * 2
    });
}

function updateMiniGame() {
    if (!miniGame.isActive) return;
    
    const ctx = miniGame.ctx;
    const player = miniGame.player;
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, miniGame.canvas.width, miniGame.canvas.height);
    
    // Update player position
    if (miniGame.keys['ArrowLeft'] || miniGame.keys['a']) {
        player.x = Math.max(0, player.x - player.speed);
    }
    if (miniGame.keys['ArrowRight'] || miniGame.keys['d']) {
        player.x = Math.min(miniGame.canvas.width - player.width, player.x + player.speed);
    }
    
    // Draw player (box)
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, player.width, player.height);
    
    // Draw and update items
    for (let i = miniGame.items.length - 1; i >= 0; i--) {
        const item = miniGame.items[i];
        item.y += item.speed;
        
        // Draw item
        ctx.fillStyle = item.isGood ? '#00ff41' : '#ff0055';
        ctx.beginPath();
        ctx.arc(item.x + 10, item.y + 10, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Check collision
        if (item.y + item.height > player.y &&
            item.y < player.y + player.height &&
            item.x + item.width > player.x &&
            item.x < player.x + player.width) {
            if (item.isGood) {
                miniGame.score += 10;
            } else {
                miniGame.score = Math.max(0, miniGame.score - 5);
            }
            document.getElementById('miniGameScore').textContent = miniGame.score;
            miniGame.items.splice(i, 1);
            continue;
        }
        
        // Remove if off screen
        if (item.y > miniGame.canvas.height) {
            miniGame.items.splice(i, 1);
        }
    }
    
    // Draw score influence text
    ctx.fillStyle = '#fff';
    ctx.font = '12px "Press Start 2P"';
    ctx.fillText('Use Arrow Keys', 10, 20);
}

function endMiniGame() {
    miniGame.isActive = false;
    clearInterval(miniGame.interval);
    clearInterval(miniGame.spawnInterval);
    clearInterval(miniGame.timerInterval);
    
    document.getElementById('miniGameModal').classList.add('hidden');
    
    // Calculate bonus (subtle, doesn't guarantee outcome)
    const bonus = Math.floor(miniGame.score / 10);
    gameState.score += miniGame.score;
    
    // Call blockchain unbox
    performUnbox(bonus);
}

function skipMiniGame() {
    endMiniGame();
}

async function performUnbox(bonus = 0) {
    showStatus('Unboxing your quantum cat...', 'pending');
    
    try {
        // Call blockchain function
        const result = await window.blockchain.unbox();
        
        gameState.totalUnboxed++;
        document.getElementById('totalUnboxed').textContent = gameState.totalUnboxed;
        
        // Show result
        showUnboxResult(result);
        
        // Update balances
        setTimeout(() => {
            window.blockchain.updateBalances();
        }, 2000);
        
    } catch (error) {
        console.error('Unbox error:', error);
        showStatus('Unbox failed: ' + error.message, 'error');
    }
}

function showUnboxResult(result) {
    const modal = document.getElementById('resultModal');
    const canvas = document.getElementById('resultCanvas');
    const ctx = canvas.getContext('2d');
    const title = document.getElementById('resultTitle');
    const text = document.getElementById('resultText');
    
    // Determine result (parse from transaction or mock for demo)
    const isAlive = result.isAlive || Math.random() > 0.5;
    
    if (isAlive) {
        gameState.aliveCount++;
        title.textContent = '🟢 ALIVE CAT! 🟢';
        title.style.color = '#00ff41';
        text.textContent = 'Your cat is alive and well!';
        drawAliveCat(ctx, canvas.width, canvas.height);
    } else {
        gameState.deadCount++;
        title.textContent = '🔴 DEAD CAT! 🔴';
        title.style.color = '#ff0055';
        text.textContent = 'Your cat has passed to the ghost realm...';
        drawDeadCat(ctx, canvas.width, canvas.height);
    }
    
    document.getElementById('ratio').textContent = 
        `${gameState.aliveCount}/${gameState.deadCount}`;
    
    modal.classList.remove('hidden');
    
    // Enable rebox button if we have tokens to rebox
    setTimeout(() => {
        const hasTokens = (window.blockchain.balances.alive > 0 && 
                          window.blockchain.balances.dead > 0);
        document.getElementById('reboxButton').disabled = !hasTokens;
    }, 100);
}

function drawAliveCat(ctx, width, height) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    // Simple 8-bit cat sprite
    const pixelSize = 10;
    const offsetX = 60;
    const offsetY = 60;
    
    // Green cat
    ctx.fillStyle = '#00ff41';
    const catPattern = [
        [0,0,1,0,0,0,0,1,0,0],
        [0,0,1,0,0,0,0,1,0,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,1,0,1,1,1,1,0,1,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,1,1,0,0],
        [0,0,1,0,0,0,0,1,0,0]
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

function drawDeadCat(ctx, width, height) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    const pixelSize = 10;
    const offsetX = 60;
    const offsetY = 60;
    
    // Red/ghost cat
    ctx.fillStyle = '#ff0055';
    const catPattern = [
        [0,0,1,0,0,0,0,1,0,0],
        [0,0,1,0,0,0,0,1,0,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,1,0,1,1,1,1,0,1,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,1,1,0,0],
        [0,0,1,0,0,0,0,1,0,0]
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

function closeResultModal() {
    document.getElementById('resultModal').classList.add('hidden');
    gameState.selectedBox = null;
    gameState.boxes.forEach(box => box.selected = false);
    document.getElementById('unboxButton').disabled = true;
}

async function handleRebox() {
    showStatus('Reboxing cats back to quantum state...', 'pending');
    
    try {
        await window.blockchain.rebox();
        showStatus('Successfully reboxed! QCAT created.', 'success');
        
        setTimeout(() => {
            window.blockchain.updateBalances();
        }, 2000);
        
    } catch (error) {
        console.error('Rebox error:', error);
        showStatus('Rebox failed: ' + error.message, 'error');
    }
}

function renderGame() {
    const ctx = gameState.ctx;
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    
    // Draw grid background
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < gameState.canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, gameState.canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < gameState.canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(gameState.canvas.width, y);
        ctx.stroke();
    }
    
    // Draw title
    ctx.fillStyle = '#00ff41';
    ctx.font = '20px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('MYSTERY BOXES', gameState.canvas.width / 2, 50);
    
    // Draw boxes
    gameState.boxes.forEach((box, index) => {
        box.pulse += 0.05;
        const pulseSize = Math.sin(box.pulse) * 2;
        
        // Box shadow/glow
        if (box.hover || box.selected) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = box.selected ? '#ff00ff' : '#00ff41';
        } else {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00d4ff';
        }
        
        // Draw 8-bit sealed box
        draw8BitBox(
            ctx, 
            box.x - pulseSize / 2, 
            box.y - pulseSize / 2, 
            box.width + pulseSize, 
            box.height + pulseSize,
            box.selected,
            box.hover
        );
        
        ctx.shadowBlur = 0;
    });
    
    // Draw particles
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const p = gameState.particles[i];
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 4, 4);
        
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        
        if (p.life <= 0) {
            gameState.particles.splice(i, 1);
        }
    }
    
    ctx.shadowBlur = 0;
    
    requestAnimationFrame(renderGame);
}

function showStatus(message, type = 'pending') {
    const status = document.getElementById('txStatus');
    status.textContent = message;
    status.className = `tx-status ${type}`;
    status.classList.remove('hidden');
    
    if (type !== 'pending') {
        setTimeout(() => {
            status.classList.add('hidden');
        }, 5000);
    }
}

// Update session score display
function updateSessionScore() {
    document.getElementById('sessionScore').textContent = gameState.score;
}

setInterval(updateSessionScore, 1000);

