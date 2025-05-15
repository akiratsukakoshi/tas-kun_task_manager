export type IntentType = 'add_schedule' | 'get_schedule' | 'delete_schedule' | 'modify_schedule' | 'remind' | 'find_free_time' | 'unknown';

export interface IntentResult {
  intent: IntentType;
  reason?: string;
}

export async function classifyIntent(message: string): Promise<IntentResult> {
  // TODO: LLMやYAMLルールによる実装に差し替え
  if (message.includes('追加') || message.includes('入れて')) {
    return { intent: 'add_schedule', reason: '追加系ワードを検出' };
  }
  if (
    message.includes('空き時間') ||
    message.includes('空いてる') ||
    message.includes('候補') ||
    message.includes('会議できる') ||
    message.includes('スケジュール調整')
  ) {
    return { intent: 'find_free_time', reason: '空き時間検索ワードを検出' };
  }
  if (message.includes('予定') || message.includes('教えて')) {
    return { intent: 'get_schedule', reason: '参照系ワードを検出' };
  }
  if (message.includes('削除')) {
    return { intent: 'delete_schedule', reason: '削除ワードを検出' };
  }
  if (message.includes('変更')) {
    return { intent: 'modify_schedule', reason: '変更ワードを検出' };
  }
  if (message.includes('リマインド')) {
    return { intent: 'remind', reason: 'リマインドワードを検出' };
  }
  return { intent: 'unknown', reason: '該当ワードなし' };
} 