/**
 * 日本語の自然言語日付をISO8601文字列に変換する（ダミー実装）
 * @param text 例: "明日14時", "来週金曜", "4/10 14時"
 * @returns ISO8601文字列（例: "2024-04-10T14:00:00+09:00"）
 */
export function parseJapaneseDate(text: string): string | null {
  // TODO: 本実装では chrono-node等を使う
  if (text.includes('明日')) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(14, 0, 0, 0);
    return d.toISOString();
  }
  if (text.match(/\d{1,2}\/\d{1,2}/)) {
    // 例: 4/10
    const now = new Date();
    const [_, m, d] = text.match(/(\d{1,2})\/(\d{1,2})/)!;
    now.setMonth(Number(m) - 1);
    now.setDate(Number(d));
    now.setHours(14, 0, 0, 0);
    return now.toISOString();
  }
  // 他のパターンは未対応
  return null;
} 