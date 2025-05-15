// 型定義がないため、必要に応じて src/types/japanese-date.d.ts を作成してください
import { getDate } from 'japanese-date';
import { callOpenAIChatWithSystemPrompt } from '../llm/openaiClient.js';
import fs from 'fs';
import path from 'path';

/**
 * 日本語の自然言語日付をISO8601文字列に変換する（japanese-date利用）
 * @param text 例: "明日", "来週月曜", "4/10 14時"
 * @returns ISO8601文字列（例: "2024-04-10T14:00:00+09:00"）
 */
export function parseJapaneseDate(text: string): string | null {
  const dates = getDate(text);
  if (dates && dates.length > 0) {
    return dates[0].toISOString();
  }
  return null;
}

/**
 * 日本語テキストから日付範囲・時間帯を抽出（シンプルな仮実装）
 * @param text 例: "明日の午後"
 * @returns { startDate: Date, endDate: Date, timeRange?: string }
 */
export function parseJapaneseDateRange(text: string): { startDate: Date, endDate: Date, timeRange?: string } {
  // "明日"や"来週月曜"などをパース
  const base = getDate(text);
  if (base && base.length > 0) {
    const startDate = new Date(base[0]);
    let endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);
    // 午前/午後などのキーワードでtimeRangeを判定
    let timeRange: string | undefined = undefined;
    if (text.includes('午後')) timeRange = 'afternoon';
    if (text.includes('午前')) timeRange = 'morning';
    return { startDate, endDate, timeRange };
  }
  // パースできなければ今日
  const now = new Date();
  return { startDate: now, endDate: now, timeRange: undefined };
}

/**
 * 日本語テキストから希望時間幅（分）を抽出（シンプルな仮実装）
 * @param text 例: "1時間", "30分"
 * @returns 分数
 */
export function parseDesiredDuration(text: string): number | null {
  const hourMatch = text.match(/(\d+)時間/);
  const minMatch = text.match(/(\d+)分/);
  let minutes = 0;
  if (hourMatch) minutes += parseInt(hourMatch[1], 10) * 60;
  if (minMatch) minutes += parseInt(minMatch[1], 10);
  return minutes > 0 ? minutes : null;
}

/**
 * 予定リストから空き時間候補を抽出（シンプルな仮実装）
 * @param events 予定リスト
 * @param opts { startDate, endDate, timeRange, durationMinutes }
 * @returns 空き時間スロット配列
 */
export function findFreeSlots(
  events: { start: string, end: string }[],
  opts: { startDate: Date, endDate: Date, timeRange?: string, durationMinutes: number }
): { start: Date, end: Date }[] {
  // 指定日の00:00～23:59をデフォルト範囲とする
  let rangeStart = new Date(opts.startDate);
  let rangeEnd = new Date(opts.endDate);
  if (opts.timeRange === 'afternoon') {
    rangeStart.setHours(13, 0, 0, 0);
  }
  if (opts.timeRange === 'morning') {
    rangeEnd.setHours(12, 0, 0, 0);
  }
  // 予定を開始時刻順にソート
  const sorted = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const slots: { start: Date, end: Date }[] = [];
  let cursor = new Date(rangeStart);
  for (const ev of sorted) {
    const evStart = new Date(ev.start);
    const evEnd = new Date(ev.end);
    if (evStart > cursor && (evStart.getTime() - cursor.getTime()) / 60000 >= opts.durationMinutes) {
      slots.push({ start: new Date(cursor), end: new Date(evStart) });
    }
    if (evEnd > cursor) cursor = new Date(evEnd);
  }
  // 最後の予定～範囲終了まで
  if (rangeEnd > cursor && (rangeEnd.getTime() - cursor.getTime()) / 60000 >= opts.durationMinutes) {
    slots.push({ start: new Date(cursor), end: new Date(rangeEnd) });
  }
  return slots;
}

/**
 * 空き時間候補を日本語でフォーマット
 */
export function formatFreeTimeList(date: Date, slots: { start: Date, end: Date }[], durationMinutes: number): string {
  if (!slots.length) return '空き時間が見つかりませんでした。';
  const lines = slots.map(slot => {
    const s = slot.start;
    const e = slot.end;
    return `${s.getHours().toString().padStart(2, '0')}:${s.getMinutes().toString().padStart(2, '0')}～${e.getHours().toString().padStart(2, '0')}:${e.getMinutes().toString().padStart(2, '0')}`;
  });
  return `${date.getMonth() + 1}月${date.getDate()}日の${durationMinutes}分以上の空き時間候補:\n${lines.join('\n')}`;
}

export async function parseJapaneseDateHybrid(text: string, now: Date): Promise<string | null> {
  const parsed = parseJapaneseDate(text);
  if (parsed) return parsed;
  const promptPath = path.join(__dirname, '../../config/system_prompts/get_schedule.md');
  const systemPrompt = fs.readFileSync(promptPath, 'utf-8');
  const userPrompt = `ユーザー: ${text}\n現在日時: ${now.toISOString()}\n出力:`;
  try {
    const result = await callOpenAIChatWithSystemPrompt(userPrompt, systemPrompt);
    const match = result.match(/"start":\s*"([^"]+)"/);
    if (match) return match[1];
  } catch (e) {}
  return null;
}

export async function parseJapaneseDateRangeHybrid(text: string, now: Date): Promise<{ startDate: Date, endDate: Date, timeRange?: string, durationMinutes?: number } | null> {
  const base = getDate(text);
  if (base && base.length > 0) {
    const startDate = new Date(base[0]);
    let endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);
    let timeRange: string | undefined = undefined;
    if (text.includes('午後')) timeRange = 'afternoon';
    if (text.includes('午前')) timeRange = 'morning';
    return { startDate, endDate, timeRange };
  }
  // LLM fallback
  const promptPath = path.join(__dirname, '../../config/system_prompts/find_free_time.md');
  const systemPrompt = fs.readFileSync(promptPath, 'utf-8');
  const userPrompt = `ユーザー: ${text}\n現在日時: ${now.toISOString()}\n出力:`;
  try {
    const result = await callOpenAIChatWithSystemPrompt(userPrompt, systemPrompt);
    const startMatch = result.match(/"start":\s*"([^"]+)"/);
    const endMatch = result.match(/"end":\s*"([^"]+)"/);
    const durationMatch = result.match(/"duration_minutes":\s*(\d+)/);
    if (startMatch && endMatch) {
      const startDate = new Date(startMatch[1]);
      const endDate = new Date(endMatch[1]);
      let durationMinutes = durationMatch ? parseInt(durationMatch[1], 10) : undefined;
      let timeRange: string | undefined = undefined;
      if (text.includes('午後')) timeRange = 'afternoon';
      if (text.includes('午前')) timeRange = 'morning';
      return { startDate, endDate, timeRange, durationMinutes };
    }
  } catch (e) {}
  return null;
} 