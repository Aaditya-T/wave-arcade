import type { Payment } from 'xrpl';

export interface PaymentInput {
  account: string;
  destination: string;
  amount: string;
  sourceTag?: number;
}

export function buildPayment(input: PaymentInput): Payment {
  const tx: Payment = {
    TransactionType: 'Payment',
    Account: input.account,
    Destination: input.destination,
    Amount: input.amount,
  };

  if (input.sourceTag !== undefined) {
    tx.SourceTag = input.sourceTag;
  }

  return tx;
}
