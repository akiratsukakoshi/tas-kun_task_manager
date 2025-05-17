import { Client, GatewayIntentBits, TextChannel, ThreadChannel, User, Partials } from 'discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages], partials: [Partials.Channel] });
let isReady = false;

client.once('ready', () => {
  isReady = true;
  console.log(`[Discord] Bot logged in as ${client.user?.tag}`);
});

export async function loginDiscordBot(token: string) {
  if (!client.isReady()) {
    await client.login(token);
  }
}

export type ReminderTarget = { type: 'dm', discord_id: string } | { type: 'thread', channel_id: string, thread_id?: string };

export async function sendDiscordReminder(target: ReminderTarget, message: string) {
  if (!isReady) throw new Error('Discord client not ready. Call loginDiscordBot() first.');
  if (target.type === 'dm') {
    const user = await client.users.fetch(target.discord_id);
    if (user) await user.send(message);
  } else if (target.type === 'thread') {
    const channel = await client.channels.fetch(target.channel_id);
    if (channel?.isTextBased()) {
      if (target.thread_id) {
        const thread = await (channel as TextChannel).threads.fetch(target.thread_id);
        if (thread) await thread.send(message);
      } else {
        await (channel as TextChannel).send(message);
      }
    }
  }
} 