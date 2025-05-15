import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_BASE = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export async function callOpenAIChat(prompt: string): Promise<string> {
  return callOpenAIChatWithSystemPrompt(prompt, 'あなたはワークフロー選択専用のAIアシスタントです。');
}

export async function callOpenAIChatWithSystemPrompt(prompt: string, systemPrompt: string): Promise<string> {
  const res = await axios.post(
    `${OPENAI_API_BASE}/chat/completions`,
    {
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.0
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  // 最初のassistantメッセージを返す
  return res.data.choices[0].message.content.trim();
} 