import type { AppContext } from '../lib/response.js';
import { requireParam, toProfileResponse } from '../lib/response.js';
import { apiError } from '../middleware/error.js';

export async function getProfileByIdHandler(c: AppContext) {
  const deps = c.get('deps');
  const userId = requireParam(c, 'id');

  const profile = await deps.db.getProfile(userId);
  if (!profile) throw apiError('not_found', 'Profile not found', 404);

  const wallet = await deps.db.getWalletByUser(userId);
  return c.json(toProfileResponse(profile, wallet?.address ?? null));
}

export async function getMyProfileHandler(c: AppContext) {
  const deps = c.get('deps');
  const session = c.get('session');

  const profile = await deps.db.getProfile(session.userId);
  if (!profile) throw apiError('not_found', 'Profile not found', 404);

  const wallet = await deps.db.getWalletByUser(session.userId);
  return c.json(toProfileResponse(profile, wallet?.address ?? null));
}
