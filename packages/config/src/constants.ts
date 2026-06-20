/** Base XP required to reach level 2; scales quadratically per level. */
export const XP_BASE = 100;

/** Total XP required to reach a given level (level 1 = 0 XP). */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return XP_BASE * level * (level - 1);
}

/** Default cooldown durations in seconds. */
export const COOLDOWN_DEFAULTS = {
  tip: 60,
  canvasPaint: 30,
  bossAttack: 10,
  vaultAttempt: 300,
} as const;

/** Format a numeric source tag for XRPL transactions. */
export function formatSourceTag(tag: number): number {
  if (!Number.isInteger(tag) || tag <= 0 || tag > 4294967295) {
    throw new Error(`Invalid source tag: ${tag}`);
  }
  return tag;
}

/** Parse a source tag from string env or user input. */
export function parseSourceTag(value: string | number): number {
  const tag = typeof value === 'number' ? value : Number.parseInt(value, 10);
  return formatSourceTag(tag);
}

/** One XRP = 1_000_000 drops on XRPL. */
export const XRP_DROPS_PER_XRP = 1_000_000;

export const FACTION_DEFAULTS = {
  maxNameLength: 32,
  maxDescriptionLength: 256,
} as const;

/** Convert XRP amount to ledger drops (integer). */
export function factionCreationFeeDrops(feeXrp: number): bigint {
  if (feeXrp < 0) throw new Error('Faction creation fee must be non-negative');
  return BigInt(Math.round(feeXrp * XRP_DROPS_PER_XRP));
}

export function isFactionCreationFree(feeXrp: number): boolean {
  return feeXrp === 0;
}
