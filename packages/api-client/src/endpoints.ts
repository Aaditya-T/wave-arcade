import { ApiClient } from './client.js';

export interface Profile {
  userId: string;
  displayName: string | null;
  xp: number;
  level: number;
  walletAddress: string | null;
  factionId: string | null;
}

export interface LeaderboardResponse {
  entries: Array<{ userId: string; score: number; rank: number }>;
}

export function getProfile(client: ApiClient, userId: string): Promise<Profile> {
  return client.get<Profile>(`/profile/${userId}`);
}

export function getMyProfile(client: ApiClient): Promise<Profile> {
  return client.get<Profile>('/profile/me');
}

export function linkWallet(client: ApiClient, address: string): Promise<{ ok: boolean }> {
  return client.post('/auth/link-wallet', { address });
}

export function completeQuest(client: ApiClient, questId: string): Promise<{ ok: boolean }> {
  return client.post(`/quests/${questId}/complete`);
}

export function getLeaderboard(client: ApiClient): Promise<LeaderboardResponse> {
  return client.get<LeaderboardResponse>('/leaderboard/global');
}

/** Throws until API is implemented in Milestone 2. */
export function notImplemented(feature: string): never {
  throw new Error(`${feature} is not implemented yet`);
}
