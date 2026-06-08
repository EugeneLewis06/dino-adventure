// @ts-check
// =============================================================================
// GÖRSEL REGRESYON TESTLERİ — Dino Adventure
// =============================================================================
// Oyunun farklı durumlarında canvas'ın doğru render edildiğini doğrular.
// Headless Chromium'da 800x600 çözünürlükte, tolerans: %0.1 piksel bazında.
//
// Math.random ve Date.now deterministik seed ile override edilir,
// böylece tüm snapshot'lar her çalıştırmada birebir aynı olur.
//
// Snapshot güncelleme: npx playwright test --update-snapshots
// Sadece görsel testleri çalıştır: npx playwright test
// =============================================================================

import { test, expect } from '@playwright/test';

// Sabit PRNG tohumu — her çalıştırmada aynı rastgele değerler üretilir
const RANDOM_SEED = 42;

// Mulberry32 PRNG — sayfa yüklenmeden önce Math.random yerine enjekte edilir
const SEEDED_RANDOM_SCRIPT = `
(function() {
  var seed = ${RANDOM_SEED};
  var baseTime = 1000000000000;
  var timeOffset = 0;

  // Mulberry32 seeded PRNG
  Math.random = function mulberry32() {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };

  // Sabit Date.now() — testler arası tutarlılık için
  var _originalDateNow = Date.now;
  Date.now = function() { return baseTime + timeOffset; };

  // Sabit performance.now()
  var _originalPerfNow = performance.now;
  performance.now = function() { return baseTime + timeOffset; };

  // Time ilerletme fonksiyonu — test kodu ms cinsinden zamanı ilerletir
  window.__timeTravel = function(ms) { timeOffset += ms; };
})();
`;

// ---------------------------------------------------------------------------
// YARDIMCI: Sayfayı sıfırla — her testten önce çalışır
// ---------------------------------------------------------------------------
async function resetPage(page) {
  // Sabit PRNG'yi sayfa yüklenmeden önce enjekte et
  await page.addInitScript(SEEDED_RANDOM_SCRIPT);

  await page.goto('http://localhost:8765', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.evaluate(() => localStorage.clear());
}

// ---------------------------------------------------------------------------
// YARDIMCI: Test kancası üzerinden oyunu başlat
// ---------------------------------------------------------------------------
async function startGameViaHook(page) {
  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (g) g.startGame();
  });
}

// ---------------------------------------------------------------------------
// YARDIMCI: Zamanı ilerlet (oyun döngüsü ms cinsinden ilerler)
// ---------------------------------------------------------------------------
async function advanceTime(page, ms) {
  await page.evaluate((t) => {
    /** @type {any} */ (window).__timeTravel(t);
  }, ms);
}

// ---------------------------------------------------------------------------
// YARDIMCI: Boss modunu başlat
// ---------------------------------------------------------------------------
async function triggerBossMode(page, choice = 'fireball') {
  await page.evaluate((power) => {
    const g = /** @type {any} */ (window).__game__;
    if (!g) return;
    g.gameState.bossChoice = power;
    if (power === 'shield') g.gameState.invincibilityActive = true;
    g.startBossBattle();
  }, choice);
  await page.waitForTimeout(2500);
}

// ---------------------------------------------------------------------------
// YARDIMCI: Animasyonlu testlerde oyunu belirli bir süre çalıştırıp dondur
// ---------------------------------------------------------------------------
async function runGameFor(page, ms) {
  await startGameViaHook(page);
  // Zamanı rAF'e bırak (oyun 60fps'de ~16.67ms per frame)
  // waitForTimeout gerçek zamanla bekler, rAF ise sanal zamanla çalışır
  // Oyunu 1 saniye gerçek zaman çalıştır (~60 frame)
  const frames = Math.floor(ms / 16.67);
  for (let i = 0; i < frames; i++) {
    await advanceTime(page, 16.67);
    await page.waitForTimeout(1); // rAF için mikro-beşik
  }
  // Dondur
  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (g) g.gameState.gamePaused = true;
  });
  await page.waitForTimeout(100);
}

// =============================================================================
// TEST 1: Ana Menü Ekranı
// Sayfa yüklenir, canvas başlangıç durumunu (arka plan, zemin, dino, güneş)
// gösterir. "Tıkla ve Başla!" mesajı görünür.
// =============================================================================
test('01 - Ana menü ekranı doğru render edilmeli', async ({ page }) => {
  await resetPage(page);
  await expect(page.locator('#startMessage')).toBeVisible();
  await expect(page.locator('#gameCanvas')).toHaveScreenshot('01-main-menu.png');
});

// =============================================================================
// TEST 2: Oyun Başladı — İlk 5 Saniye
// Oyun başladıktan sonra zemin kayar, bulutlar hareket eder, güneş parlar.
// Dinozor zeminde koşar pozisyondadır.
// =============================================================================
test('02 - Oyun başlangıcı (ilk 5 saniye) doğru render edilmeli', async ({ page }) => {
  await resetPage(page);
  await runGameFor(page, 5000);
  await expect(page.locator('#gameCanvas')).toHaveScreenshot('02-game-started-5s.png');
});

