// @ts-check
// =============================================================================
// PAUSE / RESUME TESTLERİ — Dino Adventure
// =============================================================================
// P tuşu ile oyunun duraklatılıp devam ettirildiğini, gameTime'in
// duraklatma sırasında değişmediğini doğrular.
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

// Oyun zamanını oku (test kancası ile)
async function getGameTime(page) {
  return await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    return g ? g.gameState.gameTime : null;
  });
}

// Duraklatma durumunu oku
async function isPaused(page) {
  return await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    return g ? g.gameState.gamePaused : null;
  });
}

// =============================================================================
// TEST 1: P tuşu ile duraklatma — PAUSED yazısı görünmeli
// ---------------------------------------------------------------------------
// Oyun 4 saniye oynandıktan sonra P tuşuna basılır.
// Canvas'ta "PAUSED" yazısı görünür, gamePaused true olur.
// =============================================================================
test("01 - P tuşu ile oyun duraklatılınca canvas'ta PAUSED yazısı görünmeli", async ({ page }) => {
  await resetPage(page);

  // Oyunu başlat, 4 saniye ilerlet
  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (g) g.startGame();
  });
  await advanceTime(page, 4000);
  await page.waitForTimeout(200);

  // Oyunun 4 saniye ilerlediğini doğrula
  const timeBeforePause = await getGameTime(page);
  expect(timeBeforePause).toBeCloseTo(4, 0);

  // P tuşu ile duraklat
  await page.keyboard.press('p');
  await page.waitForTimeout(200);

  // Duraklatma durumu true olmalı
  expect(await isPaused(page)).toBe(true);

  // Canvas'ta PAUSED yazısı görünmeli (görsel doğrulama)
  await expect(page.locator('#gameCanvas')).toHaveScreenshot('pause-paused-screen.png');
});

// =============================================================================
// TEST 2: Duraklatma sırasında gameTime değişmemeli
// ---------------------------------------------------------------------------
// Oyun duraklatıldıktan sonra zaman ilerlese bile gameTime sabit kalır.
// totalPausedTime hesaplamaya dahil edildiği için gameTime donar.
// =============================================================================
test('02 - Duraklatma sırasında gameTime değişmemeli', async ({ page }) => {
  await resetPage(page);

  // Oyunu başlat, 3 saniye ilerlet
  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (g) g.startGame();
  });
  await advanceTime(page, 3000);
  await page.waitForTimeout(200);

  // Duraklat
  await page.keyboard.press('p');
  await page.waitForTimeout(100);

  // Duraklatma anındaki gameTime'i kaydet
  const pausedTime = await getGameTime(page);
  expect(pausedTime).toBeCloseTo(3, 0);

  // Duraklı halde 2 saniye daha zaman ilerlet (gerçekte oyun durdu)
  await advanceTime(page, 2000);
  await page.waitForTimeout(100);

  // gameTime hâlâ aynı olmalı (totalPausedTime düşüldüğü için)
  const timeWhilePaused = await getGameTime(page);
  expect(timeWhilePaused).toBeCloseTo(pausedTime, 1);
});

// =============================================================================
// TEST 3: P tuşuna tekrar basınca oyun devam etmeli
// ---------------------------------------------------------------------------
// İkinci kez P'ye basıldığında gamePaused false olur,
// canvas'taki PAUSED yazısı kaybolur, gameTime tekrar ilerler.
// =============================================================================
test("03 - P tuşuna tekrar basınca oyun devam etmeli, PAUSED yazısı kaybolmalı", async ({ page }) => {
  await resetPage(page);

  // Oyunu başlat, 2 saniye ilerlet
  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (g) g.startGame();
  });
  await advanceTime(page, 2000);
  await page.waitForTimeout(200);

  // Duraklat
  await page.keyboard.press('p');
  await page.waitForTimeout(100);
  expect(await isPaused(page)).toBe(true);

  const timeAtPause = await getGameTime(page);

  // Devam ettir
  await page.keyboard.press('p');
  await page.waitForTimeout(100);
  expect(await isPaused(page)).toBe(false);

  // 2 saniye daha oyna
  await advanceTime(page, 2000);
  await page.waitForTimeout(200);

  const timeAfterResume = await getGameTime(page);
  // gameTime pause'tan sonra ilerlemiş olmalı
  expect(timeAfterResume).toBeGreaterThan(timeAtPause);
  // ~2 saniye ilerlemiş olmalı (paused süresi düşülür)
  expect(timeAfterResume - timeAtPause).toBeCloseTo(2, 0);
});
