import type { WaveSupabaseClient } from '../client.js';
import type { Profile, User, Wallet } from '../types.js';

export async function getUserByWallet(
  client: WaveSupabaseClient,
  address: string,
): Promise<User | null> {
  const { data: wallet, error: walletError } = await client
    .from('wallets')
    .select('user_id')
    .eq('address', address)
    .maybeSingle();

  if (walletError) throw walletError;
  if (!wallet) return null;

  const { data: user, error: userError } = await client
    .from('users')
    .select('*')
    .eq('id', wallet.user_id)
    .maybeSingle();

  if (userError) throw userError;
  return user as User | null;
}

export async function getProfile(
  client: WaveSupabaseClient,
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}

export async function getProfileById(
  client: WaveSupabaseClient,
  profileId: string,
): Promise<Profile | null> {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}

export async function createUserWithProfile(
  client: WaveSupabaseClient,
  displayName?: string,
): Promise<{ user: User; profile: Profile }> {
  const { data: user, error: userError } = await client
    .from('users')
    .insert({})
    .select('*')
    .single();

  if (userError) throw userError;

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .insert({
      user_id: user.id,
      display_name: displayName ?? null,
    })
    .select('*')
    .single();

  if (profileError) throw profileError;

  return { user: user as User, profile: profile as Profile };
}

export async function getWalletByUser(
  client: WaveSupabaseClient,
  userId: string,
): Promise<Wallet | null> {
  const { data, error } = await client
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .eq('is_primary', true)
    .maybeSingle();

  if (error) throw error;
  return data as Wallet | null;
}

export async function getWalletByAddress(
  client: WaveSupabaseClient,
  address: string,
): Promise<Wallet | null> {
  const { data, error } = await client
    .from('wallets')
    .select('*')
    .eq('address', address)
    .maybeSingle();

  if (error) throw error;
  return data as Wallet | null;
}

export async function insertWallet(
  client: WaveSupabaseClient,
  userId: string,
  address: string,
): Promise<Wallet> {
  const { data, error } = await client
    .from('wallets')
    .insert({
      user_id: userId,
      address,
      is_primary: true,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Wallet;
}

export async function updateProfileXp(
  client: WaveSupabaseClient,
  userId: string,
  xp: number,
  level: number,
): Promise<Profile> {
  const { data, error } = await client
    .from('profiles')
    .update({ xp, level })
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return data as Profile;
}
