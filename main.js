// Modül importları
import { checkCollision } from './utils.js';
import { play8BitSound, toggleSound, drawSoundIcon, startBackgroundMusic, stopBackgroundMusic, audioCtx, playLightningSound } from './audio.js';
import { scoreBoard, playerHealthDiv, bossHealthDiv, bossHealthBar, bossHealthFill, gameOverScreen, startMessage, victoryMessage, loadingMessage, hideLoadingMessage, updateScoreBoard, resetUI, showBossUI, updateBossHealth, updatePlayerHealth, hideBossUI, showGameOver, hideGameOver, showBossUpgradeScreen, updateDebugUI, removeDebugUI } from './ui.js';
import { hearts, obstacles, clouds, mountains, lightnings, createClouds, createMountains, spawnHeart, spawnLightning, spawnObstacle, drawHeart, drawLightning, drawCactus, drawBird, drawPit, drawTurtle, updateObstacles, resetObstacles, resetCloudsAndMountains, filterHearts, filterObstacles, isDinoInPit } from './obstacles.js';
import { dino, drawRealDino, jump, shoot, specialShoot } from './player.js';
import { boss, drawElephant, bossShoot, updateBossPosition } from './boss.js';

// CANVAS SETUP
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const TARGET_FPS = 60;
const TARGET_FRAME_TIME = 1000 / TARGET_FPS;
const INVINCIBILITY_DURATION = 7000;
const LIGHTNING_DURATION = 3000;
const BOSS_TIMES_KEY = 'dinoBossTopTimes';
const NORMAL_BOSS_TIME = 120;
const SHORT_BOSS_TIME = 60;

// GÖRSEL YÜKLEME
const dinoImage = new Image();
const elephantImage = new Image();
const turtleImage = new Image();
let imagesLoaded = 0;

dinoImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMTIiIHk9IjQ0IiB3aWR0aD0iOCIgaGVpZ2h0PSIxNiIgZmlsbD0iIzUzNTM1MyIvPgo8cmVjdCB4PSIyNCIgeT0iNDQiIHdpZHRoPSI4IiBoZWlnaHQ9IjE2IiBmaWxsPSIjNTM1MzUzIi8+CjxyZWN0IHg9IjE2IiB5PSIzNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjNTM1MzUzIi8+CjxyZWN0IHg9IjI0IiB5PSIyOCIgd2lkdGg9IjgiIGhlaWdodD0iMTIiIGZpbGw9IiM1MzUzNTMiLz4KPHJlY3QgeD0iMzIiIHk9IjI0IiB3aWR0aD0iMTIiIGhlaWdodD0iMTYiIGZpbGw9IiM1MzUzNTMiLz4KPHJlY3QgeD0iNDQiIHk9IjI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjNTM1MzUzIi8+CjxyZWN0IHg9IjQ0IiB5PSIyMCIgd2lkdGg9IjgiIGhlaWdodD0iNCIgZmlsbD0iIzUzNTM1MyIvPgo8cmVjdCB4PSI1MiIgeT0iMjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM1MzUzNTMiLz4KPHJlY3QgeD0iNDAiIHk9IjI4IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmZmZmIi8+CjxyZWN0IHg9IjQ0IiB5PSIyOCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iIzUzNTM1MyIvPgo8cmVjdCB4PSI0IiB5PSIzNiIgd2lkdGg9IjgiIGhlaWdodD0iMTIiIGZpbGw9IiM1MzUzNTMiLz4KPC9zdmc+';

elephantImage.src = 'fil1.png';
turtleImage.src = 'turtle.png';

dinoImage.onload = () => { imagesLoaded++; hideLoadingMessage(); };
dinoImage.onerror = () => { imagesLoaded++; hideLoadingMessage(); };
elephantImage.onload = () => { imagesLoaded++; hideLoadingMessage(); };
elephantImage.onerror = () => { imagesLoaded++; hideLoadingMessage(); };
turtleImage.onload = () => { imagesLoaded++; hideLoadingMessage(); };
turtleImage.onerror = () => { imagesLoaded++; hideLoadingMessage(); };

