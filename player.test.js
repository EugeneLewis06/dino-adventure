import { describe, it, expect, beforeEach } from 'vitest';
import { dino, jump, shoot } from './player.js';

describe('jump', () => {
  const GAME_MODE = 'normal';
  const mockSound = () => {};

  beforeEach(() => {
    // Her testten önce dino'yu başlangıç durumuna sıfırla
    dino.jumping = false;
    dino.vy = 0;
    dino.doubleJumpAvailable = false;
  });

  // Senaryo 1: Yerdeyken zıplama → vy -20, jumping true
  it('dinozor yerdeyken zıplama yapıldığında dino.vy -20 olmalı ve dino.jumping true olmalı', () => {
    const gameStartTime = Date.now() - 5000; // 5 saniye önce başladı (800ms engelini geçer)
    const lastClickTime = 0;

    jump(dino, GAME_MODE, gameStartTime, lastClickTime, false, mockSound);

    expect(dino.vy).toBe(-20);
    expect(dino.jumping).toBe(true);
  });

  // Senaryo 2: Havadayken + doubleJumpAvailable + double-click → vy -16
  it('dinozor havadayken ve doubleJumpAvailable true iken çift tıklama yapıldığında dino.vy -16 olmalı', () => {
    // Önce ilk zıplamayı yap
    const gameStartTime = Date.now() - 5000;
    const lastClickTime = 0;
    jump(dino, GAME_MODE, gameStartTime, lastClickTime, false, mockSound);

    // Şimdi çift tıklama (son tıklama 100ms önce → 300ms içinde)
    const newLastClickTime = Date.now();
    jump(dino, GAME_MODE, gameStartTime, newLastClickTime, true, mockSound);

    expect(dino.vy).toBe(-16);
    expect(dino.doubleJumpAvailable).toBe(false);
  });

  // Senaryo 3: Havadayken doubleJumpAvailable yoksa zıplama değişmez
  it('çift zıplama hakkı yokken havada zıplama yapılırsa dino.vy ve dino.jumping değişmemeli', () => {
    // Önce ilk zıplamayı yap
    const gameStartTime = Date.now() - 5000;
    const lastClickTime = 0;
    jump(dino, GAME_MODE, gameStartTime, lastClickTime, false, mockSound);

    // doubleJumpAvailable'ı false yap (çift zıplama hakkını kullanıldı gibi simüle et)
    dino.doubleJumpAvailable = false;

    const vyBefore = dino.vy;
    const jumpingBefore = dino.jumping;

    // Tekrar zıplama denesi
    const newLastClickTime = Date.now();
    jump(dino, GAME_MODE, gameStartTime, newLastClickTime, false, mockSound);

    expect(dino.vy).toBe(vyBefore);
    expect(dino.jumping).toBe(jumpingBefore);
  });
});

describe('shoot', () => {
  const mockSound = () => {};

  // Senaryo 1: gameMode 'boss' değilse mermi eklenmez
  it('gameMode boss degilse bullets dizisine hicbir sey eklenmemeli', () => {
    const bullets = [];
    shoot(dino, 'normal', bullets, mockSound);
    expect(bullets).toHaveLength(0);
  });

  // Senaryo 2: gameMode 'boss' iken mermi eklenir
  it('gameMode boss iken bullets dizisine { type: normal, vx: 10 } iceren bir obje eklenmeli', () => {
    const bullets = [];
    shoot(dino, 'boss', bullets, mockSound);
    expect(bullets).toHaveLength(1);
    expect(bullets[0]).toMatchObject({
      type: 'normal',
      vx: 10,
      vy: 0
    });
    // Pozisyon dino'ya gore dogru hesaplanmali
    expect(bullets[0].x).toBe(dino.x + 35);
    expect(bullets[0].y).toBe(dino.y - 30);
  });
});
