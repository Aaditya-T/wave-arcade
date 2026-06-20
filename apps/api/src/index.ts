import { serve } from '@hono/node-server';
import { createSecretClient } from '@wave/db';
import { parseEnv } from '@wave/config';
import { createApp } from './app.js';
import { BearerAuthAdapter } from './middleware/auth.js';
import { createSupabaseDb } from './deps.js';

const env = parseEnv();
const client = createSecretClient(env);
const db = createSupabaseDb(client);
const auth = new BearerAuthAdapter();

const app = createApp({ env, db, auth });

const port = Number(new URL(env.API_URL).port || 4000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`[api] running at ${env.API_URL}`);
});
