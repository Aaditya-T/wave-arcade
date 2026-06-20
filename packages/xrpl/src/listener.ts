export type LedgerEventType = 'transaction' | 'ledger_closed';

export interface LedgerEvent {
  type: LedgerEventType;
  ledgerIndex: number;
  txHash?: string;
  raw: unknown;
}

export type LedgerEventHandler = (event: LedgerEvent) => void;

export interface XrplListener {
  subscribe(handler: LedgerEventHandler): void;
  unsubscribe(handler: LedgerEventHandler): void;
  start(): Promise<void>;
  stop(): Promise<void>;
}

/** Stub listener — real WebSocket impl comes in Milestone 2+. */
export class StubXrplListener implements XrplListener {
  private handlers = new Set<LedgerEventHandler>();

  subscribe(handler: LedgerEventHandler): void {
    this.handlers.add(handler);
  }

  unsubscribe(handler: LedgerEventHandler): void {
    this.handlers.delete(handler);
  }

  async start(): Promise<void> {
    // no-op stub
  }

  async stop(): Promise<void> {
    this.handlers.clear();
  }

  emit(event: LedgerEvent): void {
    for (const handler of this.handlers) {
      handler(event);
    }
  }
}
