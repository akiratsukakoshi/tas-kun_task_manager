# Karen Bot 開発状況（2024年5月時点）

## 1. 実装ステータス概要

- **Discord連携**：ボットがサーバーに常駐し、コマンド受付・応答が可能。
- **Googleカレンダー連携**：API経由で予定取得・出力が可能。
- **予定出力**：予定リストをDiscordに出力（フォーマットや日付認識に課題あり）。
- **コマンド体系**：基本的な予定取得コマンドは動作。

---

## 2. ディレクトリ・ファイルごとの活用状況

### src/
- **bot.ts**：エントリーポイント。活用中。
- **discord/discordGateway.ts**：Discord連携の主要ロジック。活用中。
- **calendar/googleCalendarClient.ts, calendarService.ts**：GoogleカレンダーAPI連携・抽象化。活用中。
- **workflow/intentClassifier.ts, workflowExecutor.ts**：意図判定・ワークフロー分岐。活用中。
- **utils/dateUtils.ts, yamlLoader.ts**：日付変換・YAML読込。活用中。
- **formatter/**：未実装（応答フォーマット生成用ディレクトリ。今後実装予定）。
- **context/**：未実装（ユーザー・チャンネル状態管理。今後実装予定）。

### config/
- **config.yaml, room_rules.yaml, prompt_styles.yaml, workflows.yaml, character.yaml**：全て存在し、基本設定・ルール・プロンプト・ワークフロー・人格定義に活用中。
- **system_prompts/**：add/get/delete/modify 各種プロンプトMarkdownが存在し、活用中。

### tests/
- **tests/**：空ディレクトリ。テスト未実装。

### docs/
- **karen-bot-requirement.md, structure-plan.md**：要件・構造ドキュメント。活用中。
- **DEV_STATUS.md（本ファイル）**：開発状況まとめ。

---

## 3. ダミー/未実装・今後必要なもの

- **src/formatter/**
  - 応答文のフォーマット統一・整形ロジック（例：responseFormatter.ts）
- **src/context/**
  - ユーザー・チャンネル状態管理（例：contextManager.ts）
- **tests/**
  - 各モジュールの単体テスト
- **出力フォーマットの改善**
  - 日付・時刻の表示統一、見やすいレイアウト
- **日付認識の精度向上**
  - タイムゾーン・パース処理の見直し
- **エラーハンドリング**
  - APIエラーや予定なし時の応答強化
- **コマンド体系の整理**
  - 期間指定やユーザー指定などの拡張
- **UI/UX向上**
  - Discord Embed対応、ボタン・リアクション操作

---

## 4. ネクストステップ

1. **出力フォーマットの改善**（formatter/ 実装）
2. **context/ の実装**（ユーザー・チャンネル状態管理）
3. **日付認識・タイムゾーン処理の強化**
4. **コマンド体系の整理・拡張**
5. **エラーハンドリング強化**
6. **テスト実装**（tests/ 配下）
7. **UI/UX向上（Embed等）**

---

> 本ファイルは2025年5月8日時点の開発状況をまとめたものです。進捗・課題・TODOを随時更新してください。 