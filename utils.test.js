import { describe, it, expect } from 'vitest';
import { checkCollision } from './utils.js';

describe('checkCollision', () => {
  // Senaryo 1: Birbirini kesen iki dikdörtgen → true
  it('birbirini kesen iki dikdörtgen için true döndürmeli', () => {
    const obj1 = { x: 0, y: 0, width: 10, height: 10 };
    const obj2 = { x: 5, y: 5, width: 10, height: 10 };
    expect(checkCollision(obj1, obj2)).toBe(true);
  });

  // Senaryo 2: Birbirinden tamamen ayrı iki dikdörtgen → false
  it('birbirinden tamamen ayrı iki dikdörtgen için false döndürmeli', () => {
    const obj1 = { x: 0, y: 0, width: 10, height: 10 };
    const obj2 = { x: 20, y: 20, width: 10, height: 10 };
    expect(checkCollision(obj1, obj2)).toBe(false);
  });

  // Senaryo 3: Sınırda sadece birbirine değen iki dikdörtgen → false
  it('sınırda sadece birbirine değen iki dikdörtgen için false döndürmeli', () => {
    const obj1 = { x: 0, y: 0, width: 10, height: 10 };
    const obj2 = { x: 10, y: 0, width: 10, height: 10 };
    expect(checkCollision(obj1, obj2)).toBe(false);
  });
});
