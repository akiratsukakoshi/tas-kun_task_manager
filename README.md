# TasKun Bot

## 概要
TasKun Botは、Discord上で自然言語によるタスク管理ができるタスク管理ボットです。Supabaseと連携し、LLM（大規模言語モデル）による柔軟な意図判定・ワークフロー実行を実現します。

## 主な特徴
- Discordで自然な日本語指示を受けてタスクを管理
- **ワークフロー定義（workflows.yaml）・システムプロンプト（Markdown）を外部管理**
- **ルームごとに応答トリガー（メンション/キーワード/全発言など）をYAMLで柔軟に制御可能**
- **LLMによる自由度の高いワークフロー判定**（新規ワークフローもYAML/MD追加だけでOK）
- **日常会話や雑談はキャラクター設定に基づきLLMが返答（フォールバック機能）**
- **定期リマインダー機能**：Supabase上の期限が近いタスクを自動でリマインド
- 日本語自然言語日付パース強化（[japanese-date](https://github.com/koh110/japanese-date)利用）

## ディレクトリ構成（抜粋）
```
tas-kun/
├── apps/
│   └── bot/
│       ├── src/
│       │   ├── discord/         # Discord連携
│       │   ├── reminder/        # リマインダー
│       │   ├── workflow/        # LLMワークフロー
│       │   ├── formatter/       # 応答文生成
│       │   ├── utils/           # ユーティリティ
│       │   ├── llm/             # LLM API連携
│       │   ├── context/         # 会話状態管理
│       │   ├── types/           # 型定義
│       │   └── bot.ts           # エントリーポイント
│       ├── config/
│       │   ├── config.yaml
│       │   ├── character.yaml
│       │   ├── prompt_styles.yaml
│       │   ├── workflows.yaml
│       │   ├── room_rules.yaml
│       │   └── system_prompts/
│       │       ├── add_task.md
│       │       ├── get_tasks.md
│       │       ├── update_task.md
│       │       └── complete_task.md
│       ├── package.json
│       └── README.md
├── packages/
│   └── shared/                  # 共通型・ユーティリティ（今後拡張予定）
├── supabase/                    # Supabaseスキーマ等（今後拡張予定）
├── docs/                        # 設計・仕様ドキュメント
└── ...
```

## セットアップ
1. 依存パッケージのインストール
   ```bash
   cd apps/bot
   npm install
   ```
2. 必要な環境変数を`.env`または環境変数で設定
   - `DISCORD_BOT_TOKEN_TAS_KUN` : Discord Botのトークン
   - `SUPABASE_URL` : SupabaseプロジェクトURL
   - `SUPABASE_SERVICE_ROLE_KEY` : Supabaseサービスロールキー
   - `OPENAI_API_KEY` : OpenAI APIキー
   - `OPENAI_API_BASE` : OpenAI APIエンドポイント
   - `OPENAI_MODEL` : OpenAIモデル名（例: gpt-3.5-turbo）
3. `config/config.yaml`など設定ファイルを編集

## 起動方法
```bash
npm start
```

## ワークフロー追加・拡張方法
1. `config/workflows.yaml` に新しいワークフローintentを追加
2. `config/system_prompts/` に対応するMarkdownプロンプトファイルを作成
   - 例: `add_task.md`, `get_tasks.md` など
3. 必要に応じてYAMLやプロンプトの例文・説明を充実させるだけで、LLMが自動で判定・実行します

## LLMワークフロー判定のポイント
- ワークフロー定義（workflows.yaml）をLLMプロンプトに動的に組み込み、ユーザー発話から最適なワークフローを自動選択
- 新しいワークフロー追加・変更もYAML/Markdown編集だけで即反映
- 雑談や該当しない発話は`unknown` intentとなり、キャラクター設定（character.yaml）に基づく日常会話応答に自動フォールバック

## ドキュメント
- [tas-kun_migration_plan.md](../../docs/tas-kun_migration_plan.md)
- [tas__kun_spec.md](../../docs/tas__kun_spec.md)
- [structure-plan.md](../../docs/structure-plan.md)
- [llm_workflow_selection.md](../../docs/llm_workflow_selection.md)

## ライセンス
MIT 