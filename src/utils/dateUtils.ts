// 型定義がないため、必要に応じて src/types/japanese-date.d.ts を作成してください
import { getDate } from 'japanese-date';

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