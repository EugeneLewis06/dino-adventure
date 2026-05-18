import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isDinoInPit, spawnObstacle, resetObstacles, obstacles } from './obstacles.js';

describe('isDinoInPit', () => {
  // Senaryo 1: Dinozor tam çukurun üzerinde ve ayakları içeride → true
  it('dinozor çukurun içinde ve ayakları çukur seviyesinin altındaysa true döndürmeli', () => {
    const dino = { x: 50, y: 200 };
    const pit = { x: 100, y: 250, width: 100 };
    // dinoRight = 120 > pitLeft = 100  ✓
    // dinoLeft  =  50 < pitRight = 200 ✓
    // dinoBottom = 280 >= pitTop = 250 ✓
    expect(isDinoInPit(dino, pit)).toBe(true);
  });

  // Senaryo 2: Dinozor çukurun tamamen dışında → false
  it('dinozor çukurun tamamen dışındaysa false döndürmeli', () => {
    const dino = { x: 0, y: 200 };
    const pit = { x: 200, y: 250, width: 100 };
    // dinoRight = 70, pitLeft = 200  →  70 > 200  ✗
    expect(isDinoInPit(dino, pit)).toBe(false);
  });

  // Senaryo 3: Dinozor yatayda çukurun içinde ama havada → false
  it('dinozor yatayda çukurun içinde olsa da ayakları çukur seviyesinin üstündeyse false döndürmeli', () => {
    const dino = { x: 50, y: 200 };
    const pit = { x: 100, y: 300, width: 100 };
    // dinoRight = 120 > pitLeft = 100  ✓
    // dinoLeft  =  50 < pitRight = 200 ✓
    // dinoBottom = 280 >= pitTop = 300 ✗
    expect(isDinoInPit(dino, pit)).toBe(false);
  });

  // Senaryo 4: Dinozor çukurun tam kenarında, sağ ayağı tam çizgiye değiyor → false
  // (strict > kullanıldığı için dinoRight == pitLeft durumu inPitX = false verir)
  it('dinozorun sağ kenarı çukurun sol kenarına tam olarak değerse false döndürmeli', () => {
    const dino = { x: 100, y: 200 };
    const pit = { x: 170, y: 250, width: 100 };
    // dinoRight = 170, pitLeft = 170  →  170 > 170  ✗  (strict greater-than)
    expect(isDinoInPit(dino, pit)).toBe(false);
  });
});

describe('spawnObstacle', () => {
  beforeEach(() => {
    resetObstacles();
  });

  it('vi.fn(() => 0.1) ile sahte randomFn kullanıldığında obstacles dizisine yeni engel eklenmeli', () => {
    const randomFn = vi.fn(() => 0.1);
    // 0.1 < 0.25 → spawn tetiklenir
    // gameTime=30 < 60 → pit kontrolü yok
    // 0.1 < 0.6 → type = 'cactus'
    const result = spawnObstacle('normal', 30, 400, 800, 600, randomFn);
    expect(result).not.toBeNull();
    expect(obstacles).toHaveLength(1);
    expect(randomFn).toHaveBeenCalled();
  });
});
