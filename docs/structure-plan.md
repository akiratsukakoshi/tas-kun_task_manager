# tas-kun Bot ディレクトリ構成・実装計画

このドキュメントは、Karen Bot（karenディレクトリ配下）の全体構成を最大限生かしつつ、再設計する形で作成するsupabase連携のタスク管理ボット tas-kunのディレクトリ構造を示します。
---

## 1. 作業元のkarenのディレクトリ構造

```
karen/
├── src/
│   ├── discord/           # Discord連携（Bot本体・リマインダー送信など）
│   │   ├── discordGateway.ts         # メッセージ受信・ルームルール判定・ワークフロー起動
│   │   └── discordReminderSender.ts  # Discordへのリマインダー送信処理
│   ├── reminder/          # 定期・特定イベントリマインダーのスケジューリング
│   │   └── reminderScheduler.ts      # リマインダー実行のメインロジック
│   ├── calendar/          # GoogleカレンダーAPI連携
│   │   └── googleCalendarClient.ts   # 予定CRUD操作
│   ├── workflow/          # LLMによる意図分類・ワークフロー実行
│   │   ├── intentClassifier.ts       # LLMでのインテント判定・キャラクター応答
│   │   ├── workflowExecutor.ts       # ワークフローごとの処理本体
│   │   ├── eventSelector.ts          # 予定抽出・イベント特定ロジック
│   │   └── conversationContext.ts    # 会話状態管理（pendingEvent等）
│   ├── formatter/         # 応答文生成
│   │   └── responseFormatter.ts      # 予定リスト・詳細などの日本語フォーマット
│   ├── utils/             # 汎用ユーティリティ
│   │   ├── dateUtils.ts             # 日本語日付パース・空き時間計算
│   │   ├── yamlLoader.ts            # YAMLファイル読込
│   │   └── logger.ts                # ログ出力
│   ├── llm/               # LLM（OpenAI API）連携
│   │   └── openaiClient.ts          # OpenAI API呼び出し
│   ├── context/           # ユーザーごとの会話履歴・状態管理
│   │   └── contextManager.ts        # ユーザー状態・履歴の管理
│   ├── types/             # 型定義
│   │   └── japanese-date.d.ts       # 外部日付パース用型定義
│   └── bot.ts             # エントリーポイント
├── config/
│   ├── config.yaml                # Bot全体設定
│   ├── room_rules.yaml            # ルームごとの応答トリガー設定
│   ├── prompt_styles.yaml         # 応答スタイル定義
│   ├── workflows.yaml             # ワークフロー定義（LLM判定対象）
│   ├── character.yaml             # キャラクター設定（人格・口調）
│   ├── reminder_config.yaml       # 定期リマインダー設定
│   └── system_prompts/            # 各ワークフロー用LLMプロンプト
│       ├── add_schedule.md
│       ├── get_schedule.md
│       ├── delete_schedule.md
│       ├── modify_schedule.md
│       └── find_free_time.md
├── tests/
│   ├── japanese_date_parse.test.js # 日本語日付パースのテスト
│   └── chrono_parse.test.js        # chrono-nodeによる日付パーステスト
├── docs/                           # 設計・仕様ドキュメント
│   ├── llm_workflow_selection.md   # LLMワークフロー選択設計
│   ├── karen-bot-requirement.md    # 要件定義
│   └── structure-plan.md           # 構成設計
├── package.json                    # 依存パッケージ・スクリプト
├── tsconfig.json                   # TypeScript設定
└── README.md                       
```

---

## 2. tas-kunへの置換作業イメージ

```
tas-kun/
├── src/
│   ├── discord/           # Discord連携（Bot本体・リマインダー送信など） →再利用
│   │   ├── discordGateway.ts         # メッセージ受信・ルームルール判定・ワークフロー起動　→再利用
│   │   └── discordReminderSender.ts  # Discordへのリマインダー送信処理　→再利用
│   ├── reminder/          # 定期・特定イベントリマインダーのスケジューリング　→再利用（supabase連携に置換）
│   │   └── reminderScheduler.ts      # リマインダー実行のメインロジック　→再利用（supabase連携に置換）
│   ├── calendar/          # GoogleカレンダーAPI連携　→supabaseAPI連携（不要？）
│   │   └── googleCalendarClient.ts   # 予定CRUD操作　→不要
│   ├── workflow/          # LLMによる意図分類・ワークフロー実行　→タスク操作用に全体を再設計
│   │   ├── intentClassifier.ts       # LLMでのインテント判定・キャラクター応答 →内容修正
│   │   ├── workflowExecutor.ts       # ワークフローごとの処理本体　→内容修正
│   │   ├── eventSelector.ts          # 予定抽出・イベント特定ロジック　→不要
│   │   └── conversationContext.ts    # 会話状態管理（pendingEvent等）　→不要？要確認
│   ├── formatter/         # 応答文生成
│   │   └── responseFormatter.ts      # 予定リスト・詳細などの日本語フォーマット　→内容修正
│   ├── utils/             # 汎用ユーティリティ
│   │   ├── dateUtils.ts             # 日本語日付パース・空き時間計算　→不要？要確認
│   │   ├── yamlLoader.ts            # YAMLファイル読込　→不要？要確認
│   │   └── logger.ts                # ログ出力　→再利用
│   ├── llm/               # LLM（OpenAI API）連携　→再利用
│   │   └── openaiClient.ts          # OpenAI API呼び出し
│   ├── context/           # ユーザーごとの会話履歴・状態管理　→再利用
│   │   └── contextManager.ts        # ユーザー状態・履歴の管理　→再利用
│   ├── types/             # 型定義
│   │   └── japanese-date.d.ts       # 外部日付パース用型定義　→不要？要確認
│   └── bot.ts             # エントリーポイント
├── config/
│   ├── config.yaml                # Bot全体設定　→内容修正
│   ├── room_rules.yaml            # ルームごとの応答トリガー設定　→再利用
│   ├── prompt_styles.yaml         # 応答スタイル定義　→内容修正
│   ├── workflows.yaml             # ワークフロー定義（LLM判定対象）　→内容修正
│   ├── character.yaml             # キャラクター設定（人格・口調）　→内容修正
│   ├── reminder_config.yaml       # 定期リマインダー設定　→内容修正
│   └── system_prompts/            # 各ワークフロー用LLMプロンプト　→内容修正
│       ├── add_schedule.md
│       ├── get_schedule.md
│       ├── delete_schedule.md
│       ├── modify_schedule.md
│       └── find_free_time.md
├── tests/　→不要
│   ├── japanese_date_parse.test.js # 日本語日付パースのテスト
│   └── chrono_parse.test.js        # chrono-nodeによる日付パーステスト
├── docs/                           # 設計・仕様ドキュメント　→内容修正
│   ├── llm_workflow_selection.md   # LLMワークフロー選択設計
│   ├── karen-bot-requirement.md    # 要件定義
│   └── structure-plan.md           # 構成設計
├── package.json                    # 依存パッケージ・スクリプト　→内容修正
├── tsconfig.json                   # TypeScript設定　→内容修正
└── README　→内容修正
```
