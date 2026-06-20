import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Env } from '@wave/config';

export type WaveSupabaseClient = SupabaseClient;

/** Client with RLS enforced — use in web, bots, and other public surfaces. */
export function createPublishableClient(
  env: Pick<Env, 'SUPABASE_URL' | 'SUPABASE_PUBLISHABLE_KEY'>,
): WaveSupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY);
}

/** Server-only client that bypasses RLS — use in API and workers only. */
export function createSecretClient(
  env: Pick<Env, 'SUPABASE_URL' | 'SUPABASE_SECRET_KEY'>,
): WaveSupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** @deprecated Use createPublishableClient */
export const createAnonClient = createPublishableClient;

/** @deprecated Use createSecretClient */
export const createServiceClient = createSecretClient;
