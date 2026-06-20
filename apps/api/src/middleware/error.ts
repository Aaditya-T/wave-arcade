import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export async function requestLogger(c: Context, next: Next) {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`[api] ${c.req.method} ${c.req.path} ${c.res.status} ${ms}ms`);
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/** Simple in-memory rate limit stub (per IP, 100 req/min). */
export async function rateLimitStub(c: Context, next: Next) {
  const key = c.req.header('x-forwarded-for') ?? 'local';
  const now = Date.now();
  const windowMs = 60_000;
  const limit = 100;
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
  } else if (entry.count >= limit) {
    throw new HTTPException(429, { message: 'Too many requests' });
  } else {
    entry.count += 1;
  }

  await next();
}

export function apiError(code: string, message: string, status: ContentfulStatusCode = 400) {
  return new HTTPException(status, {
    message,
    res: new Response(JSON.stringify({ error: { code, message } }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  });
}

export async function errorHandler(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    const body =
      err.res ??
      new Response(JSON.stringify({ error: { code: 'http_error', message: err.message } }), {
        status: err.status,
        headers: { 'Content-Type': 'application/json' },
      });
    return body;
  }

  console.error('[api] unhandled error', err);
  return c.json({ error: { code: 'internal_error', message: 'Internal server error' } }, 500);
}
