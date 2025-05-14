import { parseJapaneseDate } from '../utils/dateUtils';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * 日付を統一フォーマット（YYYY/MM/DD HH:mm）で返す
 */
export function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
}

/**
 * テキスト応答のフォーマット関数
 * @param title タイトルや見出し
 * @param body 本文
 * @param date 日付（任意）
 */
export function formatTextResponse(title: string, body: string, date?: Date): string {
  let result = `【${title}】\n${body}`;
  if (date) {
    result += `\n日時: ${formatDate(date)}`;
  }
  return result;
}

/**
 * Discord Embed用のオブジェクト生成（将来拡張用の雛形）
 */
export function formatDiscordEmbed(options: {
  title: string;
  description: string;
  date?: Date;
  color?: number;
}): any {
  const embed: any = {
    title: options.title,
    description: options.description,
    color: options.color || 0x0099ff,
  };
  if (options.date) {
    embed.footer = { text: `日時: ${formatDate(options.date)}` };
  }
  return embed;
}

/**
 * 日付ごとの予定リストを日本語でフォーマット
 */
export function formatScheduleList(date: Date, events: { summary: string, start: string, end: string }[]): string {
  const dateStr = format(date, 'M月d日（E）', { locale: ja });
  const lines = events.map(e => {
    const start = new Date(e.start);
    const end = new Date(e.end);
    const timeStr = `${format(start, 'HH:mm')}〜${format(end, 'HH:mm')}`;
    return `・${e.summary}（${timeStr}）`;
  });
  return `${dateStr}の予定ですね。\n${lines.join('\n')}\n詳細を知りたい予定や変更が必要な予定はありますか？`;
} 