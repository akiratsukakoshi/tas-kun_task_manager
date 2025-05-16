import { IntentResult, replyAsCharacter } from './intentClassifier.js';
import { GoogleCalendarClient, CalendarEvent } from '../calendar/googleCalendarClient.js';
import { formatTextResponse, formatDate, formatScheduleList } from '../formatter/responseFormatter.js';
import { parseJapaneseDate, parseJapaneseDateRange, parseDesiredDuration, findFreeSlots, formatFreeTimeList, parseJapaneseDateHybrid, parseJapaneseDateRangeHybrid } from '../utils/dateUtils.js';
import { debugLog } from '../utils/logger.js';
import { extractEventCriteria, findTargetEvent, extractUpdateFields, llmDecideRoute, filterEventsByTitleAndDate, extractEventInfoWithLLM } from './eventSelector.js';
import { getConversationContext, setConversationContext, clearConversationContext } from './conversationContext.js';

// cfgからAPIキーとカレンダーIDを取得してサービスを初期化
function getGoogleCalendarClient(cfg: any): GoogleCalendarClient {
  return new GoogleCalendarClient(
    process.env.GOOGLE_API_KEY || '',
    cfg.calendar?.default_calendar_id || ''
  );
}

export async function executeWorkflow(intentResult: IntentResult, message: any, cfg: any): Promise<string | null> {
  const calendar = getGoogleCalendarClient(cfg);
  switch (intentResult.intent) {
    case 'add_schedule': {
      const text = message.content || '';
      const ctx = getConversationContext();
      // LLMで予定情報を抽出
      const info = await extractEventInfoWithLLM(text, 'add');
      if (!info || !info.summary || !info.start) {
        return '内容を抽出できませんでした。もう少し詳しくご指定下さい。';
      }
      // 仮説確認フロー
      setConversationContext({ ...ctx, pendingEvent: info });
      const start = new Date(info.start);
      const end = info.end ? new Date(info.end) : new Date(start.getTime() + 60 * 60 * 1000);
      const dateStr = `${start.getMonth() + 1}/${start.getDate()}(${['日','月','火','水','木','金','土'][start.getDay()]})`;
      const timeStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}` +
        `-${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
      return `${info.summary} ${dateStr} ${timeStr} の予定を追加します。よろしいですか？`;
    }
    case 'get_schedule': {
      // ユーザー発話から日付・時間帯を抽出
      const text = message.content || '';
      const baseDateStr = await parseJapaneseDateHybrid(text, new Date());
      debugLog('発話:', text, '→ パース結果:', baseDateStr);
      function toYMD(date: Date) {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      }
      if (baseDateStr) {
        const baseDate = new Date(baseDateStr);
        const startOfDay = new Date(baseDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(baseDate);
        endOfDay.setHours(23, 59, 59, 999);
        // 期間指定で予定を取得
        const events = await calendar.listEvents(startOfDay, endOfDay);
        const baseDateYMD = toYMD(baseDate);
        const filtered = events.filter(e => {
          const start = new Date(e.start);
          const startYMD = toYMD(start);
          debugLog('get_schedule: 日付比較', { baseDateYMD, startYMD, raw: e.start });
          if (startYMD === baseDateYMD) {
            debugLog('該当予定:', e.summary, e.start, e.end);
          }
          return startYMD === baseDateYMD;
        });
        // 予定リストを会話状態に保存
        setConversationContext({ ...getConversationContext(), lastScheduleList: filtered });
        if (filtered.length === 0) return formatTextResponse('予定一覧', '該当日の予定はありません。');
        return formatScheduleList(baseDate, filtered);
      }
      // 日付抽出できなければエラーメッセージを返す
      return formatTextResponse('予定一覧', '指定の日時を特定できません。再度日程を指定してください。');
    }
    case 'delete_schedule': {
      const text = message.content || '';
      const ctx = getConversationContext();
      const info = await extractEventInfoWithLLM(text, 'delete');
      if (!info || !info.summary || !info.date) {
        return '内容を抽出できませんでした。もう少し詳しくご指定下さい。';
      }
      setConversationContext({ ...ctx, pendingEvent: info });
      return `以下の内容で予定を削除します。修正があれば返信してください\nタイトル: ${info.summary}\n日付: ${info.date}`;
    }
    case 'modify_schedule': {
      const text = message.content || '';
      const ctx = getConversationContext();
      const info = await extractEventInfoWithLLM(text, 'modify');
      if (!info || !info.summary || !info.start) {
        return '内容を抽出できませんでした。もう少し詳しくご指定下さい。';
      }
      setConversationContext({ ...ctx, pendingEvent: info });
      return `以下の内容で予定を変更します。修正があれば返信してください\nタイトル: ${info.summary}\n開始: ${info.start}\n終了: ${info.end || '未定'}`;
    }
    case 'remind': {
      // 1. 発話からEventCriteriaを抽出
      const text = message.content || '';
      const criteria = await extractEventCriteria(text);
      // 2. 予定一覧を取得し、該当予定を特定（必要に応じて）
      // 3. リマインド設定（現状はダミー応答）
      return formatTextResponse('リマインド', 'リマインドを設定します（ダミー応答）');
    }
    case 'find_free_time': {
      const text = message.content || '';
      const rangeResult = await parseJapaneseDateRangeHybrid(text, new Date());
      let startDate, endDate, timeRange, durationMinutes;
      if (rangeResult) {
        startDate = rangeResult.startDate;
        endDate = rangeResult.endDate;
        timeRange = rangeResult.timeRange;
        durationMinutes = rangeResult.durationMinutes ?? parseDesiredDuration(text) ?? 60;
      } else {
        // fallback: 旧実装
        const fallback = parseJapaneseDateRange(text);
        startDate = fallback.startDate;
        endDate = fallback.endDate;
        timeRange = fallback.timeRange;
        durationMinutes = parseDesiredDuration(text) ?? 60;
      }
      debugLog('find_free_time: 発話:', text);
      debugLog('find_free_time: パース結果:', { startDate, endDate, timeRange, durationMinutes });
      // カレンダーから指定範囲の予定を取得
      const events = await calendar.listEvents(startDate, endDate);
      debugLog('find_free_time: 取得予定件数:', events.length);
      if (events.length > 0) {
        debugLog('find_free_time: 予定リスト:', events.map(e => ({ summary: e.summary, start: e.start, end: e.end })));
      }
      // 空き時間を計算（findFreeSlotsは今後実装予定）
      const freeSlots = findFreeSlots(events, { startDate, endDate, timeRange, durationMinutes });
      debugLog('find_free_time: 空き時間候補:', freeSlots);
      // 結果を返す（formatFreeTimeListは今後実装予定）
      if (!freeSlots || freeSlots.length === 0) {
        return formatTextResponse('空き時間検索', 'ご希望の条件で空き時間が見つかりませんでした。');
      }
      return formatFreeTimeList(startDate, freeSlots, durationMinutes);
    }
    default:
      // intentがunknownでもpendingEventがあれば肯定返答を優先的に処理
      const ctx = getConversationContext();
      const text = message.content?.trim();
      if (ctx.pendingEvent && text && /^(はい|追加|ok|ＯＫ|お願いします|登録|削除|消して|消去|実行|変更|修正)/i.test(text)) {
        // add
        if (ctx.pendingEvent.start && ctx.pendingEvent.summary) {
          const info = ctx.pendingEvent;
          const start = new Date(info.start as string);
          const end = info.end ? new Date(info.end as string) : new Date(start.getTime() + 60 * 60 * 1000);
          const event: CalendarEvent = {
            summary: info.summary!,
            start: info.start!,
            end: info.end ? info.end : end.toISOString(),
            description: info.description || '',
          };
          const eventId = await calendar.addEvent(event);
          clearConversationContext();
          return `${info.summary} ${start.getMonth() + 1}/${start.getDate()}(${['日','月','火','水','木','金','土'][start.getDay()]}) ${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}-${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')} の予定を追加しました。`;
        }
        // delete
        if ((ctx.pendingEvent as any).date && ctx.pendingEvent.summary) {
          const info = ctx.pendingEvent;
          const allEvents = await calendar.listEvents();
          const dateVal = (info as any).date;
          const target = allEvents.find(e => {
            if (!dateVal) return false;
            const eventDate = new Date(e.start);
            const infoDate = new Date(dateVal as string);
            return e.summary === info.summary &&
              eventDate.getFullYear() === infoDate.getFullYear() &&
              eventDate.getMonth() === infoDate.getMonth() &&
              eventDate.getDate() === infoDate.getDate();
          });
          if (!target || !target.id) {
            clearConversationContext();
            return '該当する予定が見つかりませんでした。';
          }
          const ok = await calendar.deleteEvent(target.id);
          clearConversationContext();
          if (ok) {
            const start = new Date(target.start);
            const end = new Date(target.end);
            const dateStr = `${start.getMonth() + 1}月${start.getDate()}日`;
            const timeStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}` +
              `-${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
            return `${target.summary} ${dateStr} ${timeStr} の予定を削除しました。`;
          } else {
            return '削除に失敗しました。';
          }
        }
        // modify
        if (ctx.pendingEvent.start && ctx.pendingEvent.summary) {
          const info = ctx.pendingEvent;
          const allEvents = await calendar.listEvents();
          const target = allEvents.find(e => {
            if (!info.start) return false;
            const eventDate = new Date(e.start);
            const infoDate = new Date(info.start as string);
            return e.summary === info.summary &&
              eventDate.getFullYear() === infoDate.getFullYear() &&
              eventDate.getMonth() === infoDate.getMonth() &&
              eventDate.getDate() === infoDate.getDate();
          });
          if (!target || !target.id) {
            clearConversationContext();
            return '該当する予定が見つかりませんでした。';
          }
          const newEventData = {
            summary: info.summary!,
            start: info.start!,
            end: info.end,
            description: info.description || '',
          };
          const ok = await calendar.updateEvent(target.id, newEventData);
          clearConversationContext();
          if (ok) {
            const start = new Date(info.start as string);
            const end = info.end ? new Date(info.end as string) : new Date(start.getTime() + 60 * 60 * 1000);
            const dateStr = `${start.getMonth() + 1}/${start.getDate()}(${['日','月','火','水','木','金','土'][start.getDay()]})`;
            const timeStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}` +
              `-${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
            return `${info.summary} ${dateStr} ${timeStr} の予定を変更しました。`;
          } else {
            return '変更に失敗しました。';
          }
        }
      }
      // intentがunknownならキャラクター応答
      if (intentResult.intent === 'unknown') {
        return await replyAsCharacter(message.content);
      }
      return null;
  }
} 