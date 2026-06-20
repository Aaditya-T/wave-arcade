import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { AppDeps, AppVariables } from './deps.js';
import { errorHandler, rateLimitStub, requestLogger } from './middleware/error.js';
import { authMiddleware } from './middleware/session.js';
import { linkWalletHandler } from './routes/auth.js';
import {
  assignFactionRoleHandler,
  createFactionHandler,
  getFactionHandler,
  joinFactionHandler,
  leaveFactionHandler,
  listFactionsHandler,
} from './routes/factions.js';
import { getGlobalLeaderboardHandler } from './routes/leaderboard.js';
import { getMyProfileHandler, getProfileByIdHandler } from './routes/profile.js';
import { completeQuestHandler } from './routes/quests.js';

export type { AppVariables } from './deps.js';

export function createApp(deps: AppDeps) {
  const app = new Hono<{ Variables: AppVariables }>();

  app.use('*', async (c, next) => {
    c.set('deps', deps);
    await next();
  });
  app.use('*', cors({ origin: deps.env.APP_URL }));
  app.use('*', requestLogger);
  app.use('*', rateLimitStub);
  app.onError(errorHandler);

  app.get('/health', (c) => c.json({ status: 'ok' }));

  app.post('/auth/link-wallet', authMiddleware, linkWalletHandler);
  app.get('/profile/me', authMiddleware, getMyProfileHandler);
  app.get('/profile/:id', getProfileByIdHandler);
  app.post('/quests/:id/complete', authMiddleware, completeQuestHandler);
  app.get('/leaderboard/global', getGlobalLeaderboardHandler);

  app.get('/factions', listFactionsHandler);
  app.post('/factions', authMiddleware, createFactionHandler);
  app.get('/factions/:id', getFactionHandler);
  app.post('/factions/:id/join', authMiddleware, joinFactionHandler);
  app.post('/factions/:id/leave', authMiddleware, leaveFactionHandler);
  app.post('/factions/:id/members/:userId/role', authMiddleware, assignFactionRoleHandler);

  return app;
}
