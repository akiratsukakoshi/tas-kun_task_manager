# tas-kun Bot Migration — Detailed Work Instruction (v2)

> **For:** Cursor / LLM agents  
> **Priority:** Machine‐readable, deterministic.  
> **Rule:** If ambiguity exists, ask user. Otherwise perform steps exactly.

---

## 0. Source & Target

| Key | Value |
|-----|-------|
| Source Repo | `akiratsukakoshi/karen-calendar-bot` (`main`) |
| Target Repo | New: `tas-kun` (mono‐repo root) |
| Goal | Transform calendar bot into **Supabase-backed task manager** while preserving LLM workflow selection logic. |

---

## 1. Directory Migration Map

### 1.1 Top–Level Layout (mono-repo)

```
tas-kun/
├── apps/
│   ├── bot/          # migrated & renamed from karen root
│   └── ui/           # Next.js app (created later)
├── packages/
│   └── shared/       # shared types + utils
├── supabase/         # schema.sql, seed.sql
└── ...
```

### 1.2 Detailed Mapping (bot)

| Old Path (karen) | Action in tas-kun (apps/bot) |
|------------------|------------------------------|
| `src/discord/**` | **Keep** (rename only) |
| `src/reminder/**` | Keep → **replace calendar queries with Supabase cron** |
| `src/calendar/**` | **Delete** |
| `src/workflow/intentClassifier.ts` | **Modify** (task intents) |
| `src/workflow/workflowExecutor.ts` | **Modify** (task CRUD) |
| `src/workflow/eventSelector.ts` | Delete |
| `src/workflow/conversationContext.ts` | Review; delete if unused |
| `src/formatter/responseFormatter.ts` | Modify for task lists |
| `src/utils/dateUtils.ts` | Optional; keep if used for recurrence |
| `src/utils/yamlLoader.ts` | Optional; keep for YAML-driven config |
| `tests/**` | **Remove** (tests to be rewritten) |
| `config/system_prompts/*` | Replace with task prompts (`add_task.md`, etc.) |

---

## 2. Migration Steps (ordered)

### 2.1 Repository Duplication

```bash
# outside script
git clone https://github.com/akiratsukakoshi/karen-calendar-bot karen
cp -R karen tas-kun
cd tas-kun && git remote remove origin
git init && git add . && git commit -m "initial copy from karen"
```

### 2.2 Rename References

* Replace tokens:  
  * **Karen** → **TasKun** (case sensitive)  
  * **calendar** → **task** where relevant
* Update package name in `package.json`.

### 2.3 Character & Prompt

* `config/character.yaml` → new persona "tas-kun": disciplined task manager.
* `config/prompt_styles.yaml` → adjust tone.
* System prompt MD files:  
  * `add_task.md`, `get_tasks.md`, `update_task.md`, `complete_task.md`

### 2.4 Supabase Integration

1. **Add** `src/db/supabaseClient.ts` using `@supabase/supabase-js`.
2. **Create** `src/services/task.service.ts` with CRUD (`insert`, `list`, `updateStatus`).
3. Env: `.env.example` → add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

### 2.5 Workflow Layer Refactor

* **intentClassifier.ts**  
  * Replace calendar intents with task intents list (`add_task`, `list_task`, `update_task`).
  * Keep existing LLM call pattern.

* **workflowExecutor.ts**  
  * Route intents to `TaskService` methods.

* **workflows.yaml**  
  * Define YAML mapping of intent → executor function.

### 2.6 Reminder System

* `reminder/reminderScheduler.ts`  
  * Change source: query Supabase for tasks where `due_date <= now() + interval 'X' AND status != '完了'`.

### 2.7 Discord Token

* `.env`: `DISCORD_BOT_TOKEN_TAS_KUN`

### 2.8 Clean Up Unused

* Remove calendar-specific utils, event selector, tests.

### 2.9 Lint / Build

```bash
pnpm install
pnpm lint
pnpm build
```

---

## 3. Tasks Checklist (Cursor)

```yaml
tasks:
  - id: repo.copy
    cmd: copy karen to tas-kun (see 2.1)

  - id: rename.tokens
    cmd: replace "Karen"→"TasKun"; "Calendar"→"Task" in code, comments, filenames.

  - id: character.prompts
    files:
      - config/character.yaml
      - config/prompt_styles.yaml
      - config/system_prompts/*.md
    desc: overwrite with task-manager persona + prompts.

  - id: supabase.client
    create: src/db/supabaseClient.ts
    template: supabase-js v2 client (service role env)

  - id: service.task
    create: src/services/task.service.ts
    spec: CRUD using tables {projects,categories,tasks,task_assignees,users}

  - id: workflow.intent
    modify: src/workflow/intentClassifier.ts
    desc: replace calendar intents with task intents.

  - id: workflow.exec
    modify: src/workflow/workflowExecutor.ts
    desc: call TaskService.

  - id: reminder.supabase
    modify: src/reminder/reminderScheduler.ts
    desc: fetch tasks due soon.

  - id: env.update
    add: DISCORD_BOT_TOKEN_TAS_KUN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

  - id: cleanup
    delete:
      - src/calendar
      - src/workflow/eventSelector.ts
      - tests/*
```

---

## 4. Post-Migration Validation

1. `pnpm dev` → Bot connects to Discord.
2. Slash command `/task add "テスト" due:2025-05-31` returns OK.
3. `/task list` shows inserted task.
4. Reminder cron sends message for upcoming due tasks.

---

## 5. Next (UI Phase — separate spec)

* After bot stable, initialise `apps/ui` per UI spec (see v1).

---