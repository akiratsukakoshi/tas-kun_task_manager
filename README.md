# Karen Bot

## 概要
Karen Botは、Discord上で自然言語によるスケジュール管理ができるカレンダーボットです。Googleカレンダーと連携し、LLM（大規模言語モデル）による柔軟な意図判定・ワークフロー実行を実現します。

## 主な特徴
- Discordで自然な日本語指示を受けてGoogleカレンダーを操作
- **ワークフロー定義（workflows.yaml）・システムプロンプト（Markdown）を外部管理**
- **LLMによる自由度の高いワークフロー判定**（新規ワークフローもYAML/MD追加だけでOK）
- **日常会話や雑談はキャラクター設定に基づきLLMが返答（フォールバック機能）**
- 日本語自然言語日付パース強化（[japanese-date](https://github.com/koh110/japanese-date)利用）
- 人間らしい日本語フォーマットで予定出力
- テストスクリプトで日付パース精度も確認可能

## 空き時間検索機能

- 「明日の午後の空き時間を教えて」「来週月曜の1時間会議の候補日時を教えて」など、自然言語で空き時間候補を提案できます。
- 日付・時間帯・希望時間幅を日本語で指定可能です。
- カレンダー予定をもとに、条件に合う空き時間を自動で抽出・提案します。

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
│   ├── discord/           # Discordクライアント・メッセージハンドラ
│   ├── context/           # 発話者／チャンネル情報・状態の管理
│   ├── calendar/          # Google Calendar API操作（CRUD）
│   ├── workflow/          # 意図分類／ワークフロー選定と実行
│   ├── formatter/         # 応答文生成
│   ├── utils/             # ユーティリティ（日付変換など）
│   └── bot.ts
├── config/
│   ├── config.yaml
│   ├── room_rules.yaml
│   ├── prompt_styles.yaml
│   ├── workflows.yaml
│   ├── character.yaml
│   └── system_prompts/
│       ├── add_schedule.md
│       ├── get_schedule.md
│       ├── delete_schedule.md
│       ├── modify_schedule.md
│       └── find_free_time.md
├── tests/
│   ├── japanese_date_parse.test.js
├── package.json
├── tsconfig.json
└── README.md
```

## ライセンス
MIT 