// TÜM OYUN DURUMU TEK OBJEDE
export const gameState = {
  gameRunning: false,
  gameMode: 'normal',
  gamePaused: false,
  gameTime: 0,
  gameStartTime: 0,
  totalPausedTime: 0,
  pauseStartTime: 0,
  score: 0,
  speed: 5.5,
  frameCount: 0,
  lastSpeedUpTime: -1,
  lastClickTime: 0,
  lastTime: 0,
  currentTimeScale: 1,
  groundY: canvas.height - 100,
  restartBtn: null,
  mouseX: 100,
  mouseY: canvas.height - 180,
  heartPowerCount: 0,
  bossChoice: null,
  bossUpgradeShown: false,
  specialAttackUsed: false,
  invincibilityActive: false,
  invincibilityEndTime: 0,
  lightningActive: false,
  lightningEndTime: 0,
  lightningSpeedSaved: 0,
  bossBattleStartTime: 0,
  bossBattleDuration: 0,
  cheatBossTimeShortened: false,
  debugMode: false,
  debugFrameTimestamps: [],
  debugErrors: [],
  bullets: [],
  bossBullets: [],
  dancingDinos: [],
  soundEnabled: true,
};

const s = gameState;

function calculateFPS() {
  const now = performance.now();
  while (s.debugFrameTimestamps.length > 0 && now - s.debugFrameTimestamps[0] > 1000) {
    s.debugFrameTimestamps.shift();
  }
  return s.debugFrameTimestamps.length;
}

function logDebugError(message) {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  s.debugErrors.push({ time: timeStr, message });
  if (s.debugErrors.length > 20) s.debugErrors.shift();
}

function drawBackground() {
  const sunGradient = ctx.createRadialGradient(100, 80, 10, 100, 80, 50);
  sunGradient.addColorStop(0, '#FFFACD');
  sunGradient.addColorStop(0.5, '#FFD700');
  sunGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
  ctx.fillStyle = sunGradient;
  ctx.beginPath();
  ctx.arc(100, 80, 50, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  clouds.forEach(cloud => {
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.width / 2, 0, Math.PI * 2);
    ctx.arc(cloud.x + cloud.width / 3, cloud.y - 10, cloud.width / 2.5, 0, Math.PI * 2);
    ctx.arc(cloud.x + cloud.width / 1.5, cloud.y, cloud.width / 2, 0, Math.PI * 2);
    ctx.fill();
    cloud.x -= cloud.speed * s.currentTimeScale;
    if (cloud.x + cloud.width < 0) cloud.x = canvas.width + cloud.width;
  });

  ctx.fillStyle = '#6a8caf';
  mountains.forEach(mountain => {
    ctx.beginPath();
    ctx.moveTo(mountain.x, mountain.y);
    ctx.lineTo(mountain.x + mountain.width / 2, mountain.y - mountain.height);
    ctx.lineTo(mountain.x + mountain.width, mountain.y);
    ctx.fill();
    mountain.x -= s.speed * 0.2 * s.currentTimeScale;
    if (mountain.x + mountain.width < 0) {
      mountain.x = canvas.width;
      mountain.height = Math.random() * 100 + 50;
    }
  });
}

