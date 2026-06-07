import { describe, it, expect } from 'vitest';
import { boss, bossShoot, updateBossPosition } from './boss.js';

describe('bossShoot', () => {
  it('bossBullets dizisine bir mermi eklemeli ve vx/vy değerleri açıya göre doğru olmalı', () => {
    // Bilinen pozisyonlarda dino ve boss oluştur
    const dino = { x: 100, y: 200 };
    const bossObj = { ...boss, x: 300, y: 150 };
    const bossBullets = [];

    bossShoot(dino, bossObj, bossBullets);

    // Bir mermi eklenmiş olmalı
    expect(bossBullets).toHaveLength(1);

    const bullet = bossBullets[0];

    // Pozisyon doğru hesaplanmış mı?
    expect(bullet.x).toBe(bossObj.x - 60);   // 240
    expect(bullet.y).toBe(bossObj.y - 20);   // 130

    // Açıyı manuel hesapla ve vx/vy'yi doğrula
    const expectedAngle = Math.atan2((dino.y - 30) - (bossObj.y - 20), dino.x - bossObj.x);
    const expectedVx = Math.cos(expectedAngle) * 9;
    const expectedVy = Math.sin(expectedAngle) * 9;

    expect(bullet.vx).toBeCloseTo(expectedVx, 10);
    expect(bullet.vy).toBeCloseTo(expectedVy, 10);
  });
});

describe('updateBossPosition', () => {
  it('boss.x canvas.width - 200, boss.y groundY - 120, boss.targetY groundY - 120 olmalı', () => {
    const bossObj = { x: 0, y: 0, targetY: 0 };
    const canvas = { width: 1920, height: 1080 };
    const groundY = 980;

    updateBossPosition(bossObj, canvas, groundY);

    expect(bossObj.x).toBe(1720);
    expect(bossObj.y).toBe(860);
    expect(bossObj.targetY).toBe(860);
  });
});
