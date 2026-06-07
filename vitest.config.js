import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.js'],
    // Playwright görsel testlerini ve worktree dosyalarını hariç tut
    exclude: [
      '**/node_modules/**',
      '**/.kilo/**',
      'tests/visual/**',
    ],
  },
});
