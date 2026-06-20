import { z } from 'zod';

const rawEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_URL: z.string().url(),
  API_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  /** Client-safe key (`sb_publishable_...`). Replaces legacy `SUPABASE_ANON_KEY`. */
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  /** Server-only key (`sb_secret_...`). Replaces legacy `SUPABASE_SERVICE_ROLE_KEY`. */
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  /** @deprecated Use SUPABASE_PUBLISHABLE_KEY */
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  /** @deprecated Use SUPABASE_SECRET_KEY */
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  XRPL_NETWORK: z.enum(['mainnet', 'testnet', 'devnet']),
  XRPL_RPC_URL: z.string().url().optional(),
  XRPL_SOURCE_TAG: z.coerce.number().int().positive().optional(),
  XAMAN_API_KEY: z.string().optional(),
  XAMAN_API_SECRET: z.string().optional(),
  WEB3AUTH_CLIENT_ID: z.string().optional(),
  DISCORD_BOT_TOKEN: z.string().optional(),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_GUILD_ID: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TREASURY_WALLET_ADDRESS: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  /** XRP fee to create a faction; 0 = free. Default 0.1 XRP. */
  FACTION_CREATION_FEE_XRP: z.coerce.number().min(0).default(0.1),
});

const envSchema = rawEnvSchema.transform((data) => {
  const publishableKey = data.SUPABASE_PUBLISHABLE_KEY ?? data.SUPABASE_ANON_KEY;
  const secretKey = data.SUPABASE_SECRET_KEY ?? data.SUPABASE_SERVICE_ROLE_KEY;

  if (!publishableKey) {
    throw new Error(
      'Invalid environment configuration:\n  - SUPABASE_PUBLISHABLE_KEY: Required (or legacy SUPABASE_ANON_KEY)',
    );
  }
  if (!secretKey) {
    throw new Error(
      'Invalid environment configuration:\n  - SUPABASE_SECRET_KEY: Required (or legacy SUPABASE_SERVICE_ROLE_KEY)',
    );
  }

  const { SUPABASE_ANON_KEY: _anon, SUPABASE_SERVICE_ROLE_KEY: _service, ...rest } = data;

  return {
    ...rest,
    SUPABASE_PUBLISHABLE_KEY: publishableKey,
    SUPABASE_SECRET_KEY: secretKey,
  };
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined> = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}
