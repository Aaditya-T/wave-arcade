import { describe, expect, it } from 'vitest';
import { parseEnv } from './env.js';
import {
  factionCreationFeeDrops,
  isFactionCreationFree,
  FACTION_DEFAULTS,
} from './constants.js';

const validEnv = {
  NODE_ENV: 'development',
  APP_URL: 'http://localhost:3000',
  API_URL: 'http://localhost:4000',
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
  SUPABASE_SECRET_KEY: 'sb_secret_test',
  XRPL_NETWORK: 'testnet',
} as const;

describe('parseEnv', () => {
  it('parses valid env', () => {
    const env = parseEnv({ ...validEnv });
    expect(env.APP_URL).toBe('http://localhost:3000');
    expect(env.XRPL_NETWORK).toBe('testnet');
    expect(env.FACTION_CREATION_FEE_XRP).toBe(0.1);
  });

  it('defaults FACTION_CREATION_FEE_XRP to 0.1', () => {
    const env = parseEnv({ ...validEnv });
    expect(env.FACTION_CREATION_FEE_XRP).toBe(0.1);
  });

  it('allows free faction creation', () => {
    const env = parseEnv({ ...validEnv, FACTION_CREATION_FEE_XRP: '0' });
    expect(env.FACTION_CREATION_FEE_XRP).toBe(0);
  });

  it('throws on invalid env with clear message', () => {
    expect(() =>
      parseEnv({
        ...validEnv,
        APP_URL: 'not-a-url',
      }),
    ).toThrow(/Invalid environment configuration/);
    expect(() =>
      parseEnv({
        ...validEnv,
        APP_URL: 'not-a-url',
      }),
    ).toThrow(/APP_URL/);
  });

  it('throws when required keys missing', () => {
    expect(() => parseEnv({})).toThrow(/Invalid environment configuration/);
  });

  it('accepts legacy anon and service_role keys as fallback', () => {
    const env = parseEnv({
      NODE_ENV: 'development',
      APP_URL: 'http://localhost:3000',
      API_URL: 'http://localhost:4000',
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_ANON_KEY: 'legacy-anon',
      SUPABASE_SERVICE_ROLE_KEY: 'legacy-service',
      XRPL_NETWORK: 'testnet',
    });
    expect(env.SUPABASE_PUBLISHABLE_KEY).toBe('legacy-anon');
    expect(env.SUPABASE_SECRET_KEY).toBe('legacy-service');
  });
});

describe('faction fee helpers', () => {
  it('converts XRP to drops', () => {
    expect(factionCreationFeeDrops(0.1)).toBe(100_000n);
    expect(factionCreationFeeDrops(0)).toBe(0n);
  });

  it('detects free creation', () => {
    expect(isFactionCreationFree(0)).toBe(true);
    expect(isFactionCreationFree(0.1)).toBe(false);
  });

  it('exports faction defaults', () => {
    expect(FACTION_DEFAULTS.maxNameLength).toBeGreaterThan(0);
  });
});
