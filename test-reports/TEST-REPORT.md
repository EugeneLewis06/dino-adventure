# Test Raporu

**Tarih:** 2026-06-07 15:06  
**Dal:** main  
**Commit:** 0446b40  

---

## Vitest — Birim Testleri

| Durum | Sayı |
|-------|------|
| ✅ Geçti | 34 |
| ❌ Kaldı | 0 |
| 📁 Dosya | 7 |

| Dosya | Test | Durum |
|-------|------|-------|
| `utils.test.js` | çarpışma algılama (3) | ✅ |
| `boss.test.js` | boss atış ve pozisyonlama (2) | ✅ |
| `obstacles.test.js` | çukur, engel spawn, kaplumbağa (7) | ✅ |
| `player.test.js` | zıplama, ateş, özel atak (9) | ✅ |
| `audio.test.js` | ses sistemi (4) | ✅ |
| `gameState.test.js` | durum geçişleri (3) | ✅ |
| `ui.test.js` | liderlik tablosu, localStorage (6) | ✅ |

---

## Playwright — Görsel Regresyon Testleri

| Durum | Sayı |
|-------|------|
| ✅ Geçti | 7 |
| ❌ Kaldı | 0 |

| # | Test | Süre | Durum |
|---|------|------|-------|
| 01 | Ana menü ekranı | 1.2s | ✅ |
| 02 | Oyun başlangıcı (ilk 5sn) | 5.9s | ✅ |
| 03 | Dinozor zıplama animasyonu | 1.3s | ✅ |
| 04 | Engel ile karşılaşma | 4.1s | ✅ |
| 05 | Boss savaşı başlangıcı | 2.9s | ✅ |
| 06 | Boss'a ateş etme | 2.9s | ✅ |
| 07 | Game over ekranı | 1.4s | ✅ |

**Ortam:** Headless Chromium 800×600, PRNG seed=42  
**Tolerans:** %2 piksel farkı, eşik 0.5  
**Toplam:** 21.0s

---

## Özet

| Test Tipi | Geçti | Kaldı | Toplam |
|-----------|-------|-------|--------|
| Vitest (birim) | 34 | 0 | 34 |
| Playwright (görsel) | 7 | 0 | 7 |
| **Genel** | **41** | **0** | **41** |
