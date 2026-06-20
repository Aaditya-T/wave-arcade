/** Platform surface that originated the session. */
export type SessionSource =
  | 'web'
  | 'discord-activity'
  | 'discord-bot'
  | 'telegram-bot'
  | 'xapp';

/**
 * Authenticated user context shared across web, bots, and xApp clients.
 */
export interface Session {
  userId: string;
  discordId?: string;
  telegramId?: string;
  walletAddress?: string;
  source: SessionSource;
}
