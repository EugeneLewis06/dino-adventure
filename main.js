// Modül importları
import { checkCollision } from './utils.js';
import { play8BitSound, toggleSound, drawSoundIcon, startBackgroundMusic, stopBackgroundMusic, audioCtx } from './audio.js';
import { scoreBoard, playerHealthDiv, bossHealthDiv, bossHealthBar, bossHealthFill, gameOverScreen, startMessage, victoryMessage, loadingMessage, hideLoadingMessage, updateScoreBoard, resetUI, showBossUI, updateBossHealth, updatePlayerHealth, hideBossUI, showGameOver, hideGameOver, showBossUpgradeScreen, updateDebugUI, removeDebugUI } from './ui.js';
import { hearts, obstacles, clouds, mountains, createClouds, createMountains, spawnHeart, spawnObstacle, drawHeart, drawCactus, drawBird, drawPit, drawTurtle, updateObstacles, resetObstacles, resetCloudsAndMountains, filterHearts, filterObstacles, isDinoInPit } from './obstacles.js';
import { dino, drawRealDino, jump, shoot, specialShoot } from './player.js';
import { boss, drawElephant, bossShoot, updateBossPosition } from './boss.js';

// Ses durumu (audio.js içindeki soundEnabled'i senkronize tutmak için)
let soundEnabled = true;

// CANVAS SETUP
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// GÖRSEL YÜKLEME
const dinoImage = new Image();
const elephantImage = new Image();
const turtleImage = new Image();
let imagesLoaded = 0;

// Chrome Dino - YENI SVG (kullanicinin gonderdigi)
dinoImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMTIiIHk9IjQ0IiB3aWR0aD0iOCIgaGVpZ2h0PSIxNiIgZmlsbD0iIzUzNTM1MyIvPgo8cmVjdCB4PSIyNCIgeT0iNDQiIHdpZHRoPSI4IiBoZWlnaHQ9IjE2IiBmaWxsPSIjNTM1MzUzIi8+CjxyZWN0IHg9IjE2IiB5PSIzNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjNTM1MzUzIi8+CjxyZWN0IHg9IjI0IiB5PSIyOCIgd2lkdGg9IjgiIGhlaWdodD0iMTIiIGZpbGw9IiM1MzUzNTMiLz4KPHJlY3QgeD0iMzIiIHk9IjI0IiB3aWR0aD0iMTIiIGhlaWdodD0iMTYiIGZpbGw9IiM1MzUzNTMiLz4KPHJlY3QgeD0iNDQiIHk9IjI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjNTM1MzUzIi8+CjxyZWN0IHg9IjQ0IiB5PSIyMCIgd2lkdGg9IjgiIGhlaWdodD0iNCIgZmlsbD0iIzUzNTM1MyIvPgo8cmVjdCB4PSI1MiIgeT0iMjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM1MzUzNTMiLz4KPHJlY3QgeD0iNDAiIHk9IjI4IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmZmZmIi8+CjxyZWN0IHg9IjQ0IiB5PSIyOCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iIzUzNTM1MyIvPgo8cmVjdCB4PSI0IiB5PSIzNiIgd2lkdGg9IjgiIGhlaWdodD0iMTIiIGZpbGw9IiM1MzUzNTMiLz4KPC9zdmc+';

// Fil görseli
elephantImage.src = 'elephant.png';
turtleImage.src = 'turtle.png';

dinoImage.onload = () => {
    imagesLoaded++;
    hideLoadingMessage();
};
dinoImage.onerror = () => {
    imagesLoaded++;
    hideLoadingMessage();
};

elephantImage.onload = () => {
    imagesLoaded++;
    hideLoadingMessage();
};
elephantImage.onerror = () => {
    imagesLoaded++;
    hideLoadingMessage();
};

turtleImage.onload = () => {
    imagesLoaded++;
    hideLoadingMessage();
};

turtleImage.onerror = () => {
    imagesLoaded++;
    hideLoadingMessage();
};

// Oyun değişkenleri - ZAMAN BAZLI
let gameRunning = false;
let gameMode = 'normal';
let gamePaused = false; // Duraklatma durumu - P tuşu ile kontrol edilir
let gameTime = 0; // Oyun süresi (saniye)
let gameStartTime = 0; // Başlangıç zamanı
let totalPausedTime = 0; // Duraklatma süreleri toplamı
let pauseStartTime = 0; // Son duraklatma başlangıcı
let score = 0; // Engellerden geçme sayısı (referans için)
let speed = 5.5; // Daha hızlı başlangıç
let frameCount = 0;
let lastSpeedUpTime = -1;
let lastClickTime = 0;

// DeltaTime sistemi - yüksek Hz monitörlerde sabit hız
let lastTime = 0;
let currentTimeScale = 1;
const TARGET_FPS = 60;
const TARGET_FRAME_TIME = 1000 / TARGET_FPS; // ~16.67ms

