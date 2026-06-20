import { describe, expect, it } from 'vitest';
import { XP_BASE, xpForLevel } from '@wave/config';
import {
  addXp,
  addXpWithLevel,
  currentLevelXp,
  levelFromXp,
  xpSpanForLevel,
  xpToNextLevel,
} from './xp.js';

describe('xp', () => {
  it('levelFromXp returns 1 at zero XP', () => {
    expect(levelFromXp(0)).toBe(1);
  });

  it('addXp increases total', () => {
    expect(addXp(100, 50)).toBe(150);
  });

  it('addXp rejects negative amounts', () => {
    expect(() => addXp(100, -1)).toThrow();
  });

  it('xpToNextLevel uses config constants', () => {
    const xp = xpForLevel(2);
    expect(levelFromXp(xp)).toBe(2);
    expect(xpToNextLevel(xp)).toBe(xpForLevel(3) - xp);
  });

  it('uses XP_BASE from config', () => {
    expect(XP_BASE).toBe(100);
    expect(xpForLevel(3)).toBe(600);
  });

  it('addXpWithLevel detects level up', () => {
    const beforeLevel2 = xpForLevel(2) - 10;
    const result = addXpWithLevel(beforeLevel2, 20);
    expect(result.leveledUp).toBe(true);
    expect(result.level).toBe(2);
    expect(result.xp).toBe(xpForLevel(2) + 10);
  });

  it('addXpWithLevel without level up', () => {
    const result = addXpWithLevel(50, 10);
    expect(result.leveledUp).toBe(false);
    expect(result.level).toBe(1);
    expect(result.xp).toBe(60);
  });

  it('currentLevelXp and xpSpanForLevel align', () => {
    const total = xpForLevel(3) + 50;
    expect(levelFromXp(total)).toBe(3);
    expect(currentLevelXp(total)).toBe(50);
    expect(xpSpanForLevel(3)).toBe(xpForLevel(4) - xpForLevel(3));
  });
});
