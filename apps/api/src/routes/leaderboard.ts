import { assignRanks, type RankedEntry } from '@wave/game-engine';
import type { AppContext } from '../lib/response.js';

export async function getGlobalLeaderboardHandler(c: AppContext) {
  const deps = c.get('deps');
  const rows = await deps.db.getGlobalLeaderboard();

  const ranked = assignRanks(
    rows.map((row) => ({
      userId: row.user_id,
      score: row.xp,
    })),
  );

  return c.json({
    entries: ranked.map((entry: RankedEntry) => ({
      userId: entry.userId,
      score: entry.score,
      rank: entry.rank,
      displayName: rows.find((r) => r.user_id === entry.userId)?.display_name ?? null,
      level: rows.find((r) => r.user_id === entry.userId)?.level ?? 1,
    })),
  });
}
