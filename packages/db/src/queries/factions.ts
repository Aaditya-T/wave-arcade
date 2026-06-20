import type { WaveSupabaseClient } from '../client.js';
import type { Faction, FactionMember, FactionRole } from '../types.js';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export interface CreateFactionInput {
  name: string;
  description?: string;
  createdBy: string;
  creationFeeDrops: bigint;
  feeTxHash?: string;
}

export async function createFaction(
  client: WaveSupabaseClient,
  input: CreateFactionInput,
): Promise<{ faction: Faction; member: FactionMember }> {
  const slug = slugify(input.name);
  const feeDrops = Number(input.creationFeeDrops);

  const { data: faction, error: factionError } = await client
    .from('factions')
    .insert({
      name: input.name,
      slug,
      description: input.description ?? null,
      created_by: input.createdBy,
      leader_id: input.createdBy,
      creation_fee_drops: feeDrops,
      fee_tx_hash: input.feeTxHash ?? null,
      status: 'active',
    })
    .select('*')
    .single();

  if (factionError) throw factionError;

  const { data: member, error: memberError } = await client
    .from('faction_members')
    .insert({
      faction_id: faction.id,
      user_id: input.createdBy,
      role: 'leader',
    })
    .select('*')
    .single();

  if (memberError) throw memberError;

  const { error: profileError } = await client
    .from('profiles')
    .update({ faction_id: faction.id })
    .eq('user_id', input.createdBy);

  if (profileError) throw profileError;

  return { faction: faction as Faction, member: member as FactionMember };
}

export async function getFactionById(
  client: WaveSupabaseClient,
  factionId: string,
): Promise<Faction | null> {
  const { data, error } = await client.from('factions').select('*').eq('id', factionId).maybeSingle();

  if (error) throw error;
  return data as Faction | null;
}

export async function getFactionByName(
  client: WaveSupabaseClient,
  name: string,
): Promise<Faction | null> {
  const { data, error } = await client.from('factions').select('*').eq('name', name).maybeSingle();

  if (error) throw error;
  return data as Faction | null;
}

export async function listFactions(
  client: WaveSupabaseClient,
  limit = 50,
): Promise<Faction[]> {
  const { data, error } = await client
    .from('factions')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Faction[];
}

export async function getFactionMember(
  client: WaveSupabaseClient,
  userId: string,
): Promise<FactionMember | null> {
  const { data, error } = await client
    .from('faction_members')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as FactionMember | null;
}

export async function getFactionMembers(
  client: WaveSupabaseClient,
  factionId: string,
): Promise<FactionMember[]> {
  const { data, error } = await client
    .from('faction_members')
    .select('*')
    .eq('faction_id', factionId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as FactionMember[];
}

export async function addFactionMember(
  client: WaveSupabaseClient,
  factionId: string,
  userId: string,
  role: FactionRole = 'member',
): Promise<FactionMember> {
  const { data, error } = await client
    .from('faction_members')
    .insert({
      faction_id: factionId,
      user_id: userId,
      role,
    })
    .select('*')
    .single();

  if (error) throw error;

  const { error: profileError } = await client
    .from('profiles')
    .update({ faction_id: factionId })
    .eq('user_id', userId);

  if (profileError) throw profileError;

  return data as FactionMember;
}

export async function removeFactionMember(
  client: WaveSupabaseClient,
  factionId: string,
  userId: string,
): Promise<void> {
  const { error } = await client
    .from('faction_members')
    .delete()
    .eq('faction_id', factionId)
    .eq('user_id', userId);

  if (error) throw error;

  const { error: profileError } = await client
    .from('profiles')
    .update({ faction_id: null })
    .eq('user_id', userId);

  if (profileError) throw profileError;
}

export async function updateFactionMemberRole(
  client: WaveSupabaseClient,
  factionId: string,
  userId: string,
  role: FactionRole,
): Promise<FactionMember> {
  const { data, error } = await client
    .from('faction_members')
    .update({ role })
    .eq('faction_id', factionId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw error;

  if (role === 'leader') {
    const { error: factionError } = await client
      .from('factions')
      .update({ leader_id: userId })
      .eq('id', factionId);

    if (factionError) throw factionError;
  }

  return data as FactionMember;
}

export async function getAllWallets(client: WaveSupabaseClient): Promise<
  Array<{ user_id: string; address: string }>
> {
  const { data, error } = await client.from('wallets').select('user_id, address');

  if (error) throw error;
  return (data ?? []) as Array<{ user_id: string; address: string }>;
}

export async function getAllLinkedDiscord(
  client: WaveSupabaseClient,
): Promise<Array<{ user_id: string; provider_id: string }>> {
  const { data, error } = await client
    .from('linked_accounts')
    .select('user_id, provider_id')
    .eq('provider', 'discord');

  if (error) throw error;
  return (data ?? []) as Array<{ user_id: string; provider_id: string }>;
}
