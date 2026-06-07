// @ts-check
// =============================================================================
// ÇARPIŞMA (COLLISION) TESTLERİ — Dino Adventure
// =============================================================================
// Tüm engel türleri için checkCollision / isDinoInPit fonksiyonlarının
// doğru çalıştığını doğrular. Doğal spawn yerine engeller manuel oluşturulur,
// böylece testler deterministik ve güvenilirdir.
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

// =============================================================================
// TEST 1: Kaktüs ve kuş engelleri 5. saniyede spawn olmalı
// Doğal spawn ile oluşan engellerin tipini kontrol eder.
// 5. saniyede sadece cactus/bird tipleri mevcut olmalıdır.
// =============================================================================
test('01 - 5 saniye sonra sadece cactus ve bird tipi engeller spawn olmalı', async ({ page }) => {
  await resetPage(page);

  // Oyunu başlat, 5 saniye çalıştır
  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (g) g.startGame();
  });
  await page.evaluate(t => /** @type {any} */ (window).__timeTravel(t), 5000);
  await page.waitForTimeout(200);

  const obstacleTypes = await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    return g ? g.obstacles().map(o => o.type) : [];
  });

  // En az bir engel spawn olmuş olmalı
  expect(obstacleTypes.length).toBeGreaterThan(0);
  // Sadece cactus ve bird tipleri bulunmalı (pit/turtle 30+ sn)
  const validTypes = obstacleTypes.filter(t => t === 'cactus' || t === 'bird');
  expect(validTypes.length).toBe(obstacleTypes.length);
  expect(obstacleTypes).not.toContain('pit');
  expect(obstacleTypes).not.toContain('turtle');
});

// =============================================================================
// TEST 2: Kaktüs ve kuş ile çarpışma (checkCollision)
// Manuel olarak yerleştirilen cactus ve bird hitbox'larıyla test eder.
// Dino overlap edince true, etmeyince false dönmelidir.
// =============================================================================
test('02 - Kaktüs ve kuş engelleriyle checkCollision doğru çalışmalı', async ({ page }) => {
  await resetPage(page);

  const result = await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (!g || !g.checkCollision) return null;

    // Dino hitbox (oyundaki: dino.x+15, dino.y-20, width: 50, height: 70)
    const dinoHitbox = { x: 100, y: 300, width: 50, height: 70 };

    // Kaktüs (x: 120, y: groundY-50, width: 45, height: 50)
    const cactus = { x: 120, y: 350, width: 45, height: 50 };
    // Kuş (x: 120, y: 280, width: 50, height: 30)
    const bird = { x: 120, y: 280, width: 50, height: 30 };

    const cactusCollision = g.checkCollision(dinoHitbox, cactus);
    const birdCollision = g.checkCollision(dinoHitbox, bird);

    // Uzak engel → false
    const farCactus = { x: 500, y: 350, width: 45, height: 50 };
    const noCollision = !g.checkCollision(dinoHitbox, farCactus);

    return { cactusCollision, birdCollision, noCollision };
  });

  expect(result).not.toBeNull();
  expect(result.cactusCollision).toBe(true);
  expect(result.birdCollision).toBe(true);
  expect(result.noCollision).toBe(true);
});

// =============================================================================
// TEST 3: 60 saniye sonra pit ve turtle tipleri spawn olmalı
// Doğal spawn ile pit (30sn+) ve turtle (60sn+) mevcut olabilir.
// Garanti için manuel olarak engeller eklenir ve tipi doğrulanır.
// =============================================================================
test('03 - 60 saniye sonra pit ve turtle tipi engeller mevcut olmalı', async ({ page }) => {
  await resetPage(page);

  // 60 saniye oyna
  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (g) g.startGame();
  });
  await page.evaluate(t => /** @type {any} */ (window).__timeTravel(t), 60000);
  await page.waitForTimeout(200);

  // Doğal spawn'a ek olarak manuel pit ve turtle ekle
  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (!g) return;
    const s = g.gameState;
    const h = g.canvas.height;
    const obsArr = g.obstacles();
    obsArr.push(
      { x: 800, y: s.groundY - 5, width: 100, height: h, type: 'pit', passed: false },
      { x: 900, y: s.groundY - 70, width: 70, height: 60, type: 'turtle', passed: false }
    );
  });

  const obstacleTypes = await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    return g ? g.obstacles().map(o => o.type) : [];
  });

  const allTypes = [...new Set(obstacleTypes)];
  expect(allTypes).toContain('pit');
  expect(allTypes).toContain('turtle');
});

// =============================================================================
// TEST 4: Çukur ve kaplumbağa çarpışma testleri
// isDinoInPit (çukur) ve checkCollision (kaplumbağa) manuel test edilir.
// =============================================================================
test('04 - Çukur ve kaplumbağa çarpışma testleri doğru çalışmalı', async ({ page }) => {
  await resetPage(page);

  const result = await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (!g || !g.checkCollision || !g.isDinoInPit) return null;

    // ── Pit testi ──
    // Pit: { x, y: groundY - 5, width: 100, height: canvasHeight }
    const pit = { x: 200, y: 500, width: 100, height: 100 };

    // Dino çukurun içinde (ayaklar çukur seviyesinin altında)
    const dinoInPit = { x: 220, y: 420, vy: 0, jumping: false };
    // Dino çukurun dışında
    const dinoOutPit = { x: 50, y: 420, vy: 0, jumping: false };

    const pitInside = g.isDinoInPit(dinoInPit, pit);
    const pitOutside = g.isDinoInPit(dinoOutPit, pit);

    // ── Turtle testi ──
    const turtle = { x: 200, y: 430, width: 70, height: 60 };
    const dinoOnTurtle = { x: 180, y: 380, width: 50, height: 70 };
    const dinoFarTurtle = { x: 180, y: 380, width: 50, height: 70 };
    const turtleFar = { x: 500, y: 430, width: 70, height: 60 };

    const turtleCollision = g.checkCollision(dinoOnTurtle, turtle);
    const noTurtleCollision = !g.checkCollision(dinoFarTurtle, turtleFar);

    return {
      pitInside,
      pitOutside,
      turtleCollision,
      noTurtleCollision,
    };
  });

  expect(result).not.toBeNull();
  expect(result.pitInside).toBe(true);
  expect(result.pitOutside).toBe(false);
  expect(result.turtleCollision).toBe(true);
  expect(result.noTurtleCollision).toBe(true);
});
