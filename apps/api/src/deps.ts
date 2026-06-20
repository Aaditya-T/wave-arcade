import type { AuthAdapter } from '@wave/auth';
import type { Session } from '@wave/auth';
import type { Env } from '@wave/config';
import type {
  Faction,
  FactionMember,
  FactionRole,
  LeaderboardRow,
  LinkedAccount,
  Profile,
  Quest,
  QuestCompletion,
  User,
  Wallet,
} from '@wave/db';
import type { WaveSupabaseClient } from '@wave/db';

export interface WaveDb {
  getProfile(userId: string): Promise<Profile | null>;
  getProfileById(profileId: string): Promise<Profile | null>;
  createUserWithProfile(displayName?: string): Promise<{ user: User; profile: Profile }>;
  getWalletByUser(userId: string): Promise<Wallet | null>;
  getWalletByAddress(address: string): Promise<Wallet | null>;
  insertWallet(userId: string, address: string): Promise<Wallet>;
  getAllWallets(): Promise<Array<{ user_id: string; address: string }>>;
  getAllLinkedDiscord(): Promise<Array<{ user_id: string; provider_id: string }>>;
  getLinkedAccounts(userId: string): Promise<LinkedAccount[]>;
  getQuestById(questId: string): Promise<Quest | null>;
  getQuestCompletions(userId: string): Promise<QuestCompletion[]>;
  hasQuestCompletion(userId: string, questId: string): Promise<boolean>;
  recordQuestCompletion(input: {
    userId: string;
    questId: string;
    xp: number;
    level: number;
  }): Promise<QuestCompletion>;
  getGlobalLeaderboard(limit?: number): Promise<LeaderboardRow[]>;
  createFaction(input: {
    name: string;
    description?: string;
    createdBy: string;
    creationFeeDrops: bigint;
    feeTxHash?: string;
  }): Promise<{ faction: Faction; member: FactionMember }>;
  getFactionById(factionId: string): Promise<Faction | null>;
  getFactionByName(name: string): Promise<Faction | null>;
  listFactions(limit?: number): Promise<Faction[]>;
  getFactionMember(userId: string): Promise<FactionMember | null>;
  getFactionMembers(factionId: string): Promise<FactionMember[]>;
  addFactionMember(factionId: string, userId: string, role?: FactionRole): Promise<FactionMember>;
  removeFactionMember(factionId: string, userId: string): Promise<void>;
  updateFactionMemberRole(
    factionId: string,
    userId: string,
    role: FactionRole,
  ): Promise<FactionMember>;
}

export interface AppDeps {
  env: Env;
  db: WaveDb;
  auth: AuthAdapter;
}

export type AppVariables = {
  deps: AppDeps;
  session: Session;
};

export function createSupabaseDb(client: WaveSupabaseClient): WaveDb {
  return {
    async getProfile(userId) {
      const { getProfile } = await import('@wave/db');
      return getProfile(client, userId);
    },
    async getProfileById(profileId) {
      const { getProfileById } = await import('@wave/db');
      return getProfileById(client, profileId);
    },
    async createUserWithProfile(displayName) {
      const { createUserWithProfile } = await import('@wave/db');
      return createUserWithProfile(client, displayName);
    },
    async getWalletByUser(userId) {
      const { getWalletByUser } = await import('@wave/db');
      return getWalletByUser(client, userId);
    },
    async getWalletByAddress(address) {
      const { getWalletByAddress } = await import('@wave/db');
      return getWalletByAddress(client, address);
    },
    async insertWallet(userId, address) {
      const { insertWallet } = await import('@wave/db');
      return insertWallet(client, userId, address);
    },
    async getAllWallets() {
      const { getAllWallets } = await import('@wave/db');
      return getAllWallets(client);
    },
    async getAllLinkedDiscord() {
      const { getAllLinkedDiscord } = await import('@wave/db');
      return getAllLinkedDiscord(client);
    },
    async getLinkedAccounts(userId) {
      const { getLinkedAccounts } = await import('@wave/db');
      return getLinkedAccounts(client, userId);
    },
    async getQuestById(questId) {
      const { getQuestById } = await import('@wave/db');
      return getQuestById(client, questId);
    },
    async getQuestCompletions(userId) {
      const { getQuestCompletions } = await import('@wave/db');
      return getQuestCompletions(client, userId);
    },
    async hasQuestCompletion(userId, questId) {
      const { hasQuestCompletion } = await import('@wave/db');
      return hasQuestCompletion(client, userId, questId);
    },
    async recordQuestCompletion(input) {
      const { recordQuestCompletion } = await import('@wave/db');
      return recordQuestCompletion(client, input);
    },
    async getGlobalLeaderboard(limit) {
      const { getGlobalLeaderboard } = await import('@wave/db');
      return getGlobalLeaderboard(client, limit);
    },
    async createFaction(input) {
      const { createFaction } = await import('@wave/db');
      return createFaction(client, input);
    },
    async getFactionById(factionId) {
      const { getFactionById } = await import('@wave/db');
      return getFactionById(client, factionId);
    },
    async getFactionByName(name) {
      const { getFactionByName } = await import('@wave/db');
      return getFactionByName(client, name);
    },
    async listFactions(limit) {
      const { listFactions } = await import('@wave/db');
      return listFactions(client, limit);
    },
    async getFactionMember(userId) {
      const { getFactionMember } = await import('@wave/db');
      return getFactionMember(client, userId);
    },
    async getFactionMembers(factionId) {
      const { getFactionMembers } = await import('@wave/db');
      return getFactionMembers(client, factionId);
    },
    async addFactionMember(factionId, userId, role) {
      const { addFactionMember } = await import('@wave/db');
      return addFactionMember(client, factionId, userId, role);
    },
    async removeFactionMember(factionId, userId) {
      const { removeFactionMember } = await import('@wave/db');
      return removeFactionMember(client, factionId, userId);
    },
    async updateFactionMemberRole(factionId, userId, role) {
      const { updateFactionMemberRole } = await import('@wave/db');
      return updateFactionMemberRole(client, factionId, userId, role);
    },
  };
}
