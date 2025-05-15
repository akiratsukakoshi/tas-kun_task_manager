# Karen Bot

自然言語でスケジュール管理ができるDiscord用カレンダーボットです。

## 特徴
- Discordで自然な日本語指示を受けてGoogleカレンダーを操作
- LLMによる意図判定・応答生成
- 設定やワークフローはYAML/Markdownで柔軟に管理
- **日本語自然言語日付パース強化（[japanese-date](https://github.com/koh110/japanese-date)利用）**
- **人間らしい日本語フォーマットで予定出力（例：「5月16日（金）の予定ですね。・内容（時間）…」）**
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
3. `config/config.yaml`など設定ファイルを編集

## 起動方法

```bash
npm start
```

## テスト（日付パース精度確認）

```bash
node tests/japanese_date_parse.test.js
```

## 予定出力フォーマット例

```
5月16日（金）の予定ですね。
・Aプロジェクト（10:00〜11:00）
・企画会議（11:15〜12:45）
・商談B（13:00〜14:00）
詳細を知りたい予定や変更が必要な予定はありますか？
```

## デバッグログ（debug log）について

- 本Botは詳細な挙動確認のためのデバッグログ出力機能を備えています。
- LOG_LEVEL 環境変数でログ出力の詳細度を制御できます。
  - `LOG_LEVEL=debug` で詳細なDEBUGログが出力されます（開発・検証用）
  - `LOG_LEVEL=info` などにするとDEBUGログは出ません（本番運用向け）
- 例：
  ```bash
  LOG_LEVEL=debug npm start
  ```
- 主なワークフロー（予定参照・空き時間検索）で、ユーザー発話・パース結果・取得予定・空き時間候補などの詳細ログが出力されます。

## ディレクトリ構成

```
karen/
├── src/
│   ├── discord/
│   ├── context/
│   ├── calendar/
│   ├── workflow/
│   ├── formatter/
│   ├── utils/
│   └── bot.ts
├── config/
│   ├── config.yaml
│   └── ...
├── tests/
│   ├── japanese_date_parse.test.js
├── package.json
├── tsconfig.json
└── README.md
```

## ライセンス
MIT 