export type QuestStatus = 'locked' | 'available' | 'complete';

export interface Quest {
  id: string;
  requiredLevel?: number;
  prerequisites?: string[];
}

export interface QuestProgress {
  questId: string;
  completed: boolean;
}

export interface QuestContext {
  level: number;
  progress: QuestProgress[];
}

export function getQuestStatus(quest: Quest, ctx: QuestContext): QuestStatus {
  if (ctx.progress.some((p) => p.questId === quest.id && p.completed)) {
    return 'complete';
  }
  if (quest.requiredLevel !== undefined && ctx.level < quest.requiredLevel) {
    return 'locked';
  }
  if (quest.prerequisites?.some((id) => !ctx.progress.some((p) => p.questId === id && p.completed))) {
    return 'locked';
  }
  return 'available';
}

export function canCompleteQuest(quest: Quest, ctx: QuestContext): boolean {
  return getQuestStatus(quest, ctx) === 'available';
}

export function completeQuest(
  quest: Quest,
  ctx: QuestContext,
): { ok: true; progress: QuestProgress[] } | { ok: false; reason: string } {
  const status = getQuestStatus(quest, ctx);
  if (status === 'complete') return { ok: false, reason: 'already-done' };
  if (status === 'locked') return { ok: false, reason: 'incomplete' };
  return {
    ok: true,
    progress: [...ctx.progress, { questId: quest.id, completed: true }],
  };
}
