import type { Context } from 'hono';
import type { AppVariables } from '../deps.js';
import { apiError } from '../middleware/error.js';

export type AppContext = Context<{ Variables: AppVariables }>;

export function requireParam(c: AppContext, name: string): string {
  const value = c.req.param(name);
  if (!value) throw apiError('invalid_request', `Missing param: ${name}`, 400);
  return value;
}

export function toProfileResponse(
  profile: {
    user_id: string;
    display_name: string | null;
    xp: number;
    level: number;
    faction_id: string | null;
  },
  walletAddress: string | null,
) {
  return {
    userId: profile.user_id,
    displayName: profile.display_name,
    xp: profile.xp,
    level: profile.level,
    walletAddress,
    factionId: profile.faction_id,
  };
}
