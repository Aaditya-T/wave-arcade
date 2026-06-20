export interface LeaderboardEntry {
  userId: string;
  score: number;
}

export interface RankedEntry extends LeaderboardEntry {
  rank: number;
}

export function sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => b.score - a.score || a.userId.localeCompare(b.userId));
}

export function assignRanks(entries: LeaderboardEntry[]): RankedEntry[] {
  const sorted = sortLeaderboard(entries);
  let rank = 1;
  return sorted.map((entry, index) => {
    if (index > 0 && entry.score < sorted[index - 1]!.score) {
      rank = index + 1;
    }
    return { ...entry, rank };
  });
}
