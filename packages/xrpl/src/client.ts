import { Client } from 'xrpl';
import type { Env } from '@wave/config';

const DEFAULT_RPC: Record<Env['XRPL_NETWORK'], string> = {
  mainnet: 'wss://xrplcluster.com',
  testnet: 'wss://s.altnet.rippletest.net:51233',
  devnet: 'wss://s.devnet.rippletest.net:51233',
};

export function getRpcUrl(network: Env['XRPL_NETWORK'], override?: string): string {
  return override ?? DEFAULT_RPC[network];
}

export async function connectXrpl(network: Env['XRPL_NETWORK'], rpcUrl?: string): Promise<Client> {
  const client = new Client(getRpcUrl(network, rpcUrl));
  await client.connect();
  return client;
}

export async function disconnectXrpl(client: Client): Promise<void> {
  if (client.isConnected()) {
    await client.disconnect();
  }
}
