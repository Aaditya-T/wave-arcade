import { describe, expect, it } from 'vitest';
import { canCompleteQuest, completeQuest, getQuestStatus } from './quests.js';

const baseCtx = { level: 5, progress: [] };

describe('quests', () => {
  it('returns available for eligible quest', () => {
    const quest = { id: 'connect-wallet' };
    expect(getQuestStatus(quest, baseCtx)).toBe('available');
    expect(canCompleteQuest(quest, baseCtx)).toBe(true);
  });

  it('returns locked when level too low', () => {
    const quest = { id: 'boss', requiredLevel: 10 };
    expect(getQuestStatus(quest, baseCtx)).toBe('locked');
    const result = completeQuest(quest, baseCtx);
    expect(result).toEqual({ ok: false, reason: 'incomplete' });
  });

  it('returns complete when already done', () => {
    const quest = { id: 'tip' };
    const ctx = { ...baseCtx, progress: [{ questId: 'tip', completed: true }] };
    expect(getQuestStatus(quest, ctx)).toBe('complete');
    expect(completeQuest(quest, ctx)).toEqual({ ok: false, reason: 'already-done' });
  });

  it('completes available quest', () => {
    const quest = { id: 'paint', prerequisites: ['connect-wallet'] };
    const ctx = {
      ...baseCtx,
      progress: [{ questId: 'connect-wallet', completed: true }],
    };
    const result = completeQuest(quest, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.progress).toHaveLength(2);
    }
  });
});
