import type { AppContext } from '../lib/response.js';

export function healthRoutes() {
  return {
    getHealth: (c: AppContext) => c.json({ status: 'ok' }),
  };
}
