import { describe, it, expect } from 'vitest';
import { gameState, startGame, gameOver, startBossBattle } from './main.js';
import { resetObstacles } from './obstacles.js';

describe('startGame', () => {
  it('çağrıldığında gameRunning true, gameMode normal olmalı', () => {
    startGame();
    expect(gameState.gameRunning).toBe(true);
    expect(gameState.gameMode).toBe('normal');
  });
});

describe('gameOver', () => {
  it('çağrıldığında gameRunning false olmalı', () => {
    startGame();
    gameOver();
    expect(gameState.gameRunning).toBe(false);
  });
});

describe('startBossBattle', () => {
  it('çağrıldığında gameMode boss olmalı', () => {
    startGame();
    resetObstacles();
    startBossBattle();
    expect(gameState.gameMode).toBe('boss');
  });
});
