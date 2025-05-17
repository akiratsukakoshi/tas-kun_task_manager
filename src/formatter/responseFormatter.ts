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
export function formatScheduleList(date: Date, events: any[]): string {
  if (!events.length) return '予定はありません。';
  const dateStr = format(date, 'M月d日（E）', { locale: ja });
  const lines = events.map((e, i) => {
    const start = new Date(e.start);
    const end = new Date(e.end);
    const timeStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}` +
      `-${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
    return `${i + 1}. ${e.summary}（${timeStr}）`;
  });
  return `${dateStr}の予定ですね。\n${lines.join('\n')}\n詳細を知りたい予定や変更が必要な予定はありますか？`;
}

/**
 * 予定の詳細情報を日本語でフォーマット
 */
export function formatScheduleDetail(event: {
  summary: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
  htmlLink?: string;
}): string {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const dateStr = `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日`;
  const timeStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}` +
    `-${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
  let result = `タイトル: ${event.summary}\n日時: ${dateStr} ${timeStr}`;
  if (event.location) result += `\n場所: ${event.location}`;
  if (event.description) result += `\n説明: ${event.description}`;
  if (event.htmlLink) result += `\nURL: ${event.htmlLink}`;
  return result;
} 