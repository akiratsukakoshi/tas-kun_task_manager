# tas-kun 移行作業プラン

本ドキュメントは、karen-calendar-bot から tas-kun への移行作業の全体フローを示します。

---

## 1. ディレクトリ再編・初期セットアップ

- **mono-repo構造へ再編**
  - `tas-kun/`直下に`apps/bot/`を作成し、現状の`src/`・`config/`・`package.json`等を`apps/bot/`配下へ移動。
  - `apps/ui/`（Next.js）は後工程。
  - `packages/shared/`、`supabase/`ディレクトリを新規作成（必要に応じて）。

## 2. 不要ファイル・ディレクトリの削除

- `src/calendar/`（Googleカレンダー連携）→ **削除**
- `src/workflow/eventSelector.ts` → **削除**
- `tests/`配下 → **削除**
- その他、カレンダー専用utilsや型定義（`dateUtils.ts`等）も不要なら削除

## 3. リネーム・トークン置換

- コード・コメント・ファイル名内の
  - `Karen` → `TasKun`
  - `Calendar` → `Task`（該当箇所のみ）
- `package.json`のパッケージ名も`tas-kun`へ

## 4. キャラクター・プロンプト・設定ファイル修正

- `config/character.yaml` → タスク管理者「tas-kun」キャラに書き換え
- `config/prompt_styles.yaml` → 口調・トーンを調整
- `config/system_prompts/` →  
  - `add_task.md`, `get_tasks.md`, `update_task.md`, `complete_task.md`を新規作成または既存プロンプトを置換
- `config/workflows.yaml` → タスク操作用ワークフローに修正

## 5. Supabase連携の実装

- `src/db/supabaseClient.ts`を新規作成（`@supabase/supabase-js` v2でサービスロールキー利用）
- `src/services/task.service.ts`を新規作成（CRUD: `projects`, `categories`, `tasks`, `task_assignees`, `users`テーブル操作）
- `.env.example`に`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`を追加

## 6. ワークフロー層のリファクタ

- `src/workflow/intentClassifier.ts`  
  - カレンダー用intentをタスク用intent（`add_task`, `list_task`, `update_task`等）に置換
- `src/workflow/workflowExecutor.ts`  
  - intentに応じて`TaskService`のCRUDを呼び出すよう修正
- `config/workflows.yaml`  
  - intent→executorのマッピングをタスク用に修正

## 7. リマインダーのSupabase化

- `src/reminder/reminderScheduler.ts`  
  - Supabaseから「期限が近い未完了タスク」を取得しリマインドするよう修正

## 8. 環境変数の整理

- `.env`/`.env.example`に`DISCORD_BOT_TOKEN_TAS_KUN`、`SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`を追加

## 9. クリンナップ・最終調整

- カレンダー専用utilsや未使用ファイルの削除
- Lint/buildの実行（`pnpm lint`, `pnpm build`）

---

### 補足

- **移動/削除/新規作成の順序**は、まずディレクトリ再編・不要物削除→リネーム→新規実装/修正→最終調整の流れが推奨です。
- **Supabaseスキーマ**や`packages/shared/`の型定義は、必要に応じて`supabase/`ディレクトリに`schema.sql`等を追加してください。
- **UI（apps/ui）**はbot安定後に着手。

---

このプランに従い、tas-kun仕様への移行を進めてください。 