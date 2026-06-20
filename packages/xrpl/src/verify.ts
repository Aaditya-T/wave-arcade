export interface PaymentTx {
  hash: string;
  TransactionType: string;
  Amount: string | { value: string; currency: string; issuer: string };
  Destination: string;
  SourceTag?: number;
  meta?: {
    TransactionResult?: string;
  };
}

export interface PaymentExpectation {
  hash: string;
  amount: string;
  destination: string;
  sourceTag?: number;
}

export function normalizeAmount(amount: PaymentTx['Amount']): string {
  if (typeof amount === 'string') return amount;
  return amount.value;
}

export function verifyPayment(tx: PaymentTx, expected: PaymentExpectation): boolean {
  if (tx.hash !== expected.hash) return false;
  if (tx.TransactionType !== 'Payment') return false;
  if (tx.Destination !== expected.destination) return false;
  if (normalizeAmount(tx.Amount) !== expected.amount) return false;
  if (expected.sourceTag !== undefined && tx.SourceTag !== expected.sourceTag) return false;
  if (tx.meta?.TransactionResult && tx.meta.TransactionResult !== 'tesSUCCESS') return false;
  return true;
}
