// @ts-check
import { defineConfig } from '@playwright/test';

// Oyun görsel regresyon testleri için Playwright yapılandırması
// Headless Chromium, 800x600 viewport, %0.1 tolerans
export default defineConfig({
  testDir: './tests/visual',
  timeout: 30000,

  // Anlık görüntü karşılaştırma toleransı: %2 piksel farkına kadar kabul,
  // renk başına eşik 0.5. Dinamik oyun canvas'ları için rAF zamanlama farklarını tolere eder.
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      threshold: 0.5,
    },
  },

  snapshotDir: './tests/visual/__snapshots__',

  use: {
    browserName: 'chromium',
    headless: true,
    viewport: { width: 800, height: 600 },
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  // Proje kök dizininde statik dosya sunucusu başlat
  webServer: {
    command: 'node scripts/serve.cjs',
    url: 'http://localhost:8765',
    reuseExistingServer: true,
    timeout: 10000,
  },
});
