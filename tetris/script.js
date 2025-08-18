const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');

const BLOCK_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

canvas.width = BOARD_WIDTH * BLOCK_SIZE;
canvas.height = BOARD_HEIGHT * BLOCK_SIZE;

let board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
let score = 0;
let level = 1;
let lines = 0;
let dropTime = 0;
let lastTime = 0;
let gameRunning = false;
let gamePaused = false;

const tetrominoes = [
    {
        shape: [
            [1, 1, 1, 1]
        ],
        color: '#00f0f0'
    },
    {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#f0f000'
    },
    {
        shape: [
            [0, 1, 0],
            [1, 1, 1]
        ],
        color: '#a000f0'
    },
    {
        shape: [
            [0, 1, 1],
            [1, 1, 0]
        ],
        color: '#00f000'
    },
    {
        shape: [
            [1, 1, 0],
            [0, 1, 1]
        ],
        color: '#f00000'
    },
    {
        shape: [
            [1, 0, 0],
            [1, 1, 1]
        ],
        color: '#f0a000'
    },
    {
        shape: [
            [0, 0, 1],
            [1, 1, 1]
        ],
        color: '#0000f0'
    }
];

let currentPiece = {
    shape: null,
    color: '',
    x: 0,
    y: 0
};

let nextPiece = {
    shape: null,
    color: ''
};

function getRandomPiece() {
    const piece = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
    return {
        shape: piece.shape.map(row => [...row]),
        color: piece.color
    };
}

function initGame() {
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    score = 0;
    level = 1;
    lines = 0;
    updateDisplay();
    
    nextPiece = getRandomPiece();
    spawnPiece();
    drawNextPiece();
}

function spawnPiece() {
    currentPiece = {
        shape: nextPiece.shape,
        color: nextPiece.color,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(nextPiece.shape[0].length / 2),
        y: 0
    };
    
    nextPiece = getRandomPiece();
    drawNextPiece();
    
    if (collision()) {
        gameOver();
        return false;
    }
    return true;
}

function collision() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x] &&
                (currentPiece.x + x < 0 ||
                 currentPiece.x + x >= BOARD_WIDTH ||
                 currentPiece.y + y >= BOARD_HEIGHT ||
                 board[currentPiece.y + y] && board[currentPiece.y + y][currentPiece.x + x])) {
                return true;
            }
        }
    }
    return false;
}

function rotate() {
    const rotated = currentPiece.shape[0].map((_, index) =>
        currentPiece.shape.map(row => row[index]).reverse()
    );
    
    const previousShape = currentPiece.shape;
    currentPiece.shape = rotated;
    
    if (collision()) {
        currentPiece.shape = previousShape;
    }
}

function move(dx, dy) {
    currentPiece.x += dx;
    currentPiece.y += dy;
    
    if (collision()) {
        currentPiece.x -= dx;
        currentPiece.y -= dy;
        
        if (dy > 0) {
            placePiece();
            clearLines();
            if (!spawnPiece()) {
                return;
            }
        }
    }
}

function hardDrop() {
    while (!collision()) {
        currentPiece.y++;
    }
    currentPiece.y--;
    placePiece();
    clearLines();
    spawnPiece();
}

function placePiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                board[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
            }
        }
    }
}

function clearLines() {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++;
        }
    }
    
    if (linesCleared > 0) {
        lines += linesCleared;
        score += linesCleared * 100 * level;
        level = Math.floor(lines / 10) + 1;
        updateDisplay();
    }
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x]) {
                context.fillStyle = board[y][x];
                context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeStyle = '#fff';
                context.lineWidth = 1;
                context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
    
    if (currentPiece.shape) {
        context.fillStyle = currentPiece.color;
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    context.fillRect(
                        (currentPiece.x + x) * BLOCK_SIZE,
                        (currentPiece.y + y) * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE
                    );
                    context.strokeStyle = '#fff';
                    context.lineWidth = 1;
                    context.strokeRect(
                        (currentPiece.x + x) * BLOCK_SIZE,
                        (currentPiece.y + y) * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE
                    );
                }
            }
        }
    }
}

function drawNextPiece() {
    nextContext.fillStyle = '#000';
    nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPiece.shape) {
        const blockSize = 20;
        const offsetX = (nextCanvas.width - nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (nextCanvas.height - nextPiece.shape.length * blockSize) / 2;
        
        nextContext.fillStyle = nextPiece.color;
        for (let y = 0; y < nextPiece.shape.length; y++) {
            for (let x = 0; x < nextPiece.shape[y].length; x++) {
                if (nextPiece.shape[y][x]) {
                    nextContext.fillRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize,
                        blockSize
                    );
                    nextContext.strokeStyle = '#fff';
                    nextContext.lineWidth = 1;
                    nextContext.strokeRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize,
                        blockSize
                    );
                }
            }
        }
    }
}

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

function gameLoop(time = 0) {
    if (!gameRunning || gamePaused) return;
    
    const deltaTime = time - lastTime;
    lastTime = time;
    dropTime += deltaTime;
    
    const dropInterval = Math.max(100, 1000 - (level - 1) * 100);
    
    if (dropTime > dropInterval) {
        move(0, 1);
        dropTime = 0;
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameRunning = false;
    alert('ゲームオーバー！\nスコア: ' + score);
    document.getElementById('start-btn').textContent = 'ゲーム開始';
    document.getElementById('pause-btn').disabled = true;
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        initGame();
        document.getElementById('start-btn').textContent = 'リスタート';
        document.getElementById('pause-btn').disabled = false;
        requestAnimationFrame(gameLoop);
    } else {
        gameRunning = false;
        initGame();
        gameRunning = true;
        gamePaused = false;
        requestAnimationFrame(gameLoop);
    }
}

function pauseGame() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        document.getElementById('pause-btn').textContent = gamePaused ? '再開' : '一時停止';
        if (!gamePaused) {
            requestAnimationFrame(gameLoop);
        }
    }
}

document.addEventListener('keydown', (event) => {
    if (!gameRunning || gamePaused) return;
    
    switch (event.code) {
        case 'ArrowLeft':
            move(-1, 0);
            break;
        case 'ArrowRight':
            move(1, 0);
            break;
        case 'ArrowDown':
            move(0, 1);
            break;
        case 'ArrowUp':
            rotate();
            break;
        case 'Space':
            hardDrop();
            break;
    }
    event.preventDefault();
});

// タッチ操作用の変数
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

// タッチイベントの追加
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!gameRunning || gamePaused) return;
    
    const touch = e.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    const touchEndTime = Date.now();
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const deltaTime = touchEndTime - touchStartTime;
    
    // タップ（短時間の触れ方）の場合は回転
    if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30 && deltaTime < 200) {
        rotate();
        return;
    }
    
    // スワイプジェスチャーの判定
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平スワイプ
        if (Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                move(1, 0); // 右移動
            } else {
                move(-1, 0); // 左移動
            }
        }
    } else {
        // 垂直スワイプ
        if (Math.abs(deltaY) > 50) {
            if (deltaY > 0) {
                move(0, 1); // 下移動
            } else {
                hardDrop(); // 上スワイプでハードドロップ
            }
        }
    }
});

// タッチ時のスクロールを防ぐ
document.body.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('pause-btn').addEventListener('click', pauseGame);

document.getElementById('pause-btn').disabled = true;