import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { BearerAuthAdapter } from './middleware/auth.js';
import { createMemoryDb, makeTestEnv, seedQuest, seedUser } from './test/memory-db.js';

const user1 = '11111111-1111-1111-1111-111111111111';
const user2 = '22222222-2222-2222-2222-222222222222';
const questId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

function createTestApp(feeXrp = 0) {
  const env = { ...makeTestEnv(), FACTION_CREATION_FEE_XRP: feeXrp };
  const db = createMemoryDb({
    users: [seedUser(user1, 0, 1), seedUser(user2, 0, 1)],
    quests: [seedQuest(questId, 100, 1)],
  });
  return createApp({ env, db, auth: new BearerAuthAdapter() });
}

describe('api routes', () => {
  it('GET /health returns ok', async () => {
    const app = createTestApp();
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('GET /profile/me requires auth', async () => {
    const app = createTestApp();
    const res = await app.request('/profile/me');
    expect(res.status).toBe(401);
  });

  it('GET /profile/me returns profile for bearer user', async () => {
    const app = createTestApp();
    const res = await app.request('/profile/me', {
      headers: { Authorization: `Bearer ${user1}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBe(user1);
    expect(body.xp).toBe(0);
  });

  it('POST /auth/link-wallet links wallet', async () => {
    const app = createTestApp();
    const res = await app.request('/auth/link-wallet', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address: 'rTestWallet123' }),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    const profile = await app.request('/profile/me', {
      headers: { Authorization: `Bearer ${user1}` },
    });
    expect((await profile.json()).walletAddress).toBe('rTestWallet123');
  });

  it('POST /auth/link-wallet returns 409 on duplicate wallet', async () => {
    const app = createTestApp();
    await app.request('/auth/link-wallet', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address: 'rDupWallet' }),
    });

    const res = await app.request('/auth/link-wallet', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user2}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address: 'rDupWallet' }),
    });
    expect(res.status).toBe(409);
  });

  it('POST /quests/:id/complete awards XP and is idempotent', async () => {
    const app = createTestApp();
    const first = await app.request(`/quests/${questId}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1}` },
    });
    expect(first.status).toBe(200);
    const firstBody = await first.json();
    expect(firstBody.ok).toBe(true);
    expect(firstBody.xp).toBe(100);
    expect(firstBody.xpAwarded).toBe(100);

    const second = await app.request(`/quests/${questId}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1}` },
    });
    expect(second.status).toBe(200);
    const secondBody = await second.json();
    expect(secondBody.alreadyDone).toBe(true);
    expect(secondBody.xp).toBe(100);
  });

  it('GET /leaderboard/global reflects quest XP', async () => {
    const app = createTestApp();
    await app.request(`/quests/${questId}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1}` },
    });

    const res = await app.request('/leaderboard/global');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.entries[0].userId).toBe(user1);
    expect(body.entries[0].score).toBe(100);
    expect(body.entries[0].rank).toBe(1);
  });

  it('POST /factions creates faction with leader role when fee is free', async () => {
    const app = createTestApp(0);
    const res = await app.request('/factions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Wave Riders', description: 'Test faction' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.role).toBe('leader');
    expect(body.faction.name).toBe('Wave Riders');
  });

  it('POST /factions/:id/join lets second user join', async () => {
    const app = createTestApp(0);
    const created = await app.request('/factions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Pixel Crew' }),
    });
    const { faction } = await created.json();

    const join = await app.request(`/factions/${faction.id}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user2}` },
    });
    expect(join.status).toBe(200);
    expect((await join.json()).role).toBe('member');
  });

  it('POST /factions requires paymentTxHash when fee > 0', async () => {
    const app = createTestApp(0.1);
    const res = await app.request('/factions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Paid Faction' }),
    });
    expect(res.status).toBe(402);
  });

  it('leader can assign officer role', async () => {
    const app = createTestApp(0);
    const created = await app.request('/factions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Role Test' }),
    });
    const { faction } = await created.json();

    await app.request(`/factions/${faction.id}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user2}` },
    });

    const res = await app.request(`/factions/${faction.id}/members/${user2}/role`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'officer' }),
    });
    expect(res.status).toBe(200);
    expect((await res.json()).role).toBe('officer');
  });
});
