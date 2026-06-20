export interface XpBarProps {
  /** Total cumulative XP (used to derive level progress when currentLevelXp is omitted). */
  totalXp?: number;
  /** XP earned within the current level (0 to nextLevelXp - 1). */
  currentLevelXp?: number;
  /** XP required to reach the next level from the start of the current level. */
  nextLevelXp?: number;
  level: number;
  segments?: number;
}

export function XpBar({
  totalXp,
  currentLevelXp,
  nextLevelXp,
  level,
  segments = 10,
}: XpBarProps) {
  const levelXp = currentLevelXp ?? 0;
  const levelTotal = nextLevelXp ?? 1;
  const filled =
    levelTotal === 0 ? 0 : Math.min(segments, Math.round((levelXp / levelTotal) * segments));

  return (
    <div className="font-pixel text-arcade-gold text-[10px]">
      <div className="mb-1">LV {level}</div>
      <div className="flex gap-1" aria-label={`Level ${level} XP progress`}>
        {Array.from({ length: segments }, (_, i) => (
          <div
            key={i}
            className={`h-3 w-3 border border-arcade-border ${i < filled ? 'bg-arcade-gold' : 'bg-arcade-surface'}`}
          />
        ))}
      </div>
      {totalXp !== undefined && (
        <div className="mt-1 text-arcade-text-muted font-body text-[10px]">{totalXp} XP total</div>
      )}
    </div>
  );
}
