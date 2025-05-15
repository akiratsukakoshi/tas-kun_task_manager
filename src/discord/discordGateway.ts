import { Client, GatewayIntentBits, Events } from 'discord.js';
import { classifyIntentWithLLM } from '../workflow/intentClassifier.js';
import { executeWorkflow } from '../workflow/workflowExecutor.js';
import { addMessageToHistory, getUserContext } from '../context/contextManager.js';

export const makeDiscordGateway = (cfg: any) => {
  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

  client.on(Events.MessageCreate, async (m) => {
    if (m.author.bot) return;
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
    }
  });

  return { start: () => client.login(process.env.DISCORD_TOKEN) };
}; 