let groundY = canvas.height - 100; // let olmalı ki resize'ta değişebilsin
let restartBtn = null;



// Boss değişkenleri
let mouseX = 100;
let mouseY = groundY - 80;

// KALP SİSTEMİ - UST USTE TOPLANABİLİR
let heartPowerCount = 0; // UST USTE TOPLANAN KALP SAYISI (carpma hakki)

// BOSS SAVAŞI SEÇİM SİSTEMİ
let bossChoice = null; // 'fireball' veya 'shield'
let bossUpgradeShown = false; // Upgrade ekrani gosterildi mi?
let specialAttackUsed = false; // Özel güç kullanıldı mı?
let invincibilityActive = false; // Kalkan hazır mı?
let invincibilityEndTime = 0;
const INVINCIBILITY_DURATION = 7000; // 7 saniye (ms)

// BOSS SAVAŞI TIMER SİSTEMİ
let bossBattleStartTime = 0;
let bossBattleDuration = 0;
const BOSS_TIMES_KEY = 'dinoBossTopTimes';

// ── DEBUG MODU ──────────────────────────────────────────────────────────────
let debugMode = false;          // F3 ile aç/kapa
const debugFrameTimestamps = []; // Son 1 sn'deki kare zaman damgaları
const debugErrors = [];          // Kritik hata kayıtları [{ time, message }]

// Son 1 saniyedeki kare sayısına göre FPS hesapla
function calculateFPS() {
  const now = performance.now();
  // 1 saniyeden eski timestamp'leri at
  while (debugFrameTimestamps.length > 0 && now - debugFrameTimestamps[0] > 1000) {
    debugFrameTimestamps.shift();
  }
  return debugFrameTimestamps.length; // 1 sn içindeki kare sayısı = FPS
}

// Kritik hatayı debug listesine ekle (en fazla 20 kayıt tut)
function logDebugError(message) {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  debugErrors.push({ time: timeStr, message });
  if (debugErrors.length > 20) debugErrors.shift();
}

let bullets = [];
let bossBullets = [];
let dancingDinos = [];

// Obstacle modülü için gameState hazırlığı
function getObstacleGameState() {
    return {
        gameMode,
        gameTime,
        groundY,
        canvas,
        speed,
        currentTimeScale,
        frameCount,
        onSound: (type) => play8BitSound(type)
    };
}

// Arkaplan çiz (doğal)
function drawBackground() {
    // Güneş
    const sunGradient = ctx.createRadialGradient(100, 80, 10, 100, 80, 50);
    sunGradient.addColorStop(0, '#FFFACD');
    sunGradient.addColorStop(0.5, '#FFD700');
    sunGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(100, 80, 50, 0, Math.PI * 2);
    ctx.fill();

    // Bulutlar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    clouds.forEach(cloud => {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.width / 2, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width / 3, cloud.y - 10, cloud.width / 2.5, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width / 1.5, cloud.y, cloud.width / 2, 0, Math.PI * 2);
        ctx.fill();

        cloud.x -= cloud.speed * currentTimeScale;
        if (cloud.x + cloud.width < 0) {
            cloud.x = canvas.width + cloud.width;
        }
    });

    // Dağlar (arkaplan)
    ctx.fillStyle = '#6a8caf';
    mountains.forEach(mountain => {
        ctx.beginPath();
        ctx.moveTo(mountain.x, mountain.y);
        ctx.lineTo(mountain.x + mountain.width / 2, mountain.y - mountain.height);
        ctx.lineTo(mountain.x + mountain.width, mountain.y);
        ctx.fill();

        mountain.x -= speed * 0.2 * currentTimeScale;
        if (mountain.x + mountain.width < 0) {
            mountain.x = canvas.width;
            mountain.height = Math.random() * 100 + 50;
        }
    });
}

