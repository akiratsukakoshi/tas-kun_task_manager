# Karen Bot 要件定義書（v1）

## 🧭 プロジェクト全体の目的

本プロジェクトは、Discord上で動作する自然言語ベースのスケジュール管理ボット「Karen（カレン）」を開発することを目的とする。
ユーザーは自然な文章でスケジュールの参照・登録・変更などを依頼でき、Google カレンダー上に反映される。将来的には複数のタスク系Bot（たすくん／きろくん／とうこちゃん）との連携を前提に、共通フレームワークによる再利用性・拡張性を重視する。

## 🎯 Karen Bot で実現したいこと

### ✨ 機能要件
- Discord 上でメンションを通じた自然言語指示を受け取る
- 以下のスケジュール操作を実行可能にする：
  - スケジュールの参照（例：「来週の予定教えて」）
  - スケジュールの追加（例：「明日14時に会議いれて」）
  - スケジュールの削除
  - スケジュールの変更
  - リマインドの設定／実行
- Google カレンダー API に連携（対象カレンダーは以下）：
  - あなたの個人カレンダー（予定色分け運用中）
  - イベント用サブカレンダー（STORES連携あり）
- ワークフロー判定・自然言語応答は LLM によって処理
- LLMへの指示（プロンプト）とワークフロー定義は外部 YAML で管理

### ✅ 非機能要件・設計指針
- natural-gaku-co の構成と命名規則にできるだけ準拠
- 将来的な Google A2A プロトコル対応を見据える
- 他Bot（たすくん、きろくん等）にも展開可能な共通フレームを採用
- LLM依存を抽象化し、後からプロンプト差し替えやマルチモデル対応が可能な設計


## 🧱 ディレクトリ構造案
```
karen-bot/
├── src/
│   ├── discord/           … Discordクライアント・メッセージハンドラ
│   ├── context/           … 発話者／チャンネル情報・状態の管理
│   ├── calendar/          … Google Calendar API操作（CRUD）
│   ├── workflow/          … 意図分類／ワークフロー選定と実行
│   └── utils/             … ユーティリティ（日付変換など）
│
├── config/
│   ├── config.yaml             … モデル設定、Bot識別子、温度など
│   ├── room_rules.yaml        … メンション等の応答ルール
│   ├── prompt_styles.yaml     … 応答スタイル（共感、事務的など）
│   ├── workflows.yaml         … ワークフロー定義
│   ├── character.yaml         … カレンの人格・話し方
│   └── system_prompts/
│       ├── add_schedule.md
│       ├── get_schedule.md
│       ├── delete_schedule.md
│       └── modify_schedule.md
│
├── tests/                … 単体テスト群
├── .env.example          … 環境変数テンプレ（Discordトークン、Google APIキーなど）
├── package.json
├── tsconfig.json
└── README.md
```


## 🔄 処理フロー（情報の流れ）
```
[User Message in Discord]
    ↓
[src/discord/] メッセージ受信 & メンション検出
    ↓
[src/workflow/] LLMにより意図判定 → workflows.yamlを参照
    ↓
[src/calendar/] 対象カレンダーに対してスケジュール操作（API）
    ↓
[src/formatter/] 応答文生成（LLMまたはテンプレート）
    ↓
[src/discord/] Discordへ返信
```


## 📌 将来的な拡張方針
- Google A2Aプロトコル対応を通じて、Bot間の意図・ステータスの共有を可能に
- `karen-bot` で確立した共通フレームワークを `taskun-bot`（タスク管理）、`kirokun-bot`（議事録・タスク抽出）、`toukochan-bot`（SNS支援）に展開
- LLM切り替えやエージェント協調の実験環境としても応用可能

---

この構成をもとに、Cursor等の開発環境に展開し、順次機能追加していく。
