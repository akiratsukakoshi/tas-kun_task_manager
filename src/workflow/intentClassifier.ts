export type IntentType = 'add_schedule' | 'get_schedule' | 'delete_schedule' | 'modify_schedule' | 'remind' | 'find_free_time' | 'unknown';

export interface IntentResult {
  intent: IntentType;
  reason?: string;
}

// --- LLM連携用: workflows.yamlを動的に読み込みプロンプトを生成し、OpenAIで意図判定 ---
import { loadYaml } from '../utils/yamlLoader.js';
import { callOpenAIChat, callOpenAIChatWithSystemPrompt } from '../llm/openaiClient.js';

interface WorkflowDef {
  description: string;
  steps: string[];
}

interface WorkflowsYaml {
  workflows: Record<string, WorkflowDef>;
}

export async function loadWorkflows(): Promise<WorkflowsYaml> {
  // config/workflows.yaml を読み込む
  return loadYaml<WorkflowsYaml>('config/workflows.yaml');
}

export function formatWorkflowsForPrompt(workflows: Record<string, WorkflowDef>): string {
  return Object.entries(workflows)
    .map(([name, wf]) => `- ${name}: ${wf.description}`)
    .join('\n');
}

export async function createIntentPrompt(message: string): Promise<string> {
  const { workflows } = await loadWorkflows();
  const workflowList = formatWorkflowsForPrompt(workflows);
  return `あなたはユーザーの発話から最適なワークフローを選択するAIアシスタントです。\n以下は利用可能なワークフローの一覧です。\n\n${workflowList}\n\nユーザー発話: 「${message}」\n\n最も適切なワークフロー名（英語名）を1つだけ出力してください。もし該当しない場合は「unknown」と出力してください。`;
}

export async function classifyIntentWithLLM(message: string): Promise<IntentResult> {
  const prompt = await createIntentPrompt(message);
  const llmResult = await callOpenAIChat(prompt);
  // LLMの返答（ワークフロー名）をIntentTypeにマッピング
  const intent = llmResult.split(/[\s\n]/)[0].trim() as IntentType;
  return { intent, reason: `LLM判定: ${llmResult}` };
}

export async function replyAsCharacter(message: string): Promise<string> {
  const character = loadYaml<{ character: { persona: string } }>('config/character.yaml');
  return callOpenAIChatWithSystemPrompt(message, character.character.persona);
}

// 必須フィールドが足りない場合に不足項目を特定
export function getMissingFields(result: any, requiredFields: string[]): string[] {
  return requiredFields.filter(field => !result[field]);
}

// 英語フィールド名→日本語変換辞書
const fieldNameJa: Record<string, string> = {
  start: '開始日時',
  end: '終了日時',
  duration_minutes: '会議の希望時間（分）',
  summary: 'タイトル',
  old_date: '元の日時',
  new_date: '新しい日時',
  date: '日時',
};

export function fieldToJapanese(field: string): string {
  return fieldNameJa[field] || field;
}

// 不足項目を日本語で質問文にする
export function askForMissingFields(intent: IntentType, missing: string[]): string {
  if (intent === 'find_free_time') {
    return `空き時間検索のために、${missing.map(fieldToJapanese).join('と')}を教えてください。`;
  }
  // 他intentも必要に応じて追加
  return `必要な情報（${missing.map(fieldToJapanese).join('、')}）を教えてください。`;
} 