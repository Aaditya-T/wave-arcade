import { describe, expect, it } from 'vitest';
import { validateDiscordLink, validateWalletLink } from './rules.js';

describe('wallet link rules', () => {
  it('allows new wallet link', () => {
    const conflict = validateWalletLink(
      { userId: 'u1', walletAddress: 'rWallet1' },
      { walletToUser: new Map(), userToWallet: new Map() },
    );
    expect(conflict).toBeNull();
  });

  it('rejects wallet already linked to another user', () => {
    const conflict = validateWalletLink(
      { userId: 'u2', walletAddress: 'rWallet1' },
      {
        walletToUser: new Map([['rWallet1', 'u1']]),
        userToWallet: new Map([['u1', 'rWallet1']]),
      },
    );
    expect(conflict?.type).toBe('wallet-already-linked');
  });

  it('rejects user with existing wallet', () => {
    const conflict = validateWalletLink(
      { userId: 'u1', walletAddress: 'rWallet2' },
      {
        walletToUser: new Map([['rWallet1', 'u1']]),
        userToWallet: new Map([['u1', 'rWallet1']]),
      },
    );
    expect(conflict?.type).toBe('user-already-has-wallet');
  });
});

describe('discord link rules', () => {
  it('rejects discord already linked to another user', () => {
    const conflict = validateDiscordLink(
      { userId: 'u2', discordId: 'd1' },
      { discordToUser: new Map([['d1', 'u1']]), walletToDiscord: new Map() },
    );
    expect(conflict?.type).toBe('discord-already-linked');
  });

  it('rejects one discord per wallet conflict', () => {
    const conflict = validateDiscordLink(
      { userId: 'u1', discordId: 'd2' },
      {
        discordToUser: new Map(),
        walletToDiscord: new Map([['rWallet1', 'd1']]),
      },
      'rWallet1',
    );
    expect(conflict?.type).toBe('discord-already-linked');
  });
});
