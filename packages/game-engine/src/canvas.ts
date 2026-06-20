import { COOLDOWN_DEFAULTS } from '@wave/config';

export interface CanvasPixel {
  x: number;
  y: number;
  color: string;
  factionId: string;
  paintedAt: number;
}

export interface CanvasWriteInput {
  x: number;
  y: number;
  color: string;
  factionId: string;
  userId: string;
  now: number;
  lastPaintAt?: number;
  canvasWidth: number;
  canvasHeight: number;
  allowedColors: string[];
}

export type CanvasWriteResult =
  | { ok: true; pixel: CanvasPixel }
  | { ok: false; reason: 'out-of-bounds' | 'invalid-color' | 'cooldown' };

export function validateCanvasWrite(input: CanvasWriteInput): CanvasWriteResult {
  const { x, y, canvasWidth, canvasHeight, allowedColors, color, lastPaintAt, now } = input;

  if (x < 0 || y < 0 || x >= canvasWidth || y >= canvasHeight) {
    return { ok: false, reason: 'out-of-bounds' };
  }
  if (!allowedColors.includes(color)) {
    return { ok: false, reason: 'invalid-color' };
  }
  if (lastPaintAt !== undefined && now - lastPaintAt < COOLDOWN_DEFAULTS.canvasPaint * 1000) {
    return { ok: false, reason: 'cooldown' };
  }

  return {
    ok: true,
    pixel: {
      x,
      y,
      color,
      factionId: input.factionId,
      paintedAt: now,
    },
  };
}