function drawGround() {
  ctx.fillStyle = '#8b7355';
  ctx.fillRect(0, s.groundY, canvas.width, canvas.height - s.groundY);
  ctx.fillStyle = '#228b22';
  ctx.fillRect(0, s.groundY, canvas.width, 20);

  ctx.strokeStyle = '#1a6b1a';
  ctx.lineWidth = 2;
  for (let i = 0; i < canvas.width; i += 30) {
    const offset = (i - s.frameCount * s.speed * s.currentTimeScale) % canvas.width;
    const x = offset < 0 ? offset + canvas.width : offset;
    ctx.beginPath();
    ctx.moveTo(x, s.groundY);
    ctx.lineTo(x + 5, s.groundY - 10);
    ctx.moveTo(x + 10, s.groundY);
    ctx.lineTo(x + 15, s.groundY - 8);
    ctx.moveTo(x + 20, s.groundY);
    ctx.lineTo(x + 25, s.groundY - 12);
    ctx.stroke();
  }

  for (let i = 50; i < canvas.width; i += 200) {
    const offset = (i - s.frameCount * s.speed * s.currentTimeScale) % canvas.width;
    const x = offset < 0 ? offset + canvas.width : offset;
    ctx.fillStyle = '#ff6b9d';
    ctx.beginPath();
    ctx.arc(x, s.groundY - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd93d';
    ctx.beginPath();
    ctx.arc(x, s.groundY - 5, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBullet(bullet) {
  if (bullet.type === 'special') {
    ctx.fillStyle = '#ff4500';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff6347';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 69, 0, 0.5)';
    ctx.beginPath();
    ctx.moveTo(bullet.x - 10, bullet.y);
    ctx.lineTo(bullet.x - 25, bullet.y - 5);
    ctx.lineTo(bullet.x - 25, bullet.y + 5);
    ctx.fill();
  } else {
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBossBullet(bullet) {
  ctx.fillStyle = '#9b59b6';
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawDanceScene() {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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
    if (s.bossBattleDuration > 0) {
      ctx.fillStyle = '#90EE90';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`Bu savaş: ${formatBossTime(s.bossBattleDuration)}`, canvas.width / 2, canvas.height / 2 + 160);
    }
  }

  const btnW = 280;
  const btnH = 60;
  const btnX = canvas.width / 2 - btnW / 2;
  const btnY = canvas.height / 2 + 200;
  ctx.fillStyle = '#2d5016';
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(btnX, btnY, btnW, btnH, 15);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔄 Tekrar Oyna', canvas.width / 2, btnY + btnH / 2);
  s.restartBtn = { x: btnX, y: btnY, w: btnW, h: btnH };
  drawSoundIcon(ctx, canvas, s.soundEnabled);
}

function drawPausedScreen() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#FF6347';
  ctx.shadowBlur = 20;
  ctx.fillText('⏸️ PAUSED', canvas.width / 2, canvas.height / 2 - 50);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 30px Arial';
  ctx.fillText('Press P to Resume', canvas.width / 2, canvas.height / 2 + 30);
  drawSoundIcon(ctx, canvas, s.soundEnabled);
}

function triggerScreenShake() {
  const duration = 200;
  const startTime = Date.now();
  const originalTransform = canvas.style.transform;
  function shake() {
    const elapsed = Date.now() - startTime;
    if (elapsed >= duration) { canvas.style.transform = originalTransform; return; }
    const offsetX = (Math.random() - 0.5) * 10;
    const offsetY = (Math.random() - 0.5) * 10;
    canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    requestAnimationFrame(shake);
  }
  shake();
}

function gameLoop(currentTime) {
  if (!s.gameRunning) return;

  s.bullets = s.bullets.filter(b => b.x > -50 && b.x < canvas.width + 50);
  s.bossBullets = s.bossBullets.filter(b => b.x > -50 && b.x < canvas.width + 50);

  if (!currentTime) currentTime = performance.now();

  if (s.debugMode) s.debugFrameTimestamps.push(performance.now());

  if (!s.lastTime) s.lastTime = currentTime;
  const deltaTime = currentTime - s.lastTime;
  s.lastTime = currentTime;
  s.currentTimeScale = Math.min(deltaTime / TARGET_FRAME_TIME, 2);

  if (s.gamePaused) {
    drawPausedScreen();
    s.frameCount++;
    requestAnimationFrame(gameLoop);
    return;
  }

  if (s.gameMode === 'victory') {
    drawDanceScene();
    s.frameCount++;
    requestAnimationFrame(gameLoop);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawGround();

  if (s.gameMode === 'normal') {
    s.gameTime = (Date.now() - s.gameStartTime - s.totalPausedTime) / 1000;
    const bossTargetTime = s.cheatBossTimeShortened ? SHORT_BOSS_TIME : NORMAL_BOSS_TIME;

    updateScoreBoard('boss', s.gameTime, bossTargetTime);

    const currentSpeedMinute = Math.floor(s.gameTime / 5);
    if (currentSpeedMinute > s.lastSpeedUpTime && s.gameTime > 0) {
      s.lastSpeedUpTime = currentSpeedMinute;
      s.speed = Math.min(s.speed + 0.3, 18);
    }

    if (dino.jumping) {
      dino.vy += dino.gravity * s.currentTimeScale;
      dino.y += dino.vy * s.currentTimeScale;
      if (dino.y >= s.groundY - 80) {
        dino.y = s.groundY - 80;
        dino.jumping = false;
        dino.vy = 0;
      }
    }

    drawRealDino(ctx, dinoImage, s.frameCount, s.heartPowerCount, dino.x, dino.y + 40, 1, false);

    if (s.frameCount % Math.floor(600 / s.currentTimeScale) === 0 && Math.random() < 0.7) {
      spawnHeart(s.gameMode, s.groundY, canvas.width, (type) => play8BitSound(type));
    }

    filterHearts(heart => {
      heart.x -= s.speed * 0.8 * s.currentTimeScale;
      if (checkCollision({x: dino.x + 15, y: dino.y - 20, width: 50, height: 70},
                       {x: heart.x, y: heart.y, width: heart.width, height: heart.height})) {
        s.heartPowerCount++;
        play8BitSound('powerup');
        return false;
      }
      if (heart.x + heart.width > 0 && heart.x < canvas.width) {
        drawHeart(ctx, heart, s.frameCount);
      }
      return heart.x + heart.width > -50;
    });

    if (s.lightningActive && Date.now() > s.lightningEndTime) {
      s.lightningActive = false;
      s.speed = s.lightningSpeedSaved;
      s.lightningSpeedSaved = 0;
    }

    if (s.gameMode === 'normal' && !s.lightningActive && lightnings.length === 0 && Math.random() < 0.01) {
      spawnLightning(s.gameMode, s.groundY, canvas.width);
    }

    lightnings.splice(0, lightnings.length, ...lightnings.filter(lightning => {
      lightning.x -= s.speed * 0.8 * 1.4 * s.currentTimeScale;
      if (checkCollision({x: dino.x + 15, y: dino.y - 20, width: 50, height: 70},
                       {x: lightning.x, y: lightning.y, width: lightning.width, height: lightning.height})
          && !s.lightningActive) {
        s.lightningActive = true;
        s.lightningEndTime = Date.now() + LIGHTNING_DURATION;
        s.lightningSpeedSaved = s.speed;
        s.speed *= 1.5;
        playLightningSound();
        const msg = document.createElement('div');
        msg.textContent = '⚡ YILDIRIM GÜCÜ! Hız +%50 & Dokunulmaz (3sn)';
        msg.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);font-size:24px;color:#FFD700;font-weight:bold;text-shadow:2px 2px 4px black;z-index:300;';
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 2000);
        return false;
      }
      if (lightning.x + lightning.width > 0 && lightning.x < canvas.width) {
        drawLightning(ctx, lightning, s.frameCount);
      }
      return lightning.x + lightning.width > -50;
    }));

    const obstacleGameTime = s.cheatBossTimeShortened ? s.gameTime * 2 : s.gameTime;
    spawnObstacle(s.gameMode, obstacleGameTime, s.groundY, canvas.width, canvas.height, Math.random);

    filterObstacles(obs => {
      obs.x -= s.speed * s.currentTimeScale;

      if (obs.type === 'pit') {
        if (isDinoInPit(dino, obs)) {
          if (s.heartPowerCount > 0 || s.lightningActive) {
            if (!s.lightningActive) s.heartPowerCount--;
            play8BitSound('hit');
            triggerScreenShake();
            const msg = document.createElement('div');
            msg.textContent = `KALP KORUDU! (Kalan: ${s.heartPowerCount})`;
            msg.style.cssText = 'position:fixed;top:150px;left:50%;transform:translateX(-50%);font-size:28px;color:#ff1744;font-weight:bold;text-shadow:2px 2px 4px white;z-index:300;';
            document.body.appendChild(msg);
            setTimeout(() => msg.remove(), 1500);
            return false;
          } else {
            play8BitSound('hit');
            triggerScreenShake();
            gameOver();
          }
        }
      } else {
        let hitbox;
        if (obs.type === 'bird') {
          hitbox = { x: obs.x - 5, y: obs.y - 15, width: 60, height: 27 };
        } else if (obs.type === 'cactus') {
          hitbox = { x: obs.x, y: obs.y - 5, width: 45, height: 55 };
        } else if (obs.type === 'turtle') {
          hitbox = { x: obs.x + 5, y: obs.y - 5, width: 60, height: 55 };
        } else {
          hitbox = obs;
        }

        if (checkCollision({x: dino.x + 15, y: dino.y - 20, width: 50, height: 70}, hitbox)) {
          if (s.heartPowerCount > 0 || s.lightningActive) {
            if (!s.lightningActive) s.heartPowerCount--;
            play8BitSound('hit');
            triggerScreenShake();
            if (s.heartPowerCount > 0) {
              const msg = document.createElement('div');
              msg.textContent = `KALP KORUDU! (Kalan: ${s.heartPowerCount})`;
              msg.style.cssText = 'position:fixed;top:150px;left:50%;transform:translateX(-50%);font-size:28px;color:#ff1744;font-weight:bold;text-shadow:2px 2px 4px white;z-index:300;';
              document.body.appendChild(msg);
              setTimeout(() => msg.remove(), 1500);
            }
            return false;
          } else {
            play8BitSound('hit');
            triggerScreenShake();
            gameOver();
          }
        }
      }

      if (obs.x + obs.width > 0 && obs.x < canvas.width) {
        if (obs.type === 'cactus') drawCactus(ctx, obs.x, obs.y);
        else if (obs.type === 'pit') drawPit(ctx, obs.x, obs.y, obs.width, canvas.height);
        else if (obs.type === 'turtle') drawTurtle(ctx, turtleImage, obs.x, obs.y, s.frameCount);
        else drawBird(ctx, obs.x, obs.y, s.frameCount);
      }
      return obs.x + obs.width > -100;
    });

    updateScoreBoard('normal', s.gameTime, s.cheatBossTimeShortened ? SHORT_BOSS_TIME : NORMAL_BOSS_TIME);

    if (s.gameTime >= bossTargetTime && !s.bossUpgradeShown) {
      s.bossUpgradeShown = true;
      s.gameRunning = false;
      showBossUpgradeScreen((choice) => {
        s.bossChoice = choice;
        if (s.bossChoice === 'shield') s.invincibilityActive = true;
        startBossBattle();
      });
      return;
    }
  } else if (s.gameMode === 'boss') {
    const targetX = Math.max(50, Math.min(canvas.width / 2, s.mouseX));
    const targetY = Math.max(50, Math.min(s.groundY - 80, s.mouseY));

    dino.x += (targetX - dino.x) * 0.15 * s.currentTimeScale;
    dino.y += (targetY - dino.y) * 0.15 * s.currentTimeScale;

    if (dino.y >= s.groundY - 80) {
      dino.jumping = false;
      dino.doubleJumpAvailable = true;
    }

    boss.moveTimer += s.currentTimeScale;
    if (boss.moveTimer % 60 < s.currentTimeScale) {
      boss.targetY = 100 + Math.random() * (s.groundY - 80);
    }
    boss.y += (boss.targetY - boss.y) * 0.02 * s.currentTimeScale;
    if (boss.y < 80) boss.y = 80;
    if (boss.y > s.groundY - 100) boss.y = s.groundY - 100;

    boss.shootTimer += s.currentTimeScale;
    if (boss.shootTimer >= 25) {
      bossShoot(dino, boss, s.bossBullets);
      boss.shootTimer %= 25;
    }

    s.bullets = s.bullets.filter(bullet => {
      bullet.x += bullet.vx * s.currentTimeScale;
      bullet.y += bullet.vy * s.currentTimeScale;
      const bulletBox = bullet.type === 'special'
        ? {x: bullet.x - 15, y: bullet.y - 15, width: 30, height: 30}
        : {x: bullet.x - 10, y: bullet.y - 10, width: 20, height: 20};
      const bossBox = {x: boss.x - 60, y: boss.y - 70, width: 140, height: 140};
      if (checkCollision(bulletBox, bossBox)) {
        const damage = bullet.type === 'special' ? 10 : 1;
        boss.health -= damage;
        updateBossHealth(boss.health, boss.maxHealth);
        play8BitSound('bossHit');
        if (bullet.type === 'special') {
          ctx.fillStyle = '#ff4500';
          ctx.beginPath();
          ctx.arc(bullet.x, bullet.y, 40, 0, Math.PI * 2);
          ctx.fill();
        }
        if (boss.health <= 0) {
          s.bossBattleDuration = Date.now() - s.bossBattleStartTime - s.totalPausedTime;
          saveBossTime(s.bossBattleDuration);
          s.gameMode = 'victory';
          stopBackgroundMusic();
          hideBossUI();
          play8BitSound('victory');
        }
        return false;
      }
      drawBullet(bullet);
      return bullet.x > 0 && bullet.x < canvas.width && bullet.y > 0 && bullet.y < canvas.height;
    });

    if (s.invincibilityEndTime && Date.now() > s.invincibilityEndTime) {
      s.invincibilityEndTime = 0;
      const msg = document.createElement('div');
      msg.textContent = '🛡️ Dokunulmazlık bitti!';
      msg.style.cssText = 'position:fixed;top:200px;left:50%;transform:translateX(-50%);font-size:20px;color:#ff6b6b;font-weight:bold;text-shadow:1px 1px 2px black;z-index:300;';
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 1500);
    }

    s.bossBullets = s.bossBullets.filter(bullet => {
      bullet.x += bullet.vx * s.currentTimeScale;
      bullet.y += bullet.vy * s.currentTimeScale;
      const isInvincible = s.invincibilityEndTime && Date.now() < s.invincibilityEndTime;
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

    drawRealDino(ctx, dinoImage, s.frameCount, s.heartPowerCount, dino.x, dino.y + 40, 1, false);
    drawElephant(ctx, elephantImage, s.frameCount, boss.x, boss.y);
  }

  drawSoundIcon(ctx, canvas, s.soundEnabled);

  if (s.debugMode) {
    updateDebugUI(calculateFPS(), s.debugErrors);
  }

  s.frameCount++;
  requestAnimationFrame(gameLoop);
}

function resetDeltaTime() {
  s.lastTime = 0;
}

export function gameOver() {
  s.gameRunning = false;
  if (s.debugMode) logDebugError('Oyun bitti (gameOver çağrıldı)');
  showGameOver();
  stopBackgroundMusic();
}

export function startBossBattle() {
  s.gameRunning = true;
  s.gameMode = 'boss';
  resetDeltaTime();
  s.totalPausedTime = 0;
  s.pauseStartTime = 0;
  s.bossBattleStartTime = Date.now();
  s.bossBattleDuration = 0;
  resetObstacles();
  s.heartPowerCount = 0;
  dino.y = s.groundY - 80;
  dino.vy = 0;
  dino.jumping = false;
  dino.health = 20;
  boss.health = 30;
  updateBossPosition(boss, canvas, s.groundY);

  showBossUI(dino.health);

  let powerDesc = '';
  if (s.bossChoice === 'fireball') powerDesc = '\n🔥 ATEŞ TOPU: Q tuşu ile 10 can vur! (bir kere)';
  else if (s.bossChoice === 'shield') powerDesc = '\n🛡️ KALKAN: E tuşu ile 7 saniye dokunulmaz ol!';

  const notification = document.createElement('div');
  notification.textContent = `BOSS SAVAŞI BAŞLADI! 🎉\n\n🖱️ FARE ile hareket et\n🖱️ SOL TIK ile ateş et (1 can)${powerDesc}\n\nSen: ${dino.health} Can | Boss Fil: 30 Can`;
  notification.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);font-size:22px;color:#FFD700;font-weight:bold;text-shadow:2px 2px 4px black;z-index:300;background:rgba(0,0,0,0.7);padding:20px 30px;border-radius:10px;white-space:pre-line;text-align:center;';
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 2000);

  requestAnimationFrame(gameLoop);
}

export function startGame() {
  s.gameRunning = true;
  s.gameMode = 'normal';
  s.gameStartTime = Date.now();
  s.gameTime = 0;
  s.speed = 7.5;
  s.lastSpeedUpTime = -1;
  s.totalPausedTime = 0;
  s.pauseStartTime = 0;
  s.gamePaused = false;
  s.frameCount = 0;
  resetDeltaTime();
  resetObstacles();
  s.bullets = [];
  s.bossBullets = [];
  s.dancingDinos = [];
  s.specialAttackUsed = false;
  s.heartPowerCount = 0;
  s.bossChoice = null;
  s.bossUpgradeShown = false;
  s.invincibilityActive = false;
  s.invincibilityEndTime = 0;
  s.lightningActive = false;
  s.lightningEndTime = 0;
  s.lightningSpeedSaved = 0;
  s.bossBattleDuration = 0;
  s.cheatBossTimeShortened = false;

  dino.x = 100;
  dino.y = s.groundY - 80;
  dino.vx = 0;
  dino.vy = 0;
  dino.jumping = false;
  dino.health = 50;
  dino.doubleJumpAvailable = true;

  boss.health = 30;
  updateBossPosition(boss, canvas, s.groundY);

  resetUI();

  startBackgroundMusic(s.gameRunning, s.gameMode);
  requestAnimationFrame(gameLoop);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => { console.log('Tam ekran hatası:', err); });
  } else {
    document.exitFullscreen();
  }
}

