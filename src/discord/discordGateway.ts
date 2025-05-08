import { Client, GatewayIntentBits, Events } from 'discord.js';
import { classifyIntent } from '../workflow/intentClassifier.js';
import { executeWorkflow } from '../workflow/workflowExecutor.js';

export const makeDiscordGateway = (cfg: any) => {
  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

  client.on(Events.MessageCreate, async (m) => {
    if (m.author.bot) return;
    const intentResult = await classifyIntent(m.content);
    const reply = await executeWorkflow(intentResult, m, cfg);
    if (reply) {
      await m.reply(reply);
    }
  });

  return { start: () => client.login(process.env.DISCORD_TOKEN) };
}; 