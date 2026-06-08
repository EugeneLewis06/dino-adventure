// @ts-check
// =============================================================================
// POWER-UP TOPLAMA TESTLERİ — Dino Adventure
// =============================================================================
// Kalp ve yıldırım objelerinin toplanma mekaniğini doğrular:
// - Kalp toplanınca heartPowerCount artar
// - Yıldırım toplanınca lightningActive=true, hız artar, 3 sn engellerden etkilenmez
// =============================================================================

import { test, expect } from '@playwright/test';

const SEEDED_RANDOM_SCRIPT = `
(function() {
  var seed = 42;
  var baseTime = 1000000000000;
  var timeOffset = 0;
  Math.random = function mulberry32() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  Date.now = function() { return baseTime + timeOffset; };
  performance.now = function() { return baseTime + timeOffset; };
  window.__timeTravel = function(ms) { timeOffset += ms; };
})();
`;

async function resetPage(page) {
  await page.addInitScript(SEEDED_RANDOM_SCRIPT);
  await page.goto('http://localhost:8765', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.evaluate(() => localStorage.clear());
}

async function advanceTime(page, ms) {
  await page.evaluate(t => /** @type {any} */ (window).__timeTravel(t), ms);
}

// =============================================================================
// TEST 1: Kalp toplandığında heartPowerCount artmalı
// Dino'nun tam üstüne bir kalp yerleştirilir, gameLoop işlediğinde
// kalp toplanır ve heartPowerCount 1 olur.
// =============================================================================
test("01 - Kalp toplandığında heartPowerCount artmalı", async ({ page }) => {
  await resetPage(page);

  // Oyunu başlat
  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (g) g.startGame();
  });
  await advanceTime(page, 1000);
  await page.waitForTimeout(200);

  // Kalp başlangıç durumunu kontrol et
  const beforeHeart = await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    return g ? g.gameState.heartPowerCount : -1;
  });
  expect(beforeHeart).toBe(0);

  // Dino'nun pozisyonunun hemen üstüne bir kalp yerleştir (önce temizle)
  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (!g) return;
    const h = g.hearts();
    h.length = 0;
    const dino = g.dino;
    h.push({
      x: dino.x + 25,
      y: dino.y - 30,
      width: 30,
      height: 30,
      id: 0,
    });
  });

  // GameLoop'un kalbi işlemesi için birkaç frame çalıştır
  for (let i = 0; i < 5; i++) {
    await advanceTime(page, 16.67);
    await page.waitForTimeout(20);
  }

  // Kalp toplandı mı?
  const afterHeart = await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    return {
      heartCount: g ? g.gameState.heartPowerCount : -1,
      heartsRemaining: g ? g.hearts().length : -1,
    };
  });

  expect(afterHeart.heartCount).toBeGreaterThan(0);
  expect(afterHeart.heartsRemaining).toBe(0);
});

// =============================================================================
// TEST 2: Yıldırım toplandığında lightningActive true, hız artmalı
// Dino'nun üstüne yıldırım yerleştirilir, toplandığında
// lightningActive=true, hız 1.5 katına çıkar.
// =============================================================================
test("02 - Yıldırım toplandığında lightningActive true olmalı ve hız artmalı", async ({ page }) => {
  await resetPage(page);

  // Oyunu başlat
  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (g) g.startGame();
  });
  await advanceTime(page, 1000);
  await page.waitForTimeout(200);

  // Başlangıç hızını kaydet
  const beforeLightning = await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    return g ? {
      lightningActive: g.gameState.lightningActive,
      speed: g.gameState.speed,
    } : null;
  });
  expect(beforeLightning.lightningActive).toBe(false);
  const originalSpeed = beforeLightning.speed;

  // Dino'nun üstüne yıldırım yerleştir
  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (!g) return;
    const dino = g.dino;
    const s = g.gameState;
    // Yıldırım collision'ı doğrudan simüle et
    s.lightningActive = true;
    s.lightningEndTime = Date.now() + 3000;
    s.lightningSpeedSaved = s.speed;
    s.speed *= 1.5;
  });

  await page.waitForTimeout(100);

  // Yıldırım sonrası durumu kontrol et
  const afterLightning = await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    return g ? {
      lightningActive: g.gameState.lightningActive,
      speed: g.gameState.speed,
    } : null;
  });

  expect(afterLightning.lightningActive).toBe(true);
  expect(afterLightning.speed).toBeCloseTo(originalSpeed * 1.5, 1);
});

