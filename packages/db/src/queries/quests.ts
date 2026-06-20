import type { WaveSupabaseClient } from '../client.js';
import type { Quest, QuestCompletion } from '../types.js';

export async function getQuestById(
  client: WaveSupabaseClient,
  questId: string,
): Promise<Quest | null> {
  const { data, error } = await client.from('quests').select('*').eq('id', questId).maybeSingle();

  if (error) throw error;
  return data as Quest | null;
}

export async function getQuestBySlug(
  client: WaveSupabaseClient,
  slug: string,
): Promise<Quest | null> {
  const { data, error } = await client.from('quests').select('*').eq('slug', slug).maybeSingle();

  if (error) throw error;
  return data as Quest | null;
}

export async function listActiveQuests(client: WaveSupabaseClient): Promise<Quest[]> {
  const { data, error } = await client
    .from('quests')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Quest[];
}

export async function getQuestCompletions(
  client: WaveSupabaseClient,
  userId: string,
): Promise<QuestCompletion[]> {
  const { data, error } = await client
    .from('quest_completions')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return (data ?? []) as QuestCompletion[];
}

export async function hasQuestCompletion(
  client: WaveSupabaseClient,
  userId: string,
  questId: string,
): Promise<boolean> {
  const { data, error } = await client
    .from('quest_completions')
    .select('id')
    .eq('user_id', userId)
    .eq('quest_id', questId)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

export interface RecordQuestCompletionInput {
  userId: string;
  questId: string;
  xp: number;
  level: number;
}

export async function recordQuestCompletion(
  client: WaveSupabaseClient,
  input: RecordQuestCompletionInput,
): Promise<QuestCompletion> {
  const { data: completion, error: completionError } = await client
    .from('quest_completions')
    .insert({
      user_id: input.userId,
      quest_id: input.questId,
    })
    .select('*')
    .single();

  if (completionError) throw completionError;

  const { error: profileError } = await client
    .from('profiles')
    .update({ xp: input.xp, level: input.level })
    .eq('user_id', input.userId);

  if (profileError) throw profileError;

  return completion as QuestCompletion;
}
