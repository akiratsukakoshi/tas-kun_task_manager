# Karen Bot ディレクトリ構成・実装計画

このドキュメントは、Karen Bot（karenディレクトリ配下）の全体構成・設計方針・各モジュールの役割をまとめたものです。
スレッドが変わっても迷子にならないよう、全体像と設計思想を明記しています。

---

## 1. ディレクトリ・ファイル構成

```
karen/
├── src/
│   ├── discord/
│   │   ├── discordGateway.ts         # Discordクライアント・メッセージハンドラ
│   ├── context/
│   │   ├── contextManager.ts         # ユーザー・チャンネル情報管理
│   ├── calendar/
│   │   ├── googleCalendarClient.ts   # Google Calendar APIラッパー
│   ├── workflow/
│   │   ├── intentClassifier.ts       # LLMによる意図判定
│   │   ├── workflowExecutor.ts       # workflows.yamlに基づく分岐
│   ├── formatter/
│   │   ├── responseFormatter.ts      # 応答文生成
│   ├── utils/
│   │   ├── dateUtils.ts              # 日付変換
│   │   ├── yamlLoader.ts             # YAML設定読み込み
│   ├── bot.ts                        # エントリーポイント
│
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
│       └── modify_schedule.md
│
├── tests/
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 2. 各モジュールの役割

### src/discord/
- **discordGateway.ts**: Discordクライアントの初期化、メッセージ受信、メンション検出、ワークフロー呼び出しなどを担当。

### src/context/
- **contextManager.ts**: ユーザーやチャンネルの情報・状態管理。

### src/calendar/
- **googleCalendarClient.ts**: Google Calendar APIとの連携・CRUD操作のラッパー。

### src/workflow/
- **intentClassifier.ts**: LLMとYAMLルールを用いた意図判定。
- **workflowExecutor.ts**: workflows.yamlに基づき、カレンダー操作や応答生成を分岐。

### src/formatter/
- **responseFormatter.ts**: LLMまたはテンプレートによる応答文生成。

### src/utils/
- **dateUtils.ts**: 日付パース・変換などのユーティリティ。
- **yamlLoader.ts**: YAML設定ファイルの読み込み。

### config/
- **config.yaml**: Bot全体の設定。
- **room_rules.yaml**: ルームごとの応答ルール。
- **prompt_styles.yaml**: 応答スタイル定義。
- **workflows.yaml**: ワークフロー定義。
- **character.yaml**: Botの人格・話し方設定。
- **system_prompts/**: LLM用プロンプト（用途別Markdown）。

### その他
- **tests/**: 各モジュールの単体テスト。
- **.env.example**: 環境変数テンプレート。
- **package.json/tsconfig.json/README.md**: 標準的なNode.js/TypeScriptプロジェクト構成。

---

## 3. 設計思想・方針

- **YAML/Markdownによる外部設定・プロンプト管理**
- **LLMを活用した柔軟な意図判定・応答生成**
- **疎結合なモジュール設計（各機能を分離）**
- **拡張性・再利用性重視（他Bot展開も意識）**
- **テスト容易性・保守性を意識した構成**

---

## 4. 実装フロー例

1. 最小構成の作成（Discordメッセージ受信→意図判定→ダミー応答）
2. GoogleカレンダーAPI連携（予定の取得・追加・削除・変更）
3. YAMLによるワークフロー・プロンプト管理
4. 応答スタイル・人格の切り替え
5. テスト・CI/CD・ドキュメント整備

---

このドキュメントを起点に、karen-botの開発を進めてください。 