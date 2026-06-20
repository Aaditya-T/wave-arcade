import { describe, expect, it } from 'vitest';
import { assignRanks, sortLeaderboard } from './leaderboard.js';

describe('leaderboard', () => {
  it('sorts by score descending', () => {
    const sorted = sortLeaderboard([
      { userId: 'b', score: 10 },
      { userId: 'a', score: 20 },
    ]);
    expect(sorted[0]?.userId).toBe('a');
  });

  it('assigns ranks with ties', () => {
    const ranked = assignRanks([
      { userId: 'a', score: 100 },
      { userId: 'b', score: 100 },
      { userId: 'c', score: 50 },
    ]);
    expect(ranked[0]?.rank).toBe(1);
    expect(ranked[1]?.rank).toBe(1);
    expect(ranked[2]?.rank).toBe(3);
  });
});
