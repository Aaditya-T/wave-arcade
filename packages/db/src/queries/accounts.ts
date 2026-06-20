import type { WaveSupabaseClient } from '../client.js';
import type { LinkedAccount } from '../types.js';

export interface LinkAccountInput {
  userId: string;
  provider: LinkedAccount['provider'];
  providerId: string;
  username?: string;
}

export async function linkAccount(
  client: WaveSupabaseClient,
  input: LinkAccountInput,
): Promise<LinkedAccount> {
  const { data, error } = await client
    .from('linked_accounts')
    .insert({
      user_id: input.userId,
      provider: input.provider,
      provider_id: input.providerId,
      username: input.username ?? null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as LinkedAccount;
}

export async function getLinkedAccounts(
  client: WaveSupabaseClient,
  userId: string,
): Promise<LinkedAccount[]> {
  const { data, error } = await client.from('linked_accounts').select('*').eq('user_id', userId);

  if (error) throw error;
  return (data ?? []) as LinkedAccount[];
}
