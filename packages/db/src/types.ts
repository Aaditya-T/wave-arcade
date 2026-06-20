export interface User {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  xp: number;
  level: number;
  faction_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  address: string;
  is_primary: boolean;
  created_at: string;
}

export type LinkedAccountProvider = 'discord' | 'telegram' | 'web';

export interface LinkedAccount {
  id: string;
  user_id: string;
  provider: LinkedAccountProvider;
  provider_id: string;
  username: string | null;
  created_at: string;
}

export type CommunityPlatform = 'discord' | 'telegram' | 'web';

export interface Community {
  id: string;
  platform: CommunityPlatform;
  external_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  joined_at: string;
}

export interface Quest {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  xp_reward: number;
  required_level: number;
  is_active: boolean;
  created_at: string;
}

export interface QuestCompletion {
  id: string;
  user_id: string;
  quest_id: string;
  completed_at: string;
}

export interface Transaction {
  id: string;
  user_id: string | null;
  tx_hash: string;
  amount_drops: number;
  destination: string;
  source_tag: number | null;
  status: 'pending' | 'applied' | 'failed';
  created_at: string;
}

export interface Balance {
  id: string;
  user_id: string;
  arcade_balance_drops: number;
  updated_at: string;
}

export interface GameEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export type FactionRole = 'leader' | 'officer' | 'member';
export type FactionStatus = 'active' | 'disbanded';

export interface Faction {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_by: string;
  leader_id: string;
  creation_fee_drops: number;
  fee_tx_hash: string | null;
  status: FactionStatus;
  created_at: string;
  updated_at: string;
}

export interface FactionMember {
  id: string;
  faction_id: string;
  user_id: string;
  role: FactionRole;
  joined_at: string;
}

export interface LeaderboardRow {
  user_id: string;
  display_name: string | null;
  xp: number;
  level: number;
}
