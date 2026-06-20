import { randomUUID } from 'node:crypto';
import type {
  Faction,
  FactionMember,
  LeaderboardRow,
  LinkedAccount,
  Profile,
  Quest,
  QuestCompletion,
  User,
  Wallet,
} from '@wave/db';
import type { WaveDb } from '../deps.js';

export function createMemoryDb(seed?: {
  quests?: Quest[];
  users?: Array<{ user: User; profile: Profile }>;
}): WaveDb {
  const users = new Map<string, User>();
  const profiles = new Map<string, Profile>();
  const wallets: Wallet[] = [];
  const linkedAccounts: LinkedAccount[] = [];
  const quests = new Map<string, Quest>();
  const completions: QuestCompletion[] = [];
  const factions = new Map<string, Faction>();
  const factionMembers: FactionMember[] = [];

  for (const q of seed?.quests ?? []) quests.set(q.id, q);
  for (const entry of seed?.users ?? []) {
    users.set(entry.user.id, entry.user);
    profiles.set(entry.profile.user_id, entry.profile);
  }

  function now() {
    return new Date().toISOString();
  }

  return {
    async getProfile(userId) {
      return profiles.get(userId) ?? null;
    },
    async getProfileById(profileId) {
      return [...profiles.values()].find((p) => p.id === profileId) ?? null;
    },
    async createUserWithProfile(displayName) {
      const user: User = { id: randomUUID(), created_at: now(), updated_at: now() };
      const profile: Profile = {
        id: randomUUID(),
        user_id: user.id,
        display_name: displayName ?? null,
        xp: 0,
        level: 1,
        faction_id: null,
        avatar_url: null,
        created_at: now(),
        updated_at: now(),
      };
      users.set(user.id, user);
      profiles.set(user.id, profile);
      return { user, profile };
    },
    async getWalletByUser(userId) {
      return wallets.find((w) => w.user_id === userId && w.is_primary) ?? null;
    },
    async getWalletByAddress(address) {
      return wallets.find((w) => w.address === address) ?? null;
    },
    async insertWallet(userId, address) {
      const wallet: Wallet = {
        id: randomUUID(),
        user_id: userId,
        address,
        is_primary: true,
        created_at: now(),
      };
      wallets.push(wallet);
      return wallet;
    },
    async getAllWallets() {
      return wallets.map((w) => ({ user_id: w.user_id, address: w.address }));
    },
    async getAllLinkedDiscord() {
      return linkedAccounts
        .filter((a) => a.provider === 'discord')
        .map((a) => ({ user_id: a.user_id, provider_id: a.provider_id }));
    },
    async getLinkedAccounts(userId) {
      return linkedAccounts.filter((a) => a.user_id === userId);
    },
    async getQuestById(questId) {
      return quests.get(questId) ?? null;
    },
    async getQuestCompletions(userId) {
      return completions.filter((c) => c.user_id === userId);
    },
    async hasQuestCompletion(userId, questId) {
      return completions.some((c) => c.user_id === userId && c.quest_id === questId);
    },
    async recordQuestCompletion(input) {
      const completion: QuestCompletion = {
        id: randomUUID(),
        user_id: input.userId,
        quest_id: input.questId,
        completed_at: now(),
      };
      completions.push(completion);
      const profile = profiles.get(input.userId);
      if (profile) {
        profiles.set(input.userId, { ...profile, xp: input.xp, level: input.level });
      }
      return completion;
    },
    async getGlobalLeaderboard() {
      return [...profiles.values()]
        .map(
          (p): LeaderboardRow => ({
            user_id: p.user_id,
            display_name: p.display_name,
            xp: p.xp,
            level: p.level,
          }),
        )
        .sort((a, b) => b.xp - a.xp);
    },
    async createFaction(input) {
      const faction: Faction = {
        id: randomUUID(),
        name: input.name,
        slug: input.name.toLowerCase().replace(/\s+/g, '-'),
        description: input.description ?? null,
        created_by: input.createdBy,
        leader_id: input.createdBy,
        creation_fee_drops: Number(input.creationFeeDrops),
        fee_tx_hash: input.feeTxHash ?? null,
        status: 'active',
        created_at: now(),
        updated_at: now(),
      };
      factions.set(faction.id, faction);
      const member: FactionMember = {
        id: randomUUID(),
        faction_id: faction.id,
        user_id: input.createdBy,
        role: 'leader',
        joined_at: now(),
      };
      factionMembers.push(member);
      const profile = profiles.get(input.createdBy);
      if (profile) profiles.set(input.createdBy, { ...profile, faction_id: faction.id });
      return { faction, member };
    },
    async getFactionById(factionId) {
      return factions.get(factionId) ?? null;
    },
    async getFactionByName(name) {
      return [...factions.values()].find((f) => f.name === name) ?? null;
    },
    async listFactions() {
      return [...factions.values()].filter((f) => f.status === 'active');
    },
    async getFactionMember(userId) {
      return factionMembers.find((m) => m.user_id === userId) ?? null;
    },
    async getFactionMembers(factionId) {
      return factionMembers.filter((m) => m.faction_id === factionId);
    },
    async addFactionMember(factionId, userId, role = 'member') {
      const member: FactionMember = {
        id: randomUUID(),
        faction_id: factionId,
        user_id: userId,
        role,
        joined_at: now(),
      };
      factionMembers.push(member);
      const profile = profiles.get(userId);
      if (profile) profiles.set(userId, { ...profile, faction_id: factionId });
      return member;
    },
    async removeFactionMember(factionId, userId) {
      const idx = factionMembers.findIndex(
        (m) => m.faction_id === factionId && m.user_id === userId,
      );
      if (idx >= 0) factionMembers.splice(idx, 1);
      const profile = profiles.get(userId);
      if (profile) profiles.set(userId, { ...profile, faction_id: null });
    },
    async updateFactionMemberRole(factionId, userId, role) {
      const member = factionMembers.find(
        (m) => m.faction_id === factionId && m.user_id === userId,
      );
      if (!member) throw new Error('Member not found');
      member.role = role;
      if (role === 'leader') {
        const faction = factions.get(factionId);
        if (faction) factions.set(factionId, { ...faction, leader_id: userId });
      }
      return member;
    },
  };
}

export function makeTestEnv() {
  return {
    NODE_ENV: 'test' as const,
    APP_URL: 'http://localhost:3000',
    API_URL: 'http://localhost:4000',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
    SUPABASE_SECRET_KEY: 'sb_secret_test',
    XRPL_NETWORK: 'testnet' as const,
    FACTION_CREATION_FEE_XRP: 0,
  };
}

export function seedUser(id: string, xp = 0, level = 1) {
  const ts = new Date().toISOString();
  return {
    user: { id, created_at: ts, updated_at: ts },
    profile: {
      id: randomUUID(),
      user_id: id,
      display_name: `User ${id.slice(0, 4)}`,
      xp,
      level,
      faction_id: null,
      avatar_url: null,
      created_at: ts,
      updated_at: ts,
    },
  };
}

export function seedQuest(id: string, xpReward = 50, requiredLevel = 1): Quest {
  return {
    id,
    slug: `quest-${id}`,
    title: 'Test Quest',
    description: null,
    xp_reward: xpReward,
    required_level: requiredLevel,
    is_active: true,
    created_at: new Date().toISOString(),
  };
}
