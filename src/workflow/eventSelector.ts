import { CalendarEvent } from '../calendar/googleCalendarClient.js';
import { parseJapaneseDateHybrid } from '../utils/dateUtils.js';
import { callOpenAIChatWithSystemPrompt } from '../llm/openaiClient.js';

export type EventCriteria = {
  date?: Date;           // 日付・時間帯
  title?: string;        // タイトル
  description?: string;  // 説明
};

/**
 * 指定したcriteriaに最も合致する予定を返す（現状は雛形）
 */
export function findTargetEvent(
  events: CalendarEvent[],
  criteria: EventCriteria
): CalendarEvent | null {
  // TODO: 日付・タイトル・説明などでフィルタし、最も合致する予定を返す
  return null;
}

/**
 * ユーザー発話からEventCriteriaを抽出する（雛形）
 */
export async function extractEventCriteria(
  message: string
): Promise<EventCriteria> {
  // 日付抽出のみ（タイトル・説明抽出は未実装）
  const dateStr = await parseJapaneseDateHybrid(message, new Date());
  const date = dateStr ? new Date(dateStr) : undefined;
  return { date };
}

/**
 * ユーザー発話から変更後の内容（新しい日時・タイトル・説明など）を抽出する（未実装）
 * @returns CalendarEventの部分オブジェクト
 */
export async function extractUpdateFields(
  message: string
): Promise<Partial<CalendarEvent>> {
  // 変更内容抽出は未実装
  return {};
}

/**
 * LLMで予定特定ルート（list or all）を判定する
 * @param message ユーザー発話
 * @param context 会話状態
 * @returns 'list' | 'all'
 */
export async function llmDecideRoute(message: string, context: any): Promise<'list' | 'all'> {
  const systemPrompt = `あなたはカレンダーAIの予定特定ルート選択アシスタントです。\n\n- 直前にBotが予定リストを提示しており、ユーザーがそのリスト内の番号やタイトルで指定している場合は 'list' を返してください。\n- それ以外（タイトルや日付が明示されている場合など）は 'all' を返してください。\n\n必ず 'list' か 'all' のどちらかだけを出力してください。`;
  const userPrompt = `会話履歴: ${JSON.stringify(context)}\nユーザー発話: ${message}\n出力:`;
  const result = await callOpenAIChatWithSystemPrompt(userPrompt, systemPrompt);
  if (result.includes('list')) return 'list';
  return 'all';
}

/**
 * 全予定からタイトル・日付で候補を抽出する
 * @param events 予定リスト
 * @param title タイトルキーワード
 * @param date 日付
 */
export function filterEventsByTitleAndDate(
  events: CalendarEvent[],
  title: string,
  date: Date
): CalendarEvent[] {
  function isSameDay(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }
  return events.filter(e => {
    const eventDate = new Date(e.start);
    return e.summary.includes(title) && isSameDay(eventDate, date);
  });
}

/**
 * LLMでadd/modify/delete用の予定情報を抽出する
 * intent: 'add' | 'modify' | 'delete' | 'remind'
 * @returns 必要な情報を含むオブジェクト or null
 */
export async function extractEventInfoWithLLM(message: string, intent: 'add' | 'modify' | 'delete' | 'remind'): Promise<any> {
  let systemPrompt = '';
  if (intent === 'add' || intent === 'modify') {
    systemPrompt = `
あなたはユーザーの発話からカレンダー予定の情報を抽出するAIです。
発話から「タイトル（summary）」「開始日時（start）」「終了日時（end）」をISO8601形式でJSONで出力してください。
抽出できない場合はnullを返してください。
例:
ユーザー: 明日の16時から20時に「俺のヨガ」の予定を追加して
出力: {"summary": "俺のヨガ", "start": "2025-05-18T16:00:00+09:00", "end": "2025-05-18T20:00:00+09:00"}
`;
  } else if (intent === 'delete') {
    systemPrompt = `
あなたはユーザーの発話から削除対象のカレンダー予定情報を抽出するAIです。
発話から「タイトル（summary）」と「日付（date）」をJSONで出力してください。
抽出できない場合はnullを返してください。
例:
ユーザー: 5月20日のAさんとの会議を削除して
出力: {"summary": "Aさんとの会議", "date": "2025-05-20"}
`;
  } else if (intent === 'remind') {
    systemPrompt = `
あなたはユーザーの発話からリマインド設定情報を抽出するAIです。
発話から「タイトル（summary）」と「リマインド時刻（remindAt）」をISO8601形式でJSONで出力してください。
抽出できない場合はnullを返してください。
例:
ユーザー: 明日の10時に「打ち合わせ」をリマインドして
出力: {"summary": "打ち合わせ", "remindAt": "2025-05-18T10:00:00+09:00"}
`;
  }
  const userPrompt = `ユーザー: ${message}\n出力:`;
  const result = await callOpenAIChatWithSystemPrompt(userPrompt, systemPrompt);
  try {
    const match = result.match(/\{.*\}/s);
    if (match && match[0]) {
      const json = JSON.parse(match[0]);
      return json;
    }
    return null;
  } catch {
    return null;
  }
} 