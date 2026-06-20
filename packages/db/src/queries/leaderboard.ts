import type { WaveSupabaseClient } from '../client.js';
import type { LeaderboardRow } from '../types.js';

export async function getGlobalLeaderboard(
  client: WaveSupabaseClient,
  limit = 100,
): Promise<LeaderboardRow[]> {
  const { data, error } = await client
    .from('profiles')
    .select('user_id, display_name, xp, level')
    .order('xp', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as LeaderboardRow[];
}
