import { validateDiscordLink, validateWalletLink } from '@wave/auth';
import type { AppContext } from '../lib/response.js';
import { apiError } from '../middleware/error.js';

export async function linkWalletHandler(c: AppContext) {
  const deps = c.get('deps');
  const session = c.get('session');
  const body = await c.req.json<{ address?: string; discordId?: string }>();

  if (!body.address) {
    throw apiError('invalid_request', 'address is required', 400);
  }

  const wallets = await deps.db.getAllWallets();
  const walletToUser = new Map(wallets.map((w) => [w.address, w.user_id]));
  const userToWallet = new Map<string, string>();
  for (const w of wallets) {
    if (!userToWallet.has(w.user_id)) userToWallet.set(w.user_id, w.address);
  }

  const walletConflict = validateWalletLink(
    { userId: session.userId, walletAddress: body.address },
    { walletToUser, userToWallet },
  );

  if (walletConflict) {
    const code =
      walletConflict.type === 'wallet-already-linked'
        ? 'wallet_already_linked'
        : 'user_already_has_wallet';
    throw apiError(code, walletConflict.type, 409);
  }

  if (body.discordId) {
    const discordLinks = await deps.db.getAllLinkedDiscord();
    const discordToUser = new Map(discordLinks.map((d) => [d.provider_id, d.user_id]));
    const walletToDiscord = new Map<string, string>();
    for (const d of discordLinks) {
      const wallet = wallets.find((w) => w.user_id === d.user_id);
      if (wallet) walletToDiscord.set(wallet.address, d.provider_id);
    }

    const discordConflict = validateDiscordLink(
      { userId: session.userId, discordId: body.discordId },
      { discordToUser, walletToDiscord },
      body.address,
    );

    if (discordConflict) {
      throw apiError('discord_already_linked', discordConflict.type, 409);
    }
  }

  await deps.db.insertWallet(session.userId, body.address);
  return c.json({ ok: true });
}