// =============================================================================
// TEST 3: Dinozor Zıplama Animasyonu
// Space tuşuna basıldığında dinozor zıplar. Havada iken dinozorun
// yükselmiş pozisyonu canvas'ta görünür.
// =============================================================================
test('03 - Dinozor zıplama animasyonu doğru render edilmeli', async ({ page }) => {
  await resetPage(page);
  await startGameViaHook(page);
  await advanceTime(page, 500); // 500ms ilerle

  // Zıplamayı tetikle
  await page.keyboard.press('Space');
  await advanceTime(page, 200); // 200ms sonra (zıplama ortası)

  // Canvas'ı dondur
  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (g) g.gameState.gamePaused = true;
  });
  await page.waitForTimeout(100);

  await expect(page.locator('#gameCanvas')).toHaveScreenshot('03-dino-jumping.png');
});

// =============================================================================
// TEST 4: Engel ile Karşılaşma
// Oyunda engeller spawn olduktan sonra dinozor engele yaklaşır.
// Ekranda en az bir engel görünür.
// =============================================================================
test('04 - Engel ile karşılaşma anı doğru render edilmeli', async ({ page }) => {
  await resetPage(page);
  await runGameFor(page, 3000);
  await expect(page.locator('#gameCanvas')).toHaveScreenshot('04-obstacle-encounter.png');
});

// =============================================================================
// TEST 5: Boss Savaşı Başlangıcı
// Boss savaşı başladığında fil boss ve dinozor 2D konumlarında görünür.
// Can barları DOM'da görünür.
// =============================================================================
test('05 - Boss savaşı başlangıcı doğru render edilmeli', async ({ page }) => {
  await resetPage(page);
  await triggerBossMode(page, 'fireball');

  await expect(page.locator('#bossHealthBar')).toBeVisible();
  await expect(page.locator('#playerHealth')).toBeVisible();

  // Animasyonu durdur
  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (g) g.gameState.gameRunning = false;
  });
  await page.waitForTimeout(200);

  await expect(page.locator('#gameCanvas')).toHaveScreenshot('05-boss-battle-start.png');
});

// =============================================================================
// TEST 6: Boss'a Ateş Etme Animasyonu
// Boss modunda atılan mermi canvas üzerinde ilerlerken görünür.
// Mermi turuncu/sarı parlama efektiyle çizilir.
// =============================================================================
test("06 - Boss'a ateş etme animasyonu doğru render edilmeli", async ({ page }) => {
  await resetPage(page);
  await triggerBossMode(page, 'fireball');

  // Canvas'ın belirli bir noktasına tıkla (boss modunda click = shoot)
  await page.mouse.click(300, 250);
  await advanceTime(page, 200); // mermi ilerlesin

  // Durdur
  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (g) g.gameState.gameRunning = false;
  });
  await page.waitForTimeout(200);

  await expect(page.locator('#gameCanvas')).toHaveScreenshot('06-boss-shooting.png');
});

// =============================================================================
// TEST 7: Game Over Ekranı
// Oyun bittiğinde "KAYBETTİN!" DOM elementi görünür.
// Canvas oyunun son anını gösterir.
// =============================================================================
test('07 - Game over ekranı doğru render edilmeli', async ({ page }) => {
  await resetPage(page);
  await startGameViaHook(page);
  await advanceTime(page, 500);

  // gameOver'ı tetikle
  await page.evaluate(() => {
    const g = /** @type {any} */ (window).__game__;
    if (g) g.gameOver();
  });

  await expect(page.locator('#gameOver')).toBeVisible();
  await expect(page.locator('#gameOver')).toContainText('YOU LOST');
  await page.waitForTimeout(200);

  await expect(page.locator('#gameCanvas')).toHaveScreenshot('07-game-over.png');
});

// =============================================================================
// TROUBLESHOOTING
// =============================================================================
//
// 1. İlk çalıştırmada "snapshot doesn't exist" hatası:
//    → npx playwright test --update-snapshots
//
// 2. Snapshot'lar bozulursa (oyun kodunda görsel değişiklik sonrası):
//    → npx playwright test --update-snapshots
//
// 3. "consecutive stable screenshots" hatası:
//    → Canvas animasyonu durdurulmamış. gamePaused = true kontrol et.
//
// 4. Testler arası tutarsızlık (flaky):
//    → Math.random seed'i düzgün enjekte edildi mi kontrol et.
//    → addInitScript({content}) kullanıldığından emin ol.
//    → Tohum değeri RANDOM_SEED = 42 sabit.
//
// 5. Görseller yüklenmemiş (boss/turtle placeholder çiziliyor):
//    → resetPage() içindeki waitForTimeout(500) süresini artır.
//
// PERFORMANS:
//   npx playwright test --workers=4  (paralel, daha hızlı)
//   npx playwright test -g "Ana menü" (tek test)
// =============================================================================
