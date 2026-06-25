import {
  addXpWithLevel,
  canCompleteQuest,
  completeQuest,
  type Quest,
  type QuestContext,
} from '@wave/game-engine';
import type { AppContext } from '../lib/response.js';
import { requireParam } from '../lib/response.js';
import { apiError } from '../middleware/error.js';

function toEngineQuest(quest: {
  id: string;
  required_level: number;
}): Quest {
  return {
    id: quest.id,
    requiredLevel: quest.required_level,
  };
}

export async function completeQuestHandler(c: AppContext) {
  const deps = c.get('deps');
  const session = c.get('session');
  const questId = requireParam(c, 'id');

  const quest = await deps.db.getQuestById(questId);
  if (!quest || !quest.is_active) {
    throw apiError('not_found', 'Quest not found', 404);
  }

  const profile = await deps.db.getProfile(session.userId);
  if (!profile) throw apiError('not_found', 'Profile not found', 404);

  const completions = await deps.db.getQuestCompletions(session.userId);
  const ctx: QuestContext = {
    level: profile.level,
    progress: completions.map((q) => ({ questId: q.quest_id, completed: true })),
  };

  const engineQuest = toEngineQuest(quest);

  if (!canCompleteQuest(engineQuest, ctx)) {
    const alreadyDone = completions.some((q) => q.quest_id === questId);
    if (alreadyDone) {
      return c.json({ ok: true, alreadyDone: true, xp: profile.xp, level: profile.level });
    }
    throw apiError('quest_incomplete', 'Quest requirements not met', 400);
  }

  const result = completeQuest(engineQuest, ctx);
  if ('reason' in result) {
    if (result.reason === 'already-done') {
      return c.json({ ok: true, alreadyDone: true, xp: profile.xp, level: profile.level });
    }
    throw apiError('quest_incomplete', result.reason, 400);
  }

  const xpUpdate = addXpWithLevel(profile.xp, quest.xp_reward);
  await deps.db.recordQuestCompletion({
    userId: session.userId,
    questId,
    xp: xpUpdate.xp,
    level: xpUpdate.level,
  });

  return c.json({
    ok: true,
    alreadyDone: false,
    xp: xpUpdate.xp,
    level: xpUpdate.level,
    leveledUp: xpUpdate.leveledUp,
    xpAwarded: quest.xp_reward,
  });
}