// Zemin çiz (çimenli)
function drawGround() {
    // Toprak
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    // Çimen
    ctx.fillStyle = '#228b22';
    ctx.fillRect(0, groundY, canvas.width, 20);

    // Çimen detayları
    ctx.strokeStyle = '#1a6b1a';
    ctx.lineWidth = 2;
    for (let i = 0; i < canvas.width; i += 30) {
        const offset = (i - frameCount * speed * currentTimeScale) % canvas.width;
        const x = offset < 0 ? offset + canvas.width : offset;
        
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x + 5, groundY - 10);
        ctx.moveTo(x + 10, groundY);
        ctx.lineTo(x + 15, groundY - 8);
        ctx.moveTo(x + 20, groundY);
        ctx.lineTo(x + 25, groundY - 12);
        ctx.stroke();
    }

    // Çiçekler
    for (let i = 50; i < canvas.width; i += 200) {
        const offset = (i - frameCount * speed * currentTimeScale) % canvas.width;
        const x = offset < 0 ? offset + canvas.width : offset;
        
        ctx.fillStyle = '#ff6b9d';
        ctx.beginPath();
        ctx.arc(x, groundY - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd93d';
        ctx.beginPath();
        ctx.arc(x, groundY - 5, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Mermi çiz (normal ve özel)
function drawBullet(bullet) {
    if (bullet.type === 'special') {
        // ÖZEL ATEŞ TOPU - büyük ve kırmızı/oranj
        ctx.fillStyle = '#ff4500';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Ateş çemberi
        ctx.fillStyle = '#ff6347';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // İç parlaklık
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Kuyruk (ateş efekti)
        ctx.fillStyle = 'rgba(255, 69, 0, 0.5)';
        ctx.beginPath();
        ctx.moveTo(bullet.x - 10, bullet.y);
        ctx.lineTo(bullet.x - 25, bullet.y - 5);
        ctx.lineTo(bullet.x - 25, bullet.y + 5);
        ctx.fill();
    } else {
        // NORMAL MERMİ - küçük ve sarı
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Ateş efekti
        ctx.fillStyle = '#e67e22';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Boss mermisi çiz
function drawBossBullet(bullet) {
    ctx.fillStyle = '#9b59b6';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 8, 0, Math.PI * 2);
    ctx.fill();
}

// Dans eden dinozorlar oluştur - 2D GRID EKRANA YAY
function createDancingDinos() {
    const cols = 5; // Yatayda 5 dinozor
    const rows = 3; // Dikeyde 3 dinozor
    const spacingX = canvas.width / (cols + 1);
    const spacingY = (groundY - 150) / rows;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            dancingDinos.push({
                x: spacingX * (col + 1),
                y: 150 + row * spacingY,
                offset: (row * cols + col) * 0.3,
                color: `hsl(${120 + (row * cols + col) * 25}, 60%, 45%)`,
                scale: 0.7 + Math.random() * 0.3
            });
        }
    }
}

// BOSS SAVAŞI SÜRELERİ - localStorage fonksiyonları
export function saveBossTime(duration) {
    let times = JSON.parse(localStorage.getItem(BOSS_TIMES_KEY)) || [];
    times.push({
        duration: duration,
        date: new Date().toLocaleDateString('tr-TR')
    });
    // En iyi sürelere göre sırala (en kısa süre en iyi)
    times.sort((a, b) => a.duration - b.duration);
    // Sadece ilk 10'u tut
    times = times.slice(0, 10);
    localStorage.setItem(BOSS_TIMES_KEY, JSON.stringify(times));
}

export function getTopBossTimes() {
    return JSON.parse(localStorage.getItem(BOSS_TIMES_KEY)) || [];
}

function formatBossTime(duration) {
    const seconds = Math.floor(duration / 1000);
    const milliseconds = Math.floor((duration % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
}

// Victory sahnesi çiz - sadece en iyi BOSS savaş süreleri
function drawDanceScene() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // İlk 3 en iyi BOSS savaşı süresini göster
    const topTimes = getTopBossTimes().slice(0, 3);
    if (topTimes.length > 0) {
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 EN İYİ BOSS SAVAŞI SÜRELERİ 🏆', canvas.width / 2, canvas.height / 2 - 20);
        
        const medals = ['🥇', '🥈', '🥉'];
        topTimes.forEach((time, index) => {
            const yPos = canvas.height / 2 + 20 + (index * 40);
            const medal = medals[index] || '';
            ctx.fillStyle = index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32';
            ctx.font = 'bold 28px Arial';
            ctx.fillText(`${medal} ${index + 1}. ${formatBossTime(time.duration)}`, canvas.width / 2, yPos);
        });
        
        // Bu savaşın süresi
        if (bossBattleDuration > 0) {
            ctx.fillStyle = '#90EE90';
            ctx.font = 'bold 24px Arial';
            ctx.fillText(`Bu savaş: ${formatBossTime(bossBattleDuration)}`, canvas.width / 2, canvas.height / 2 + 160);
        }
    }
    
    // Tekrar Oyna Butonu
    const btnW = 280;
    const btnH = 60;
    const btnX = canvas.width / 2 - btnW / 2;
    const btnY = canvas.height / 2 + 200;

    // Buton arka planı
    ctx.fillStyle = '#2d5016';
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, 15);
    ctx.fill();
    ctx.stroke();

    // Buton metni
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔄 Tekrar Oyna', canvas.width / 2, btnY + btnH / 2);

    // Buton koordinatlarını global bir değişkene ata
    restartBtn = { x: btnX, y: btnY, w: btnW, h: btnH };
    
    // Ses ikonunu çiz
    drawSoundIcon(ctx, canvas, soundEnabled);
}

// Duraklatma ekranı çiz
function drawPausedScreen() {
    // Arka planı yarı saydam siyah ile kapla
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // PAUSED yazısı
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#FF6347';
    ctx.shadowBlur = 20;
    ctx.fillText('⏸️ PAUSED', canvas.width / 2, canvas.height / 2 - 50);
    ctx.shadowBlur = 0;
    
    // Devam etmek için talimat
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px Arial';
    ctx.fillText('Press P to Resume', canvas.width / 2, canvas.height / 2 + 30);
    
    // Ses ikonunu çiz (ses kontrolü duraklatmada da aktif)
    drawSoundIcon(ctx, canvas, soundEnabled);
}

// Ekran titreşimi tetikle
function triggerScreenShake() {
    const duration = 200;
    const startTime = Date.now();
    const originalTransform = gameCanvas.style.transform;

    function shake() {
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
            gameCanvas.style.transform = originalTransform;
            return;
        }
        const offsetX = (Math.random() - 0.5) * 10;
        const offsetY = (Math.random() - 0.5) * 10;
        gameCanvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        requestAnimationFrame(shake);
    }

    shake();
}

// Oyun döngüsü
function gameLoop(currentTime) {
    if (!gameRunning) return;

    bullets = bullets.filter(b => b.x > -50 && b.x < canvas.width + 50);
    bossBullets = bossBullets.filter(b => b.x > -50 && b.x < canvas.width + 50);

    // Defensive: currentTime yoksa performance.now() kullan
    if (!currentTime) currentTime = performance.now();

    // ── DEBUG: FPS sayacı için zaman damgası kaydet ─────────────────────────
    if (debugMode) {
        debugFrameTimestamps.push(performance.now());
    }

    // DeltaTime hesapla (yüksek Hz monitörler için)
    if (!lastTime) lastTime = currentTime;
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    // Zaman ölçeği (60 FPS baz alınarak)
    currentTimeScale = Math.min(deltaTime / TARGET_FRAME_TIME, 2); // Maksimum 2x hız sınırı

    // Duraklatma kontrolü - oyun duraklatıldığında sadece ekran çizilir
    if (gamePaused) {
        drawPausedScreen();
        frameCount++;
        requestAnimationFrame(gameLoop);
        return;
    }

    if (gameMode === 'victory') {
        drawDanceScene();
        frameCount++;
        requestAnimationFrame(gameLoop);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawGround();

    // Normal mod
    if (gameMode === 'normal') {
        // ZAMAN HESAPLA (2 dakika = 120 saniye hedef)
        gameTime = (Date.now() - gameStartTime - totalPausedTime) / 1000;
        const minutes = Math.floor(gameTime / 60);
        const seconds = Math.floor(gameTime % 60);
        const timeLeft = Math.max(0, 120 - gameTime); // 2 dakika geri sayım
        
        updateScoreBoard('boss', gameTime);
        
        // Hız artışı - süre geçtikçe daha da hızlan (her 5 saniyede 0.3 artış)
        const currentSpeedMinute = Math.floor(gameTime / 5);
        if (currentSpeedMinute > lastSpeedUpTime && gameTime > 0) {
            lastSpeedUpTime = currentSpeedMinute;
            speed = Math.min(speed + 0.3, 18); // Max hız 18, agresif artış
        }
        
        // Fizik (deltaTime ile normalize edilmiş)
        if (dino.jumping) {
            dino.vy += dino.gravity * currentTimeScale;
            dino.y += dino.vy * currentTimeScale;

            if (dino.y >= groundY - 80) {
                dino.y = groundY - 80;
                dino.jumping = false;
                dino.vy = 0;
            }
        }

        // Dinozor çiz
         drawRealDino(ctx, dinoImage, frameCount, heartPowerCount, dino.x, dino.y + 40, 1, false);

        // KALP SPAWN - rastgele zamanlarda (max 3, boss'a kadar) - deltaTime ile
        if (frameCount % Math.floor(600 / currentTimeScale) === 0 && Math.random() < 0.7) {
            spawnHeart(gameMode, groundY, canvas.width, (type) => play8BitSound(type));
        }

        // KALP GUNCELLEME ve CARPISMA
        filterHearts(heart => {
            heart.x -= speed * 0.8 * currentTimeScale; // Kalpler engellerden biraz yavas
            
            // Kalp carpisma (dinazor aldi mi?)
            if (checkCollision({x: dino.x + 15, y: dino.y - 20, width: 50, height: 70}, 
                             {x: heart.x, y: heart.y, width: heart.width, height: heart.height})) {
                heartPowerCount++; // UST USTE TOPLA - her kalp +1 hak
                play8BitSound('powerup'); // Ses efekti
                return false; // Kalbi sil
            }
            
            // Kalp ciz
            if (heart.x + heart.width > 0 && heart.x < canvas.width) {
                drawHeart(ctx, heart, frameCount);
            }
            
            return heart.x + heart.width > -50;
        });

        // Engeller
        spawnObstacle(gameMode, gameTime, groundY, canvas.width, canvas.height, Math.random);

        filterObstacles(obs => {
            obs.x -= speed * currentTimeScale;

            // CUKUR KONTROLU - Dinazor cukurun icine dustu mu?
            if (obs.type === 'pit') {
                if (isDinoInPit(dino, obs)) {
                    if (heartPowerCount > 0) {
                        heartPowerCount--;
                        play8BitSound('hit');
                        triggerScreenShake();
                        // Mesaj goster
                        const msg = document.createElement('div');
                        msg.textContent = `KALP KORUDU! (Kalan: ${heartPowerCount})`;
                        msg.style.cssText = 'position:fixed;top:150px;left:50%;transform:translateX(-50%);font-size:28px;color:#ff1744;font-weight:bold;text-shadow:2px 2px 4px white;z-index:300;';
                        document.body.appendChild(msg);
                        setTimeout(() => msg.remove(), 1500);
                        // Cukuru sil ve devam et
                        return false;
                    } else {
                        play8BitSound('hit');
                        triggerScreenShake();
                        gameOver();
                    }
                }
            }
            // Normal carpisma (kaktus, kus)
            else {
                // KUS ICIN GENIS HITBOX - kanatlar ve gaga dahil
                let hitbox;
                if (obs.type === 'bird') {
                    // Kus cizimi: kanatlar(x-5), govde ellipse(x+20, y, 20, 12), bas arc(x+35, y-5, 10), gaga(x+50)
                    // Hitbox: x-5'ten x+55'e, y-15'ten y+12'ye (kanatlar ve gaga dahil)
                    hitbox = {
                        x: obs.x - 5,
                        y: obs.y - 15,
                        width: 60,
                        height: 27
                    };
                } else if (obs.type === 'cactus') {
                    // Kaktüs için: gövdeyi + kolları kapsayan, üstten düşüşü de yakalayan geniş hitbox
                    hitbox = {
                        x: obs.x,          // En soldaki dikenleri de kapsar
                        y: obs.y - 5,      // Üstten taşan kısımları da yakalamak için biraz yukarı uzat
                        width: 45,         // Orijinal engel genişliği
                        height: 55         // Orijinal yükseklik + 5px tolerans
                    };
                } else if (obs.type === 'turtle') {
                    hitbox = {
                        x: obs.x + 5,
                        y: obs.y - 5,
                        width: 60,
                        height: 55
                    };
                } else {
                    // Çukur için normal hitbox
                    hitbox = obs;
                }
                
                if (checkCollision({x: dino.x + 15, y: dino.y - 20, width: 50, height: 70}, hitbox)) {
                    if (heartPowerCount > 0) {
                        // Kalp hakki varsa, sayaci azalt ve ENGELI SIL
                        heartPowerCount--;
                        play8BitSound('hit');
                        triggerScreenShake();
                        // Ekranda gecici mesaj - SADECE hala hak varsa goster (son kalpte gosterme)
                        if (heartPowerCount > 0) {
                            const msg = document.createElement('div');
                            msg.textContent = `KALP KORUDU! (Kalan: ${heartPowerCount})`;
                            msg.style.cssText = 'position:fixed;top:150px;left:50%;transform:translateX(-50%);font-size:28px;color:#ff1744;font-weight:bold;text-shadow:2px 2px 4px white;z-index:300;';
                            document.body.appendChild(msg);
                            setTimeout(() => msg.remove(), 1500);
                        }
                        // ENGELI SIL - oyuncu engeli "yok etmis" gibi
                        return false;
                    } else {
                        // Kalp hakki yoksa game over
                        play8BitSound('hit');
                        triggerScreenShake();
                        gameOver();
                    }
                }
            }

            // Çiz
            if (obs.x + obs.width > 0 && obs.x < canvas.width) {
                if (obs.type === 'cactus') {
                    drawCactus(ctx, obs.x, obs.y);
                } else if (obs.type === 'pit') {
                    drawPit(ctx, obs.x, obs.y, obs.width, canvas.height);
                } else if (obs.type === 'turtle') {
                    drawTurtle(ctx, turtleImage, obs.x, obs.y, frameCount);
                } else {
                    drawBird(ctx, obs.x, obs.y, frameCount);
                }
            }

            return obs.x + obs.width > -100;
        });
        
        // UI GUNCELLEME - Sadece sure
        const currentMinutes = Math.floor(gameTime / 60);
        const currentSeconds = Math.floor(gameTime % 60);
        updateScoreBoard('normal', gameTime);
        
        // BOSS MODUNA GEÇ - 2 DAKİKA (120 saniye)
        if (gameTime >= 120 && !bossUpgradeShown) {
            bossUpgradeShown = true; // Sadece bir kez goster
            gameRunning = false; // Oyunu duraklat
            showBossUpgradeScreen((choice) => {
                bossChoice = choice;
                if (bossChoice === 'shield') {
                    invincibilityActive = true;
                }
                startBossBattle();
            });
            return; // Bu frame'i bitir
        }
    }
    // Boss modu
    else if (gameMode === 'boss') {
        // FARE İLE 2D HAREKET - yumuşak takip (deltaTime ile normalize)
        const targetX = Math.max(50, Math.min(canvas.width / 2, mouseX));
        const targetY = Math.max(50, Math.min(groundY - 80, mouseY));
        
        dino.x += (targetX - dino.x) * 0.15 * currentTimeScale;
        dino.y += (targetY - dino.y) * 0.15 * currentTimeScale;
        
        // Zemin kontrolü
        if (dino.y >= groundY - 80) {
            dino.jumping = false;
            dino.doubleJumpAvailable = true;
        }

        // Boss hareketi - DİNOZORLA AYNI HİZADA (vurulabilir olsun)
        boss.moveTimer += currentTimeScale;
        if (boss.moveTimer % 60 < currentTimeScale) {
            // Dinazorun hareket alanıyla aynı: groundY - 80 ile 100 arası
            boss.targetY = 100 + Math.random() * (groundY - 80);
        }
        boss.y += (boss.targetY - boss.y) * 0.02 * currentTimeScale;
        
        // Boss sınırları - asla çok yüksek uçmasın
        if (boss.y < 80) boss.y = 80;
        if (boss.y > groundY - 100) boss.y = groundY - 100;

        // Boss ateş
        boss.shootTimer += currentTimeScale;
        if (boss.shootTimer >= 50) {
            bossShoot(dino, boss, bossBullets);
            boss.shootTimer %= 50;
        }

        // Mermileri güncelle
        bullets = bullets.filter(bullet => {
            bullet.x += bullet.vx * currentTimeScale;
            bullet.y += bullet.vy * currentTimeScale;

            // Boss'a çarpma - GENİŞ HITBOX (kaçırma sorunu düzeltmesi)
            const bulletBox = bullet.type === 'special' 
                ? {x: bullet.x - 15, y: bullet.y - 15, width: 30, height: 30}  // Özel mermi büyük
                : {x: bullet.x - 10, y: bullet.y - 10, width: 20, height: 20}; // Normal mermi
            const bossBox = {x: boss.x - 60, y: boss.y - 70, width: 140, height: 140}; // Boss geniş alan
            
            if (checkCollision(bulletBox, bossBox)) {
                // Hasar hesapla (özel mermi 10, normal 1)
                const damage = bullet.type === 'special' ? 10 : 1;
                boss.health -= damage;
                updateBossHealth(boss.health, boss.maxHealth);
                play8BitSound('bossHit'); // BOSS'A ÖZEL SES
                
                // Özel mermi efekti
                if (bullet.type === 'special') {
                    // Patlama efekti
                    ctx.fillStyle = '#ff4500';
                    ctx.beginPath();
                    ctx.arc(bullet.x, bullet.y, 40, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                if (boss.health <= 0) {
                    // BOSS savaşı bitti - timer'ı durdur ve kaydet
                    bossBattleDuration = Date.now() - bossBattleStartTime - totalPausedTime;
                    saveBossTime(bossBattleDuration);
                    
                    gameMode = 'victory';
                    stopBackgroundMusic(); // Arka plan müziğini durdur
                    // victoryMessage gizli - sadece canvas üzerindeki leaderboard gösterilecek
                    hideBossUI();
                    play8BitSound('victory');
                }
                return false;
            }

            drawBullet(bullet);
            return bullet.x > 0 && bullet.x < canvas.width && bullet.y > 0 && bullet.y < canvas.height;
        });

        // INVINCIBILITY KONTROLÜ - Süre doldu mu?
        if (invincibilityEndTime && Date.now() > invincibilityEndTime) {
            invincibilityEndTime = 0;
            const msg = document.createElement('div');
            msg.textContent = '🛡️ Dokunulmazlık bitti!';
            msg.style.cssText = 'position:fixed;top:200px;left:50%;transform:translateX(-50%);font-size:20px;color:#ff6b6b;font-weight:bold;text-shadow:1px 1px 2px black;z-index:300;';
            document.body.appendChild(msg);
            setTimeout(() => msg.remove(), 1500);
        }

        // Boss mermilerini güncelle
        bossBullets = bossBullets.filter(bullet => {
            bullet.x += bullet.vx * currentTimeScale;
            bullet.y += bullet.vy * currentTimeScale;

            // Oyuncuya çarpma - INVINCIBILITY aktifse hasar alma
            const isInvincible = invincibilityEndTime && Date.now() < invincibilityEndTime;
            if (!isInvincible && checkCollision({x: bullet.x - 8, y: bullet.y - 8, width: 16, height: 16},
                             {x: dino.x, y: dino.y - 40, width: 60, height: 80})) {
                dino.health--;
                updatePlayerHealth(dino.health);
                play8BitSound('hit');
                
                if (dino.health <= 0) {
                    play8BitSound('gameover');
                    gameOver();
                }
                return false;
            }

            drawBossBullet(bullet);
            return bullet.x > 0 && bullet.y > 0 && bullet.y < canvas.height;
        });

        // Çiz
         drawRealDino(ctx, dinoImage, frameCount, heartPowerCount, dino.x, dino.y + 40, 1, false);
         drawElephant(ctx, elephantImage, imagesLoaded, frameCount, boss.x, boss.y);
    }

    // Ses ikonunu çiz (en üstte kalsın)
    drawSoundIcon(ctx, canvas, soundEnabled);

    // ── DEBUG: FPS sayacı ve hata listesi ───────────────────────────────────
    if (debugMode) {
        const fps = calculateFPS();
        updateDebugUI(fps, debugErrors);
    }

    frameCount++;
    requestAnimationFrame(gameLoop);
}

// DeltaTime'ı sıfırla (oyun yeniden başlatıldığında)
function resetDeltaTime() {
    lastTime = 0;
}

// Oyun bitti
function gameOver() {
    gameRunning = false;
    if (debugMode) {
        logDebugError('Oyun bitti (gameOver çağrıldı)');
    }
    showGameOver();
    stopBackgroundMusic();
}

// BOSS ONCESI UPGRADE EKRANI - ui.js'den import edildi

// BOSS SAVAŞINI BAŞLAT
function startBossBattle() {
    gameRunning = true; // Oyunu devam ettir
    gameMode = 'boss';
    resetDeltaTime(); // DeltaTime'ı sıfırla
    bossBattleStartTime = Date.now(); // BOSS savaşı timer'ını başlat
    bossBattleDuration = 0;
    resetObstacles(); // Engeller ve kalpler sıfırla
    heartPowerCount = 0;
    dino.y = groundY - 80;
    dino.vy = 0;
    dino.jumping = false;
    boss.health = 30;
    updateBossPosition(boss, canvas, groundY); // Canvas boyutuna göre boss pozisyonunu güncelle
    
    showBossUI(dino.health);

    // Bildirim div'i oluştur
    let powerDesc = '';
    if (bossChoice === 'fireball') {
        powerDesc = '\n🔥 ATEŞ TOPU: Q tuşu ile 10 can vur! (bir kere)';
    } else if (bossChoice === 'shield') {
        powerDesc = '\n🛡️ KALKAN: E tuşu ile 7 saniye dokunulmaz ol!';
    }
    const notification = document.createElement('div');
    notification.textContent = `BOSS SAVAŞI BAŞLADI! 🎉\n\n🖱️ FARE ile hareket et\n🖱️ SOL TIK ile ateş et (1 can)${powerDesc}\n\nSen: ${dino.health} Can | Boss Fil: 30 Can`;
    notification.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);font-size:22px;color:#FFD700;font-weight:bold;text-shadow:2px 2px 4px black;z-index:300;background:rgba(0,0,0,0.7);padding:20px 30px;border-radius:10px;white-space:pre-line;text-align:center;';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);

    requestAnimationFrame(gameLoop);
}

// Oyunu başlat
function startGame() {
    gameRunning = true;
    gameMode = 'normal';
    gameStartTime = Date.now(); // ZAMAN BAŞLAT
    gameTime = 0;
    speed = 7.5; // Daha hızlı başlangıç
    lastSpeedUpTime = -1;
    totalPausedTime = 0;
    pauseStartTime = 0;
    gamePaused = false;
    frameCount = 0;
    resetDeltaTime(); // DeltaTime'ı sıfırla
    resetObstacles(); // Engeller ve kalpler sıfırla
    bullets = [];
    bossBullets = [];
    dancingDinos = [];
    specialAttackUsed = false; // Özel saldırı sıfırla
    heartPowerCount = 0; // Ust uste toplama sayacini sifirla
    
    // BOSS SECIM SISTEMI SIFIRLA
    bossChoice = null;
    bossUpgradeShown = false;
    invincibilityActive = false;
    invincibilityEndTime = 0;
    bossBattleDuration = 0; // Boss savaşı süresini sıfırla
    
    dino.x = 100;
    dino.y = groundY - 80;
    dino.vx = 0;
    dino.vy = 0;
    dino.jumping = false;
    dino.health = 50; // CAN 50
    dino.doubleJumpAvailable = true; // BAŞTAN AKTİF
    
    boss.health = 30; // BOSS CAN 30
    updateBossPosition(boss, canvas, groundY); // Canvas boyutuna göre boss pozisyonunu güncelle
    
    resetUI();
    
    startBackgroundMusic(gameRunning, gameMode);
    requestAnimationFrame(gameLoop); // Doğru şekilde timestamp ile başlat
}

// FARE TAKİPİ
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

// Event listeners
window.addEventListener('click', (e) => {
    if (e.target.closest('div[id]')) return;
    
    // Ses ikonuna tıklama kontrolü (sağ üst köşe)
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const iconX = canvas.width - 50;
    const iconY = 30;
    const iconRadius = 20; // Tıklama alanı yarıçapı
    
    const dist = Math.sqrt((clickX - iconX) ** 2 + (clickY - iconY) ** 2);
    if (dist < iconRadius) {
        soundEnabled = toggleSound(gameRunning, gameMode);
        return;
    }
    
    // Tekrar Oyna butonu kontrolü (sadece victory modunda)
    if (gameMode === 'victory' && restartBtn) {
        const btn = restartBtn;
        if (clickX >= btn.x && clickX <= btn.x + btn.w && clickY >= btn.y && clickY <= btn.y + btn.h) {
            startGame();
            return;
        }
    }
    
    if (!gameRunning) {
         if (audioCtx.state === 'suspended') audioCtx.resume();
         startGame();
     } else if (gameMode === 'boss') {
         // BOSS MODU: SOL TIK = ATEŞ
         shoot(dino, gameMode, bullets, play8BitSound);
     } else {
         // NORMAL MOD: Zıplama
         lastClickTime = jump(dino, gameMode, gameStartTime, lastClickTime, e.detail === 2, play8BitSound);
     }
});

// Tam ekran toggle fonksiyonu
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Tam ekran hatası:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

window.addEventListener('keydown', (e) => {
    // F3 = Debug modu aç/kapa
    if (e.code === 'F3') {
        e.preventDefault();
        debugMode = !debugMode;
        if (!debugMode) {
            debugFrameTimestamps.length = 0;
            debugErrors.length = 0;
            // Paneli DOM'dan kaldır ve closure değişkenini sıfırla
            removeDebugUI();
        }
        console.log(`Debug modu: ${debugMode ? 'AÇIK' : 'KAPALI'}`);
        return;
    }

    // F6 = Tam ekran toggle (isteğe bağlı, her zaman çalışır)
    if (e.code === 'F6') {
        e.preventDefault();
        toggleFullscreen();
        return;
    }

    // P = Duraklatma/Devam (oyun çalışırken veya duraklatılmışken)
    if (e.code === 'KeyP') {
        e.preventDefault();
        if (gameRunning && gameMode !== 'victory' && gameMode !== 'gameover') {
            gamePaused = !gamePaused;
            if (gamePaused) {
                pauseStartTime = Date.now();
            } else {
                totalPausedTime += Date.now() - pauseStartTime;
            }
            console.log(gamePaused ? 'Oyun duraklatıldı' : 'Oyun devam ediyor');
        }
        return;
    }

    if (!gameRunning) {
        if (e.code === 'Space' || e.code === 'Enter') {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            startGame();
        }
        return;
    }

    // Normal modda zıplama (Space/ArrowUp)
     if (gameMode === 'normal') {
         if (e.code === 'Space' || e.code === 'ArrowUp') {
             e.preventDefault();
             lastClickTime = jump(dino, gameMode, gameStartTime, lastClickTime, false, play8BitSound);
         }
     }
    // Boss modunda Q tuşu = ATEŞ TOPU (sadece fireball secildiyse), E tuşu = KALKAN (sadece shield secildiyse)
    else if (gameMode === 'boss') {
        if (e.code === 'KeyQ' && bossChoice === 'fireball' && !specialAttackUsed) {
             const result = specialShoot(dino, gameMode, bullets, specialAttackUsed, play8BitSound);
             specialAttackUsed = result.updatedSpecialAttackUsed;
             if (result.message) {
                 const msg = document.createElement('div');
                 msg.textContent = result.message.text;
                 msg.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);font-size:24px;color:#ff4500;font-weight:bold;text-shadow:2px 2px 4px yellow;z-index:300;';
                 document.body.appendChild(msg);
                 setTimeout(() => msg.remove(), result.message.duration);
             }
         }
        if (e.code === 'KeyE' && bossChoice === 'shield' && invincibilityActive && !invincibilityEndTime) {
            // E tuşu ile 7 saniye dokunulmazlık aktif et
            invincibilityEndTime = Date.now() + INVINCIBILITY_DURATION;
            invincibilityActive = false; // Kullanıldı
            play8BitSound('doubleJump');
            // Bildirim
            const msg = document.createElement('div');
            msg.textContent = '🛡️ DOKUNULMAZLIK AKTİF! (7sn)';
            msg.style.cssText = 'position:fixed;top:200px;left:50%;transform:translateX(-50%);font-size:24px;color:#FFD700;font-weight:bold;text-shadow:2px 2px 4px black;z-index:300;';
            document.body.appendChild(msg);
            setTimeout(() => msg.remove(), 2000);
        }
    }
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Zemin pozisyonunu güncelle - kayma sorunu düzeltmesi
    groundY = canvas.height - 100;
    
    // Dinozor ve boss'u yeni zemine göre ayarla
    if (gameMode === 'normal') {
        dino.y = groundY - 80;
    }
    
    // Boss'un x konumunu daima sagda tut
    updateBossPosition(boss, canvas, groundY); // Canvas boyutuna göre boss pozisyonunu güncelle
});

// Başlat
createClouds(canvas.width);
createMountains(canvas.width, groundY);
drawBackground();
drawGround();
 drawRealDino(ctx, dinoImage, frameCount, heartPowerCount, dino.x, dino.y + 40, 1, false);
