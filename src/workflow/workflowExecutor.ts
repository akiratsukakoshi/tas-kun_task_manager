import { IntentResult } from './intentClassifier.js';
import { CalendarService } from '../calendar/calendarService.js';
import { formatTextResponse, formatDate, formatScheduleList } from '../formatter/responseFormatter.js';
import { parseJapaneseDate } from '../utils/dateUtils.js';

// cfgからAPIキーとカレンダーIDを取得してサービスを初期化
function getCalendarService(cfg: any): CalendarService {
  return new CalendarService(
    process.env.GOOGLE_API_KEY || '',
    cfg.calendar?.default_calendar_id || ''
  );
}

export async function executeWorkflow(intentResult: IntentResult, message: any, cfg: any): Promise<string | null> {
  const calendar = getCalendarService(cfg);
  switch (intentResult.intent) {
    case 'add_schedule': {
      // ダミーイベント
      const event = {
        summary: 'テスト予定',
        start: new Date().toISOString(),
        end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        description: 'ダミー追加'
      };
      const eventId = await calendar.addEvent(event);
      return formatTextResponse('予定追加', `予定を追加しました（ID: ${eventId}）`);
    }
    case 'get_schedule': {
      const events = await calendar.getEvents();
      if (events.length === 0) return formatTextResponse('予定一覧', '予定はありません。');
      // ユーザー発話から日付・時間帯を抽出
      const text = message.content || '';
      const baseDateStr = parseJapaneseDate(text);
      console.log('DEBUG: 発話:', text, '→ パース結果:', baseDateStr);
      if (baseDateStr) {
        const baseDate = new Date(baseDateStr);
        // 同じ日付の予定のみ抽出（時間帯指定は今後拡張）
        const filtered = events.filter(e => {
          const start = new Date(e.start);
          const match = start.getFullYear() === baseDate.getFullYear() &&
                        start.getMonth() === baseDate.getMonth() &&
                        start.getDate() === baseDate.getDate();
          if (match) {
            console.log('DEBUG: 該当予定:', e.summary, e.start, e.end);
          }
          return match;
        });
        if (filtered.length === 0) return formatTextResponse('予定一覧', '該当日の予定はありません。');
        return formatScheduleList(baseDate, filtered);
      }
      // 日付抽出できなければエラーメッセージを返す
      return formatTextResponse('予定一覧', '指定の日時を特定できません。再度日程を指定してください。');
    }
    case 'delete_schedule': {
      // ダミーID
      const ok = await calendar.deleteEvent('dummy-event-id');
      return formatTextResponse('予定削除', ok ? '予定を削除しました。' : '削除に失敗しました。');
    }
    case 'modify_schedule': {
      // ダミーID/データ
      const ok = await calendar.updateEvent('dummy-event-id', { summary: '変更後タイトル' });
      return formatTextResponse('予定変更', ok ? '予定を変更しました。' : '変更に失敗しました。');
    }
    case 'remind':
      return formatTextResponse('リマインド', 'リマインドを設定します（ダミー応答）');
    default:
      return null;
  }
} 