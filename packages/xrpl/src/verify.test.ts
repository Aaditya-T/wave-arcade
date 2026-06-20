import { describe, expect, it } from 'vitest';
import { verifyPayment, type PaymentTx } from './verify.js';

const baseTx: PaymentTx = {
  hash: 'ABC123',
  TransactionType: 'Payment',
  Amount: '1000000',
  Destination: 'rDest',
  SourceTag: 42,
  meta: { TransactionResult: 'tesSUCCESS' },
};

describe('verifyPayment', () => {
  it('returns true when all fields match', () => {
    expect(
      verifyPayment(baseTx, {
        hash: 'ABC123',
        amount: '1000000',
        destination: 'rDest',
        sourceTag: 42,
      }),
    ).toBe(true);
  });

  it('returns false on hash mismatch', () => {
    expect(
      verifyPayment(baseTx, {
        hash: 'WRONG',
        amount: '1000000',
        destination: 'rDest',
      }),
    ).toBe(false);
  });

  it('returns false on amount mismatch', () => {
    expect(
      verifyPayment(baseTx, {
        hash: 'ABC123',
        amount: '999',
        destination: 'rDest',
      }),
    ).toBe(false);
  });

  it('returns false on failed transaction result', () => {
    expect(
      verifyPayment({ ...baseTx, meta: { TransactionResult: 'tecPATH_DRY' } }, {
        hash: 'ABC123',
        amount: '1000000',
        destination: 'rDest',
      }),
    ).toBe(false);
  });
});
