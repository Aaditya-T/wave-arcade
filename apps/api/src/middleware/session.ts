import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { AppVariables } from '../deps.js';

export async function authMiddleware(c: Context<{ Variables: AppVariables }>, next: Next) {
  const deps = c.get('deps');
  const authorization = c.req.header('authorization');
  const session = await deps.auth.getSession({
    source: 'web',
    token: authorization?.replace(/^Bearer\s+/i, ''),
    headers: { authorization: authorization ?? '' },
  });

  if (!session) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  c.set('session', session);
  await next();
}

export async function optionalAuthMiddleware(
  c: Context<{ Variables: Partial<AppVariables> }>,
  next: Next,
) {
  const deps = c.get('deps');
  if (!deps) {
    await next();
    return;
  }
  const authorization = c.req.header('authorization');
  const session = await deps.auth.getSession({
    source: 'web',
    token: authorization?.replace(/^Bearer\s+/i, ''),
    headers: { authorization: authorization ?? '' },
  });
  if (session) c.set('session', session);
  await next();
}
