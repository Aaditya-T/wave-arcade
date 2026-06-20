import { describe, expect, it } from 'vitest';
import { applyDamage, createBoss } from './boss.js';

describe('boss', () => {
  it('applies damage until defeated', () => {
    const boss = createBoss('dragon', 100);
    const first = applyDamage(boss, 40);
    expect(first.defeated).toBe(false);
    expect(first.boss.currentHp).toBe(60);

    const second = applyDamage(first.boss, 60);
    expect(second.defeated).toBe(true);
    expect(second.boss.currentHp).toBe(0);
  });

  it('rejects damage on defeated boss', () => {
    const boss = { id: 'dragon', maxHp: 10, currentHp: 0, defeated: true };
    expect(() => applyDamage(boss, 5)).toThrow();
  });
});
