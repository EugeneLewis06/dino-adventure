// obstacles.js - Engeller, Kalpler, Bulutlar ve Dağlar Modülü
import { checkCollision } from './utils.js';

// Diziler
export let hearts = [];
export let obstacles = [];
export let clouds = [];
export let mountains = [];
export let lightnings = [];

// Kalp sistemi değişkenleri
let heartsSpawned = 0;
let maxHearts = 3;

// Engel sistemi değişkenleri
let lastObstacleTime = 0;
let nextGap = 1500;

// Yerdeki değişkenler (gameState'ten alınacak)
let groundY = 0;
let canvasWidth = 0;
let canvasHeight = 0;
let frameCount = 0;

// gameState'i ayarla
export function setObstacleGameState(gameState) {
    groundY = gameState.groundY;
    canvasWidth = gameState.canvas.width;
    canvasHeight = gameState.canvas.height;
    frameCount = gameState.frameCount || 0;
}

// Bulut oluştur
export function createClouds(width) {
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * width,
            y: Math.random() * 150 + 20,
            width: Math.random() * 60 + 40,
            speed: Math.random() * 0.5 + 0.2
        });
    }
}

// Dağ oluştur
export function createMountains(width, groundYValue) {
    for (let i = 0; i < width + 200; i += 150) {
        mountains.push({
            x: i,
            y: groundYValue,
            width: 150,
            height: Math.random() * 100 + 50
        });
    }
}

// Engel çiz (kaktüs)
export function drawCactus(ctx, x, y) {
    ctx.fillStyle = '#2d5016';
    
    // Ana gövde
    ctx.fillRect(x + 10, y, 15, 50);
    ctx.strokeStyle = '#1a3009';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 10, y, 15, 50);

    // Sol kol
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 15);
    ctx.lineTo(x, y + 10);
    ctx.lineTo(x, y - 5);
    ctx.lineTo(x + 8, y - 5);
    ctx.lineTo(x + 8, y + 5);
    ctx.lineTo(x + 10, y + 10);
    ctx.fill();
    ctx.stroke();

    // Sağ kol
    ctx.beginPath();
    ctx.moveTo(x + 25, y + 20);
    ctx.lineTo(x + 35, y + 15);
    ctx.lineTo(x + 35, y);
    ctx.lineTo(x + 42, y);
    ctx.lineTo(x + 42, y + 10);
    ctx.lineTo(x + 25, y + 18);
    ctx.fill();
    ctx.stroke();

    // Dikenler
    ctx.strokeStyle = '#4a7c59';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 12, y + i * 10);
        ctx.lineTo(x + 8, y + i * 10 - 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 23, y + i * 10 + 5);
        ctx.lineTo(x + 27, y + i * 10 + 3);
        ctx.stroke();
    }
}

// Kuş çiz
export function drawBird(ctx, x, y, frameCount) {
    const wingFlap = Math.sin(frameCount * 0.3) * 10;
    
    ctx.fillStyle = '#e74c3c';
    
    // Gövde
    ctx.beginPath();
    ctx.ellipse(x + 20, y, 20, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Baş
    ctx.beginPath();
    ctx.arc(x + 35, y - 5, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Gaga
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.moveTo(x + 42, y - 5);
    ctx.lineTo(x + 50, y - 2);
    ctx.lineTo(x + 42, y);
    ctx.fill();
    
    // Göz
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x + 38, y - 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x + 39, y - 8, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Kanat
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(x + 10, y);
    ctx.quadraticCurveTo(x, y - 10 + wingFlap, x - 10, y);
    ctx.quadraticCurveTo(x, y + 10 - wingFlap, x + 10, y);
    ctx.fill();
    
    // Kuyruk
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 15, y + 5);
    ctx.lineTo(x - 15, y - 5);
    ctx.fill();
}

// Çukur/Boşluk engel çiz
export function drawPit(ctx, x, y, width, canvasHeight) {
    const pitDepth = canvasHeight - y + 50;
    
    // Ana çukur - siyah
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(x, y, width, pitDepth);
    
    // Sol kenar - koyu gri
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, 5, pitDepth);
    
    // Sağ kenar - daha koyu
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + width - 5, y, 5, pitDepth);
    
    // Üst kenar çizgisi
    ctx.strokeStyle = '#2d5016';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.stroke();
}

