import { CalendarEvent } from '../calendar/googleCalendarClient.js';

export type PendingAction = {
  type: 'modify' | 'delete';
  candidates: CalendarEvent[];
};

export type ConversationContext = {
  lastScheduleList?: CalendarEvent[];
  pendingAction?: PendingAction;
  pendingEvent?: Partial<CalendarEvent>;
};

// グローバルな会話状態（ユーザーごとに分離する場合はここを拡張）
let globalContext: ConversationContext = {};

export function getConversationContext(): ConversationContext {
  return globalContext;
}

export function setConversationContext(ctx: ConversationContext) {
  globalContext = ctx;
}

export function clearConversationContext() {
  globalContext = {};
} 