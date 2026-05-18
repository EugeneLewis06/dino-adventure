// vitest.setup.js — Tüm test dosyalarından önce browser API'leri mock'lar
import { vi } from 'vitest';

// ── window mock ─────────────────────────────────────────────────────────────
globalThis.Image = class MockImage {
  constructor() { this.src = ''; this.onload = null; this.onerror = null; }
};
const mockElements = {};
const mockDocument = {
  getElementById: vi.fn((id) => {
    if (!mockElements[id]) {
      mockElements[id] = {
        id,
        style: {},
        textContent: '',
        innerHTML: '',
        width: 1920,
        height: 1080,
        getContext: vi.fn(() => ({
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 1,
          font: '',
          textAlign: '',
          textBaseline: '',
          shadowColor: '',
          shadowBlur: 0,
          fillRect: vi.fn(),
          strokeRect: vi.fn(),
          clearRect: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          arc: vi.fn(),
          fill: vi.fn(),
          stroke: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          translate: vi.fn(),
          rotate: vi.fn(),
          scale: vi.fn(),
          setTransform: vi.fn(),
          drawImage: vi.fn(),
          createLinearGradient: vi.fn(() => ({
            addColorStop: vi.fn(),
          })),
          createRadialGradient: vi.fn(() => ({
            addColorStop: vi.fn(),
          })),
          fillText: vi.fn(),
          measureText: vi.fn(() => ({ width: 0 })),
          clip: vi.fn(),
          createPattern: vi.fn(),
        })),
        appendChild: vi.fn(),
        remove: vi.fn(),
        addEventListener: vi.fn(),
        querySelector: vi.fn(),
        querySelectorAll: vi.fn(() => []),
      };
    }
    return mockElements[id];
  }),
  createElement: vi.fn((tag) => ({
    id: '',
    style: {},
    textContent: '',
    innerHTML: '',
    appendChild: vi.fn(),
    remove: vi.fn(),
    addEventListener: vi.fn(),
  })),
  body: { appendChild: vi.fn() },
};

globalThis.window = {
  AudioContext: class MockAudioContext {},
  webkitAudioContext: class MockAudioContext {},
  innerWidth: 1920,
  innerHeight: 1080,
  addEventListener: vi.fn(),
  requestAnimationFrame: vi.fn(),
  performance: { now: vi.fn(() => Date.now()) },
};
globalThis.document = mockDocument;

// ── localStorage mock ───────────────────────────────────────────────────────
const mockStorage = {};
const localStorageMock = {
  getItem: vi.fn((key) => mockStorage[key] ?? null),
  setItem: vi.fn((key, value) => { mockStorage[key] = value; }),
  removeItem: vi.fn((key) => { delete mockStorage[key]; }),
  clear: vi.fn(() => { Object.keys(mockStorage).forEach((k) => delete mockStorage[k]); }),
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// ── audio.js modülünü mock'la ───────────────────────────────────────────────
vi.mock('./audio.js', () => ({
  play8BitSound: vi.fn(),
  toggleSound: vi.fn(),
  drawSoundIcon: vi.fn(),
  startBackgroundMusic: vi.fn(),
  stopBackgroundMusic: vi.fn(),
  audioCtx: null,
}));
