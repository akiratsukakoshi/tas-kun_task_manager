# Karen Bot

## 概要
Karen Botは、Discord上で自然言語によるスケジュール管理ができるカレンダーボットです。Googleカレンダーと連携し、LLM（大規模言語モデル）による柔軟な意図判定・ワークフロー実行を実現します。

## 主な特徴
- Discordで自然な日本語指示を受けてGoogleカレンダーを操作
- **ワークフロー定義（workflows.yaml）・システムプロンプト（Markdown）を外部管理**
- **ルームごとに応答トリガー（メンション/キーワード/全発言など）をYAMLで柔軟に制御可能**
- **LLMによる自由度の高いワークフロー判定**（新規ワークフローもYAML/MD追加だけでOK）
- **日常会話や雑談はキャラクター設定に基づきLLMが返答（フォールバック機能）**
- **定期リマインダー機能**：毎朝や週初めなど、設定ファイル（YAML）で指定したタイミング・送信先（DM/スレッド）に自動で予定をリマインド。LLMが予定内容を見て一言コメントも添えます。
- **特定イベントリマインド機能**：自然言語で「〇〇の予定を△△にリマインドして」と指示すると、指定時刻に依頼者のDMへリマインド＋LLMによる一言コメントが届きます。
- 日本語自然言語日付パース強化（[japanese-date](https://github.com/koh110/japanese-date)利用）
- 人間らしい日本語フォーマットで予定出力
- テストスクリプトで日付パース精度も確認可能


## セットアップ
1. 依存パッケージのインストール
   ```bash
   npm install
   ```
2. 必要な環境変数を`.env`または環境変数で設定
   - `DISCORD_TOKEN` : Discord Botのトークン
   - `GOOGLE_API_KEY` : Google APIキー
   - `OPENAI_API_KEY` : OpenAI APIキー
   - `OPENAI_API_BASE` : OpenAI APIエンドポイント
   - `OPENAI_MODEL` : OpenAIモデル名（例: gpt-3.5-turbo）
3. `config/config.yaml`など設定ファイルを編集

## 起動方法
```bash
npm start
```

## ワークフロー追加・拡張方法
1. `config/workflows.yaml` に新しいワークフローを追加
2. `config/system_prompts/` に対応するMarkdownプロンプトファイルを作成
   - 例: `my_new_workflow.md`
3. 必要に応じてYAMLやプロンプトの例文・説明を充実させるだけで、LLMが自動で判定・実行します

## LLMワークフロー判定のポイント
- ワークフロー定義（workflows.yaml）をLLMプロンプトに動的に組み込み、ユーザー発話から最適なワークフローを自動選択
- 新しいワークフロー追加・変更もYAML/Markdown編集だけで即反映
- 雑談や該当しない発話は`unknown` intentとなり、キャラクター設定（character.yaml）に基づく日常会話応答に自動フォールバック

## デバッグログについて
- LOG_LEVEL 環境変数でログ出力の詳細度を制御できます
  - `LOG_LEVEL=debug` で詳細なDEBUGログが出力されます（開発・検証用）
  - `LOG_LEVEL=info` などにするとDEBUGログは出ません（本番運用向け）
- 例：
  ```bash
  LOG_LEVEL=debug npm start
  ```
- 主なワークフロー（予定参照・空き時間検索）で、ユーザー発話・パース結果・取得予定・空き時間候補などの詳細ログが出力されます

## 予定出力フォーマット例
```
5月16日（金）の予定ですね。
・Aプロジェクト（10:00〜11:00）
・企画会議（11:15〜12:45）
・商談B（13:00〜14:00）
詳細を知りたい予定や変更が必要な予定はありますか？
```

## ディレクトリ構成
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
└── README.md                       # 本ファイル
```

## ライセンス
MIT 

## ドキュメント

- [LLMの判断によるworkflow選択＆実行モデル](docs/llm_workflow_selection.md) 