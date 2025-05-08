# Karen Bot

自然言語でスケジュール管理ができるDiscord用カレンダーボットです。

## 特徴
- Discordで自然な日本語指示を受けてGoogleカレンダーを操作
- LLMによる意図判定・応答生成
- 設定やワークフローはYAML/Markdownで柔軟に管理

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
├── package.json
├── tsconfig.json
└── README.md
```

## ライセンス
MIT 