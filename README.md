# Karen Bot

自然言語でスケジュール管理ができるDiscord用カレンダーボットです。

## 特徴
- Discordで自然な日本語指示を受けてGoogleカレンダーを操作
- LLMによる意図判定・応答生成
- 設定やワークフローはYAML/Markdownで柔軟に管理
- **日本語自然言語日付パース強化（[japanese-date](https://github.com/koh110/japanese-date)利用）**
- **人間らしい日本語フォーマットで予定出力（例：「5月16日（金）の予定ですね。・内容（時間）…」）**
- テストスクリプトで日付パース精度も確認可能

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