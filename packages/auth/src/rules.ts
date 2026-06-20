export interface WalletLink {
  userId: string;
  walletAddress: string;
}

export interface DiscordLink {
  userId: string;
  discordId: string;
}

export type LinkConflict =
  | { type: 'wallet-already-linked'; walletAddress: string; existingUserId: string }
  | { type: 'discord-already-linked'; discordId: string; existingUserId: string }
  | { type: 'user-already-has-wallet'; userId: string; existingWallet: string };

export function validateWalletLink(
  input: WalletLink,
  existing: { walletToUser: Map<string, string>; userToWallet: Map<string, string> },
): LinkConflict | null {
  const existingUser = existing.walletToUser.get(input.walletAddress);
  if (existingUser && existingUser !== input.userId) {
    return { type: 'wallet-already-linked', walletAddress: input.walletAddress, existingUserId: existingUser };
  }
  const existingWallet = existing.userToWallet.get(input.userId);
  if (existingWallet && existingWallet !== input.walletAddress) {
    return { type: 'user-already-has-wallet', userId: input.userId, existingWallet };
  }
  return null;
}

export function validateDiscordLink(
  input: DiscordLink,
  existing: { discordToUser: Map<string, string>; walletToDiscord: Map<string, string> },
  walletAddress?: string,
): LinkConflict | null {
  const existingUser = existing.discordToUser.get(input.discordId);
  if (existingUser && existingUser !== input.userId) {
    return { type: 'discord-already-linked', discordId: input.discordId, existingUserId: existingUser };
  }
  if (walletAddress) {
    const linkedDiscord = existing.walletToDiscord.get(walletAddress);
    if (linkedDiscord && linkedDiscord !== input.discordId) {
      return { type: 'discord-already-linked', discordId: linkedDiscord, existingUserId: input.userId };
    }
  }
  return null;
}
