// ユーザーごとの会話履歴と状態を管理するシンプルなメモリ実装
export type MessageHistory = { content: string; timestamp: number }[];
export type UserContext = {
  state: any; // 進行中ワークフローや設定など
  history: MessageHistory; // 直近10件の履歴
};

const MAX_HISTORY = 10;
const userContexts: Map<string, UserContext> = new Map();

export function getUserContext(userId: string): UserContext {
  if (!userContexts.has(userId)) {
    userContexts.set(userId, { state: null, history: [] });
  }
  return userContexts.get(userId)!;
}

export function addMessageToHistory(userId: string, message: string) {
  const ctx = getUserContext(userId);
  ctx.history.push({ content: message, timestamp: Date.now() });
  if (ctx.history.length > MAX_HISTORY) ctx.history.shift();
}

export function setUserState(userId: string, state: any) {
  const ctx = getUserContext(userId);
  ctx.state = state;
}

export function getUserState(userId: string): any {
  return getUserContext(userId).state;
} 