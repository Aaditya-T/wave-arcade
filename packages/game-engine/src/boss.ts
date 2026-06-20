export interface BossState {
  id: string;
  maxHp: number;
  currentHp: number;
  defeated: boolean;
}

export function createBoss(id: string, maxHp: number): BossState {
  return { id, maxHp, currentHp: maxHp, defeated: false };
}

export function applyDamage(
  boss: BossState,
  damage: number,
): { boss: BossState; defeated: boolean } {
  if (boss.defeated) {
    throw new Error('Boss is already defeated');
  }
  if (damage <= 0) {
    throw new Error('Damage must be positive');
  }

  const newHp = Math.max(0, boss.currentHp - damage);
  const defeated = newHp === 0;

  return {
    boss: { ...boss, currentHp: newHp, defeated },
    defeated,
  };
}