// Kaplumbağa çiz
export function drawTurtle(ctx, turtleImage, x, y, frameCount, flipped = false) {
    if (flipped) {
        ctx.save();
        ctx.translate(x + 35, y + 50);
        ctx.scale(1, -1);
        ctx.translate(-(x + 35), -(y + 50));
        ctx.globalAlpha = 0.5;
    }

    const bounceY = flipped ? 0 : Math.abs(Math.sin(frameCount * 0.05)) * 120;
    const drawY = y - bounceY;

    if (turtleImage.complete && turtleImage.naturalWidth > 0) {
        ctx.drawImage(turtleImage, x, drawY, 70, 60);
    } else {
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.ellipse(x + 35, drawY + 30, 35, 30, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    if (flipped) {
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

// Kalp çiz
export function drawHeart(ctx, heart, frameCount) {
    const x = heart.x;
    const y = heart.y;
    const size = 15;
    
    ctx.save();
    const floatY = Math.sin(frameCount * 0.1 + heart.id) * 3;
    ctx.translate(x, y + floatY);
    ctx.scale(size / 20, size / 20);
    
    // Kalp şekli
    ctx.fillStyle = '#ff1744';
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.bezierCurveTo(-10, -5, -20, 5, 0, 20);
    ctx.bezierCurveTo(20, 5, 10, -5, 0, 5);
    ctx.fill();
    
    // Parıltı efekti
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(-5, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// Yıldırım spawn
export function spawnLightning(gameMode, groundY, canvasWidth) {
    if (gameMode !== 'normal') return null;
    
    const minY = groundY - 150;
    const maxY = groundY - 50;
    
    const lightning = {
        x: canvasWidth + 50,
        y: Math.random() * (maxY - minY) + minY,
        width: 30,
        height: 30
    };
    
    lightnings.push(lightning);
    return lightning;
}

// Yıldırım çiz
export function drawLightning(ctx, lightning, frameCount) {
    const x = lightning.x;
    const y = lightning.y;
    const size = 15;
    
    ctx.save();
    const floatY = Math.sin(frameCount * 0.1 + (lightning.x || 0) * 0.01) * 3;
    ctx.translate(x, y + floatY);
    
    // Dış parıltı
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 10;
    
    // Ana şimşek gövdesi - sarı zigzag
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.3, -size * 0.3);
    ctx.lineTo(-size * 0.2, 0);
    ctx.lineTo(size * 0.4, size * 0.3);
    ctx.lineTo(0, size);
    ctx.lineTo(-size * 0.3, size * 0.3);
    ctx.lineTo(size * 0.2, 0);
    ctx.lineTo(-size * 0.4, -size * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // İç parlak çekirdek - beyaz
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.7);
    ctx.lineTo(size * 0.15, -size * 0.2);
    ctx.lineTo(-size * 0.1, 0);
    ctx.lineTo(size * 0.2, size * 0.2);
    ctx.lineTo(0, size * 0.7);
    ctx.lineTo(-size * 0.15, size * 0.2);
    ctx.lineTo(size * 0.1, 0);
    ctx.lineTo(-size * 0.2, -size * 0.2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

// Kalp spawn
export function spawnHeart(gameMode, groundY, canvasWidth, onSound) {
    if (heartsSpawned >= maxHearts || gameMode !== 'normal') return null;
    
    const minY = groundY - 150;
    const maxY = groundY - 50;
    
    const heart = {
        x: canvasWidth + 50,
        y: Math.random() * (maxY - minY) + minY,
        width: 30,
        height: 30,
        id: heartsSpawned
    };
    
    hearts.push(heart);
    heartsSpawned++;
    
    // Kalp spawn sesi
    if (onSound) onSound('doubleJump');
    
    return heart;
}

// Engel oluştur
export function spawnObstacle(gameMode, gameTime, groundY, canvasWidth, canvasHeight, randomFn = Math.random) {
    if (gameMode !== 'normal') return null;
    
    // Değişken gap - daha sık engeller
    const baseMinGap = gameTime >= 60 ? 600 : 900;
    const baseMaxGap = gameTime >= 60 ? 1400 : 1800;
    
    const currentTime = Date.now();
    
    if (currentTime - lastObstacleTime > nextGap && randomFn() < 0.4) {
        nextGap = baseMinGap + randomFn() * (baseMaxGap - baseMinGap);
        let type;
        
        if (gameTime >= 30 && randomFn() < 0.3) {
            type = 'pit';
        } else if (gameTime >= 60 && randomFn() < 0.4) {
            type = 'turtle';
        } else {
            type = randomFn() < 0.5 ? 'cactus' : 'bird';
        }
        
        let obstacle;
        if (type === 'pit') {
            obstacle = {
                x: canvasWidth,
                y: groundY - 5,
                width: 100,
                height: canvasHeight,
                type: type,
                passed: false
            };
        } else if (type === 'turtle') {
            obstacle = {
                x: canvasWidth,
                y: groundY - 70,
                width: 70,
                height: 60,
                type: 'turtle',
                passed: false
            };
        } else {
            obstacle = {
                x: canvasWidth,
                y: type === 'cactus' ? groundY - 50 : groundY - 60 - randomFn() * 50,
                width: type === 'cactus' ? 45 : 50,
                height: type === 'cactus' ? 50 : 30,
                type: type,
                passed: false
            };
        }
        obstacles.push(obstacle);
        lastObstacleTime = currentTime;
        return obstacle;
    }
    return null;
}

// Tüm engelleri ve kalpleri güncelle ve çiz
export function updateObstacles(gameState, ctx) {
    const { gameMode, gameTime, groundY, canvas, speed, currentTimeScale, frameCount, onSound } = gameState;
    
    // gameState'i ayarla
    setObstacleGameState(gameState);
    
    // Yeni engel oluştur
    if (gameMode === 'normal') {
        spawnObstacle(gameMode, gameTime, groundY, canvas.width, canvas.height);
    }
    
    // Engelleri güncelle ve çiz
    obstacles = obstacles.filter(obs => {
        obs.x -= speed * currentTimeScale;
        
        if (obs.type === 'cactus') {
            drawCactus(ctx, obs.x, obs.y);
        } else if (obs.type === 'bird') {
            drawBird(ctx, obs.x, obs.y, frameCount);
        } else if (obs.type === 'pit') {
            drawPit(ctx, obs.x, obs.y, obs.width, canvas.height);
        }
        
        return obs.x + obs.width > -100;
    });
    
    // Kalpleri güncelle ve çiz
    hearts = hearts.filter(heart => {
        heart.x -= speed * currentTimeScale;
        drawHeart(ctx, heart, frameCount);
        return heart.x > -50;
    });
    
    return { obstacles, hearts };
}

// Reset fonksiyonları
export function resetObstacles() {
    obstacles = [];
    hearts = [];
    lightnings = [];
    heartsSpawned = 0;
    lastObstacleTime = 0;
    nextGap = 1500;
}

export function resetCloudsAndMountains() {
    clouds = [];
    mountains = [];
}

// Çukur kontrolü - dinozor çukura düştü mü?
export function isDinoInPit(dino, pit) {
    const dinoLeft = dino.x;
    const dinoRight = dino.x + 70; // dino.width
    const dinoBottom = dino.y + 80; // dino.height (ayak hizasi)

    // Cukur sinirlari
    const pitLeft = pit.x;
    const pitRight = pit.x + pit.width;
    const pitTop = pit.y; // groundY - 5

    // Dinozor yatayda cukurun icinde mi?
    const inPitX = dinoRight > pitLeft && dinoLeft < pitRight;

    // Dinozorun ayaklari cukurun ust kenarindan asagida mi?
    const fellInPit = dinoBottom >= pitTop;

    return inPitX && fellInPit;
}

// Dizi filtreleme fonksiyonları
export function filterHearts(callbackFn) {
    hearts = hearts.filter(callbackFn);
}

export function filterObstacles(callbackFn) {
    obstacles = obstacles.filter(callbackFn);
}
