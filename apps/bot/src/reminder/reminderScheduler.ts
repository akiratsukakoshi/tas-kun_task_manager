import { loadYaml } from '../utils/yamlLoader.js';
import { GoogleCalendarClient } from '../calendar/googleCalendarClient.js';
import { formatScheduleList } from '../formatter/responseFormatter.js';
import { callOpenAIChatWithSystemPrompt } from '../llm/openaiClient.js';
import { loginDiscordBot, sendDiscordReminder, ReminderTarget } from '../discord/discordReminderSender.js';
import fs from 'fs';

// キャラクター設定のロード
function loadCharacterPrompt(): string {
  const char = loadYaml<any>('config/character.yaml');
  return `あなたは${char.character.name}です。${char.character.persona}`;
}

// リマインダー設定のロード
type ReminderConfig = {
  daily?: { enabled: boolean, time: string, targets: ReminderTarget[] },
  weekly?: { enabled: boolean, day_of_week: number, time: string, targets: ReminderTarget[] }
};

async function getTodayEvents(calendar: GoogleCalendarClient) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return calendar.listEvents(start, end);
}

async function getThisWeekEvents(calendar: GoogleCalendarClient) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setDate(start.getDate() + 6 - start.getDay());
  end.setHours(23, 59, 59, 999);
  return calendar.listEvents(start, end);
}

async function generateReminderMessage(events: any[], charPrompt: string, period: 'daily' | 'weekly') {
  const scheduleText = formatScheduleList(new Date(), events);
  const userPrompt = `以下は${period === 'daily' ? '本日' : '今週'}の予定リストです。これを見て、朝の挨拶と一言コメントを添えて、ユーザーを励ますメッセージを作ってください。コメントはキャラクター設定に沿ってください。\n\n予定リスト:\n${scheduleText}`;
  return callOpenAIChatWithSystemPrompt(userPrompt, charPrompt);
}

async function generateRemindOneLiner(summary: string, remindAt: string, charPrompt: string) {
  const userPrompt = `「${remindAt}に${summary}」のリマインドを送ります。キャラクター設定に沿って、励ましや気遣いの一言を添えてください。`;
  return callOpenAIChatWithSystemPrompt(userPrompt, charPrompt);
}

export async function runReminders() {
  const config = loadYaml<ReminderConfig>('config/reminder_config.yaml');
  const charPrompt = loadCharacterPrompt();
  const calendar = new GoogleCalendarClient(process.env.GOOGLE_API_KEY || '', process.env.GOOGLE_CALENDAR_ID || '');
  const now = new Date();

  await loginDiscordBot(process.env.DISCORD_TOKEN || '');

  // daily
  if (config.daily?.enabled) {
    // 時刻判定は省略（cron等で制御想定）
    const events = await getTodayEvents(calendar);
    const message = await generateReminderMessage(events, charPrompt, 'daily');
    for (const target of config.daily.targets) {
      await sendDiscordReminder(target, message);
    }
  }
  // weekly（月曜判定）
  if (config.weekly?.enabled && now.getDay() === config.weekly.day_of_week) {
    const events = await getThisWeekEvents(calendar);
    const message = await generateReminderMessage(events, charPrompt, 'weekly');
    for (const target of config.weekly.targets) {
      await sendDiscordReminder(target, message);
    }
  }

  // 特定イベントリマインド
  const remindersPath = 'reminders.json';
  if (fs.existsSync(remindersPath)) {
    let reminders = JSON.parse(fs.readFileSync(remindersPath, 'utf8'));
    const nowISO = new Date().toISOString();
    const toSend = reminders.filter((r: any) => r.remindAt <= nowISO);
    const remain = reminders.filter((r: any) => r.remindAt > nowISO);
    for (const r of toSend) {
      const oneLiner = await generateRemindOneLiner(r.summary, r.remindAt, charPrompt);
      const msg = `【リマインド】「${r.summary}」の時間です！\n${oneLiner}`;
      await sendDiscordReminder(r.discordTarget, msg);
    }
    if (toSend.length > 0) {
      fs.writeFileSync(remindersPath, JSON.stringify(remain, null, 2), 'utf8');
    }
  }
}

// CLI実行用
if (require.main === module) {
  runReminders();
} 