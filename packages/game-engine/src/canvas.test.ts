import { describe, expect, it } from 'vitest';
import { validateCanvasWrite } from './canvas.js';

const base = {
  x: 5,
  y: 5,
  color: '#00f0ff',
  factionId: 'cyan',
  userId: 'u1',
  now: 10_000,
  canvasWidth: 100,
  canvasHeight: 100,
  allowedColors: ['#00f0ff', '#ff00aa'],
};

describe('canvas', () => {
  it('accepts valid write', () => {
    const result = validateCanvasWrite(base);
    expect(result.ok).toBe(true);
  });

  it('rejects out-of-bounds', () => {
    const result = validateCanvasWrite({ ...base, x: -1 });
    expect(result).toEqual({ ok: false, reason: 'out-of-bounds' });
  });

  it('rejects invalid color', () => {
    const result = validateCanvasWrite({ ...base, color: '#ffffff' });
    expect(result).toEqual({ ok: false, reason: 'invalid-color' });
  });

  it('rejects cooldown violation', () => {
    const result = validateCanvasWrite({ ...base, lastPaintAt: 9_980, now: 10_000 });
    expect(result).toEqual({ ok: false, reason: 'cooldown' });
  });
});
