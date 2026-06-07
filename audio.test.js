import { vi, describe, it, expect } from 'vitest';

const mod = await vi.importActual('./audio.js');
const { play8BitSound, toggleSound, startBackgroundMusic, stopBackgroundMusic, audioCtx } = mod;

function ensureSoundEnabled(target) {
  while (toggleSound(true, 'normal') !== target) {
    /* boş döngü, ses durumu hedef değere gelene kadar toggle */
  }
}

describe('audio', () => {
  describe('play8BitSound', () => {
    it('soundEnabled false iken osilatör oluşturulmamalı', () => {
      ensureSoundEnabled(false);
      const spyOsc = vi.spyOn(audioCtx, 'createOscillator');

      play8BitSound('jump');

      expect(spyOsc).not.toHaveBeenCalled();
      spyOsc.mockRestore();
    });
  });

  describe('toggleSound', () => {
    it('çağrıldığında soundEnabled değeri değişmeli', () => {
      ensureSoundEnabled(true);

      const toggled = toggleSound(true, 'normal');
      expect(toggled).toBe(false);

      const reverted = toggleSound(true, 'normal');
      expect(reverted).toBe(true);
    });
  });

  describe('startBackgroundMusic', () => {
    it('çağrıldığında bgMusicInterval tanımlı olmalı', () => {
      stopBackgroundMusic();
      ensureSoundEnabled(true);

      const spy = vi.spyOn(globalThis, 'setInterval').mockReturnValue(42);
      startBackgroundMusic(true, 'normal');

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
      stopBackgroundMusic();
    });
  });

  describe('stopBackgroundMusic', () => {
    it('çağrıldığında bgMusicInterval temizlenmeli', () => {
      stopBackgroundMusic();
      ensureSoundEnabled(true);

      const setIntervalSpy = vi.spyOn(globalThis, 'setInterval').mockReturnValue(42);
      const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

      startBackgroundMusic(true, 'normal');

      stopBackgroundMusic();

      expect(clearIntervalSpy).toHaveBeenCalledWith(42);
      setIntervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    });
  });
});
