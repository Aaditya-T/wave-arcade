import { xpForLevel } from '@wave/config';

export function levelFromXp(xp: number): number {
  if (xp < 0) return 1;
  let level = 1;
  while (xpForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
}

export function xpToNextLevel(xp: number): number {
  const level = levelFromXp(xp);
  return xpForLevel(level + 1) - xp;
}

export function addXp(currentXp: number, amount: number): number {
  if (amount < 0) throw new Error('XP amount must be non-negative');
  return currentXp + amount;
}

export interface XpUpdateResult {
  xp: number;
  level: number;
  leveledUp: boolean;
}

export function addXpWithLevel(currentXp: number, amount: number): XpUpdateResult {
  const previousLevel = levelFromXp(currentXp);
  const xp = addXp(currentXp, amount);
  const level = levelFromXp(xp);
  return { xp, level, leveledUp: level > previousLevel };
}

/** XP earned within the current level (0-based within level band). */
export function currentLevelXp(totalXp: number): number {
  const level = levelFromXp(totalXp);
  return totalXp - xpForLevel(level);
}

/** XP span from current level start to next level. */
export function xpSpanForLevel(level: number): number {
  return xpForLevel(level + 1) - xpForLevel(level);
}
