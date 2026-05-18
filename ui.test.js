import { describe, it, expect, beforeEach, vi } from 'vitest';

// audio.js zaten vitest.setup.js tarafından mock'lanıyor.
// saveBossTime ve getTopBossTimes main.js'de export edildi.
import { saveBossTime, getTopBossTimes } from './main.js';

// ── Testler ─────────────────────────────────────────────────────────────────
describe('saveBossTime ve getTopBossTimes', () => {
  beforeEach(() => {
    // Her test öncesi localStorage'ı tamamen temizle
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('localStorage boşken getTopBossTimes boş dizi döndürmeli', () => {
    expect(getTopBossTimes()).toEqual([]);
  });

  it('3 farklı süre kaydedildikten sonra hepsi döndürülmeli', () => {
    saveBossTime(5000);   // 5 saniye
    saveBossTime(3000);   // 3 saniye
    saveBossTime(7000);   // 7 saniye

    const result = getTopBossTimes();
    expect(result).toHaveLength(3);
  });

  it('Kaydedilen süreler en küçükten büyüğe (artan) sıralanmalı', () => {
    saveBossTime(5000);   // 5 saniye
    saveBossTime(3000);   // 3 saniye
    saveBossTime(7000);   // 7 saniye

    const result = getTopBossTimes();

    // Her eleman kendisinden sonrakinden küçük veya eşit olmalı
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].duration).toBeLessThanOrEqual(result[i + 1].duration);
    }

    // İlk eleman en küçük, son eleman en büyük olmalı
    expect(result[0].duration).toBe(3000);
    expect(result[result.length - 1].duration).toBe(7000);
  });

  it('En fazla 10 tane süre saklanmalı', () => {
    // 12 farklı süre kaydet
    for (let i = 1; i <= 12; i++) {
      saveBossTime(i * 1000);
    }

    const result = getTopBossTimes();
    expect(result).toHaveLength(10);
  });

  it('11. süre eklendiğinde en büyük olan listeden atılmalı', () => {
    // 10 süre kaydet (1–10 saniye)
    for (let i = 1; i <= 10; i++) {
      saveBossTime(i * 1000);
    }

    // 11. olarak 0.5 saniye ekle → en hızlı; 10 saniye en yavaş atılacak
    saveBossTime(500);

    const result = getTopBossTimes();
    expect(result).toHaveLength(10);

    const durations = result.map((t) => t.duration);
    expect(durations).not.toContain(10000); // 10 saniye atıldı
    expect(durations).toContain(500);        // 0.5 saniye eklendi
  });

  it('Her kayıtta date bilgisi de saklanmalı', () => {
    saveBossTime(4000);

    const result = getTopBossTimes();
    expect(result[0]).toHaveProperty('duration', 4000);
    expect(result[0]).toHaveProperty('date');
    expect(typeof result[0].date).toBe('string');
    expect(result[0].date.length).toBeGreaterThan(0);
  });

  it('Aynı süre birden fazla kaydedilirse hepsi saklanmalı', () => {
    saveBossTime(5000);
    saveBossTime(5000);
    saveBossTime(5000);

    const result = getTopBossTimes();
    expect(result).toHaveLength(3);
    expect(result.every((t) => t.duration === 5000)).toBe(true);
  });
});
