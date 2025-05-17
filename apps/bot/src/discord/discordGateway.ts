import { Client, GatewayIntentBits, Events } from 'discord.js';
import { classifyIntentWithLLM } from '../workflow/intentClassifier.js';
import { executeWorkflow } from '../workflow/workflowExecutor.js';
import { addMessageToHistory, getUserContext } from '../context/contextManager.js';
import { loadYaml } from '../utils/yamlLoader.js';

// ルームルール型
interface RoomRule {
  id: string;
  room_ids?: string[];
  description?: string;
  trigger: Array<'mention' | { keyword: string } | 'all'>;
}
interface RoomRulesYaml { rules: RoomRule[]; }

function getRuleForRoom(roomId: string, rules: RoomRule[]): RoomRule | undefined {
  // 個別ルームルールを優先
  const specific = rules.find(r => r.room_ids && r.room_ids.includes(roomId));
  if (specific) return specific;
  // なければgeneral
  return rules.find(r => r.id === 'general');
}

function shouldTrigger(rule: RoomRule | undefined, message: any, clientUserId: string): boolean {
  if (!rule || !rule.trigger) return false;
  for (const trig of rule.trigger) {
    if (trig === 'all') return true;
    if (trig === 'mention' && message.mentions.has(clientUserId)) return true;
    if (typeof trig === 'object' && 'keyword' in trig) {
      if (message.content.includes(trig.keyword)) return true;
    }
  }
  return false;
}

// スレッドごとの最終Bot発話情報
const lastBotReply: Record<string, { timestamp: number, userId: string }> = {};

export const makeDiscordGateway = (cfg: any) => {
  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
  // ルールは起動時に一度だけ読み込む（必要ならホットリロードも可）
  const roomRules: RoomRulesYaml = loadYaml<RoomRulesYaml>('config/room_rules.yaml');

  client.on(Events.MessageCreate, async (m) => {
    if (m.author.bot) return;
    if (!client.user) return;
    const rule = getRuleForRoom(m.channelId, roomRules.rules);
    // --- 新ロジック: 直近Bot発話が2分以内かつ同じユーザー ---
    let triggered = shouldTrigger(rule, m, client.user.id);
    if (!triggered) {
      const threadId = m.channelId;
      const last = lastBotReply[threadId];
      if (last && last.userId === m.author.id && Date.now() - last.timestamp < 2 * 60 * 1000) {
        triggered = true;
      }
    }
    if (!triggered) return;
    addMessageToHistory(m.author.id, m.content);
    const history = getUserContext(m.author.id).history;
    const historyText = history.map(h => h.content).join('\n');
    const systemPrompt = `あなたは親切な予定管理ボットです。\n\n【会話履歴】\n${historyText}\n\n【新しいメッセージ】\n${m.content}`;
    const intentResult = await classifyIntentWithLLM(m.content);
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(`[DEBUG] intent判定: ${intentResult.intent} (${intentResult.reason})`);
    }
    const reply = await executeWorkflow(intentResult, m, cfg);
    if (reply) {
      await m.reply(reply);
      // --- Bot発話記録 ---
      lastBotReply[m.channelId] = { timestamp: Date.now(), userId: m.author.id };
    }
  });

  return { start: () => client.login(process.env.DISCORD_TOKEN) };
}; 