export function saveBossTime(duration) {
  let times = JSON.parse(localStorage.getItem(BOSS_TIMES_KEY)) || [];
  times.push({ duration, date: new Date().toLocaleDateString('tr-TR') });
  times.sort((a, b) => a.duration - b.duration);
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

// ── EVENT LISTENERS ─────────────────────────────────────────────────────────
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  s.mouseX = e.clientX - rect.left;
  s.mouseY = e.clientY - rect.top;
});

window.addEventListener('click', (e) => {
  if (e.target.closest('div[id]')) return;

  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  const iconX = canvas.width - 50;
  const iconY = 30;
  const iconRadius = 20;

  const dist = Math.sqrt((clickX - iconX) ** 2 + (clickY - iconY) ** 2);
  if (dist < iconRadius) {
    s.soundEnabled = toggleSound(s.gameRunning, s.gameMode);
    return;
  }

  if (s.gameMode === 'victory' && s.restartBtn) {
    const btn = s.restartBtn;
    if (clickX >= btn.x && clickX <= btn.x + btn.w && clickY >= btn.y && clickY <= btn.y + btn.h) {
      startGame();
      return;
    }
  }

  if (!s.gameRunning) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    startGame();
  } else if (s.gameMode === 'boss') {
    shoot(dino, s.gameMode, s.bullets, play8BitSound);
  } else {
    s.lastClickTime = jump(dino, s.gameMode, s.gameStartTime, s.lastClickTime, e.detail === 2, play8BitSound);
  }
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'F3') {
    e.preventDefault();
    s.debugMode = !s.debugMode;
    if (!s.debugMode) {
      s.debugFrameTimestamps.length = 0;
      s.debugErrors.length = 0;
      removeDebugUI();
    }
    console.log(`Debug modu: ${s.debugMode ? 'AÇIK' : 'KAPALI'}`);
    return;
  }

  if (e.code === 'F6') {
    e.preventDefault();
    toggleFullscreen();
    return;
  }

  if (e.code === 'KeyH' && s.gameRunning && s.gameMode === 'normal') {
    e.preventDefault();
    s.cheatBossTimeShortened = true;
    const msg = document.createElement('div');
    msg.textContent = 'Kısaltma Aktif Edildi';
    msg.style.cssText = 'position:fixed;top:180px;left:50%;transform:translateX(-50%);font-size:28px;color:#FFD700;font-weight:bold;text-shadow:2px 2px 4px black;z-index:300;';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
    return;
  }

  if (e.code === 'KeyP') {
    e.preventDefault();
    if (s.gameRunning && s.gameMode !== 'victory' && s.gameMode !== 'gameover') {
      s.gamePaused = !s.gamePaused;
      if (s.gamePaused) s.pauseStartTime = Date.now();
      else s.totalPausedTime += Date.now() - s.pauseStartTime;
      console.log(s.gamePaused ? 'Oyun duraklatıldı' : 'Oyun devam ediyor');
    }
    return;
  }

  if (!s.gameRunning) {
    if (e.code === 'Space' || e.code === 'Enter') {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      startGame();
    }
    return;
  }

  if (s.gameMode === 'normal') {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      s.lastClickTime = jump(dino, s.gameMode, s.gameStartTime, s.lastClickTime, false, play8BitSound);
    }
  } else if (s.gameMode === 'boss') {
    if (e.code === 'KeyQ' && s.bossChoice === 'fireball' && !s.specialAttackUsed) {
      const result = specialShoot(dino, s.gameMode, s.bullets, s.specialAttackUsed, play8BitSound);
      s.specialAttackUsed = result.updatedSpecialAttackUsed;
      if (result.message) {
        const msg = document.createElement('div');
        msg.textContent = result.message.text;
        msg.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);font-size:24px;color:#ff4500;font-weight:bold;text-shadow:2px 2px 4px yellow;z-index:300;';
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), result.message.duration);
      }
    }
    if (e.code === 'KeyE' && s.bossChoice === 'shield' && s.invincibilityActive && !s.invincibilityEndTime) {
      s.invincibilityEndTime = Date.now() + INVINCIBILITY_DURATION;
      s.invincibilityActive = false;
      play8BitSound('doubleJump');
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
  s.groundY = canvas.height - 100;
  if (s.gameMode === 'normal') dino.y = s.groundY - 80;
  updateBossPosition(boss, canvas, s.groundY);
});

// Başlat
createClouds(canvas.width);
createMountains(canvas.width, s.groundY);
drawBackground();
drawGround();
drawRealDino(ctx, dinoImage, s.frameCount, s.heartPowerCount, dino.x, dino.y + 40, 1, false);
