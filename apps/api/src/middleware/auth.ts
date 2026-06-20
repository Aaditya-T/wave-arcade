import type { AuthAdapter, AuthContext, Session } from '@wave/auth';

/** Dev auth: Bearer token is the userId. Replace with Supabase JWT in M4. */
export class BearerAuthAdapter implements AuthAdapter {
  async getSession(ctx: AuthContext): Promise<Session | null> {
    const token = ctx.token ?? ctx.headers?.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return null;
    return {
      userId: token,
      source: ctx.source,
    };
  }

  async signOut(): Promise<void> {
    // no-op for bearer dev auth
  }
}
