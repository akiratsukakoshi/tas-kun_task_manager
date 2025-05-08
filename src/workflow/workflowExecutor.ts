import { IntentResult } from './intentClassifier.js';
import { CalendarService } from '../calendar/calendarService.js';

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
      return `予定を追加しました（ID: ${eventId}）`;
    }
    case 'get_schedule': {
      const events = await calendar.getEvents();
      if (events.length === 0) return '予定はありません。';
      return '予定一覧:\n' + events.map(e => `・${e.summary} (${e.start}〜${e.end})`).join('\n');
    }
    case 'delete_schedule': {
      // ダミーID
      const ok = await calendar.deleteEvent('dummy-event-id');
      return ok ? '予定を削除しました。' : '削除に失敗しました。';
    }
    case 'modify_schedule': {
      // ダミーID/データ
      const ok = await calendar.updateEvent('dummy-event-id', { summary: '変更後タイトル' });
      return ok ? '予定を変更しました。' : '変更に失敗しました。';
    }
    case 'remind':
      return 'リマインドを設定します（ダミー応答）';
    default:
      return null;
  }
} 