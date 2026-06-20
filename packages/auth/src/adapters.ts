import type { Session, SessionSource } from './session.js';

export interface AuthContext {
  source: SessionSource;
  headers?: Record<string, string>;
  token?: string;
}

export interface AuthAdapter {
  /** Resolve the current session from the request context, or null if unauthenticated. */
  getSession(ctx: AuthContext): Promise<Session | null>;
  /** Invalidate the current session (logout). */
  signOut(ctx: AuthContext): Promise<void>;
}

export type WebAuthAdapter = AuthAdapter;
export type DiscordActivityAuthAdapter = AuthAdapter;
export type BotAuthAdapter = AuthAdapter;