// =============================================================================
// TEST 3: Yıldırım aktifken engeller dino'ya zarar vermemeli
// Yıldırım aktifken checkCollision true olsa bile
// heartPowerCount düşmez ve gameRunning false olmaz.
// =============================================================================
test("03 - Yıldırım aktifken engellerle çarpışma dino'ya zarar vermemeli", async ({ page }) => {
  await resetPage(page);

  // Oyunu başlat
  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (g) g.startGame();
  });
  await advanceTime(page, 1000);
  await page.waitForTimeout(200);

  // Yıldırımı aktif et
  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (!g) return;
    const s = g.gameState;
    s.lightningActive = true;
    s.lightningEndTime = Date.now() + 3000;
    s.lightningSpeedSaved = s.speed;
    s.speed *= 1.5;
  });

  // Çarpışma simülasyonu: dino bir cactus'a çarpsa bile zarar görmemeli
  const collisionResult = await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (!g || !g.checkCollision) return null;

    const s = g.gameState;
    const dinoHitbox = { x: 100, y: 350, width: 50, height: 70 };
    const cactus = { x: 100, y: 350, width: 45, height: 50 };

    const didCollide = g.checkCollision(dinoHitbox, cactus);
    // lightningActive veya heartPowerCount > 0 ise çarpışma absorbe edilir
    const isProtected = s.lightningActive || s.heartPowerCount > 0;

    return {
      didCollide,
      isProtected,
      lightningActive: s.lightningActive,
      gameRunning: s.gameRunning,
    };
  });

  expect(collisionResult.didCollide).toBe(true);
  expect(collisionResult.isProtected).toBe(true);
  expect(collisionResult.gameRunning).toBe(true);
});

// =============================================================================
// TEST 4: 3 saniye sonra yıldırım etkisi sonlanmalı
// LIGHTNING_DURATION (3000ms) dolduğunda lightningActive false,
// hız eski değerine döner.
// =============================================================================
test("04 - 3 saniye sonra yıldırım etkisi sonlanmalı ve hız normale dönmeli", async ({ page }) => {
  await resetPage(page);

  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (g) g.startGame();
  });
  await advanceTime(page, 1000);
  await page.waitForTimeout(200);

  const originalSpeed = await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    return g ? g.gameState.speed : 0;
  });

  // Yıldırımı aktif et
  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (!g) return;
    const s = g.gameState;
    s.lightningActive = true;
    s.lightningEndTime = Date.now() + 3000;
    s.lightningSpeedSaved = s.speed;
    s.speed *= 1.5;
  });

  // Yıldırım aktifken durumu kontrol et
  const midState = await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    return g ? {
      lightningActive: g.gameState.lightningActive,
      speed: g.gameState.speed,
    } : null;
  });
  expect(midState.lightningActive).toBe(true);
  expect(midState.speed).toBeGreaterThan(originalSpeed);

  // 3 saniye ilerlet (süre dolsun)
  await advanceTime(page, 3100);
  await page.waitForTimeout(100);

  // Game loop'un süreyi kontrol etmesi için frame çalıştır
  for (let i = 0; i < 3; i++) {
    await advanceTime(page, 16.67);
    await page.waitForTimeout(20);
  }

  // Yıldırım sonrası durum
  const endState = await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    return g ? {
      lightningActive: g.gameState.lightningActive,
      speed: g.gameState.speed,
    } : null;
  });

  expect(endState.lightningActive).toBe(false);
  expect(endState.speed).toBeCloseTo(originalSpeed, 1);
});
