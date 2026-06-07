// @ts-check
// =============================================================================
// UI SKOR TABLOSU TESTLERİ — Dino Adventure
// =============================================================================
// #scoreBoard ve #gameOver DOM elementlerinin doğru zamanda doğru metni
// gösterdiğini doğrular. Headless Chromium'da çalışır.
// =============================================================================

import { test, expect } from '@playwright/test';

// Sabit PRNG tohumu (deterministik render için)
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
// TEST 1: Sayfa yüklendiğinde skor tablosu başlangıç metni
// HTML'deki varsayılan metin "MESAFE: 0". Game over gizli.
// =============================================================================
test('01 - Sayfa yüklendiğinde #scoreBoard "MESAFE: 0" göstermeli', async ({ page }) => {
  await resetPage(page);

  const scoreText = await page.locator('#scoreBoard').textContent();
  expect(scoreText).toContain('MESAFE');
  expect(scoreText).toContain('0');

  await expect(page.locator('#gameOver')).toBeHidden();
});

// =============================================================================
// TEST 2: Oyun başladıktan 5 saniye sonra skor tablosu güncellenmeli
// startGame() → resetUI() → gameLoop updateScoreBoard ile
// "SURE: 0:05 / 2:00" formatında süre gösterir.
// =============================================================================
test('02 - Oyun başladıktan 5 saniye sonra #scoreBoard güncellenmeli', async ({ page }) => {
  await resetPage(page);

  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (g) g.startGame();
  });

  // Zamanı 5 saniye ilerlet
  await advanceTime(page, 5000);

  // rAF'in 5 saniyelik süreyi işlemesi için gerçek zamanla bekle
  await page.waitForTimeout(200);

  const scoreText = await page.locator('#scoreBoard').textContent();
  expect(scoreText).toMatch(/S[UÜ]RE:\s*\d+:\d{2}\s*\/\s*\d+:\d{2}/);
  expect(scoreText).toContain('0:05');
});

// =============================================================================
// TEST 3: Game Over ekranı doğru zamanda görünmeli
// gameOver() çağrıldığında #gameOver "KAYBETTİN!" ile görünür olur,
// skor tablosu son değeri göstermeye devam eder.
// =============================================================================
test('03 - Game Over ekranı doğru zamanda görünmeli', async ({ page }) => {
  await resetPage(page);

  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (g) g.startGame();
  });

  await advanceTime(page, 1000);
  await page.waitForTimeout(200);

  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (g) g.gameOver();
  });

  await expect(page.locator('#gameOver')).toBeVisible();
  await expect(page.locator('#gameOver')).toContainText('KAYBETTİN');

  const scoreText = await page.locator('#scoreBoard').textContent();
  expect(scoreText).toMatch(/S[UÜ]RE:\s*\d+:\d{2}\s*\/\s*\d+:\d{2}/);
});
