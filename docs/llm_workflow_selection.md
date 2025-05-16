# LLMの判断によるworkflow選択＆実行モデル

## 概要
このドキュメントは、LLM（大規模言語モデル）を活用したワークフロー選択・実行の設計と実装についてまとめたものです。専門型ボットや自然言語インターフェースの設計において、LLMの役割と情報の流れ、拡張方法を明確にします。

---

## 1. 情報の流れとLLMの関与ポイント

### ユーザー指示からワークフロー実行・返答までの流れ

1. **ユーザーが自然言語で指示を送信**
2. **インテント判定**
   - `src/workflow/intentClassifier.ts` でLLMにより「add_schedule」「get_schedule」「delete_schedule」「modify_schedule」などのワークフローを判定
3. **ワークフローごとの実行分岐**
   - `src/workflow/workflowExecutor.ts` でインテントに応じた処理に分岐
4. **必要情報の抽出**
   - 予定のタイトル・日時・内容など、ワークフロー実行に必要な情報をLLM（`extractEventInfoWithLLM`）で抽出
   - 抽出できなければ「もう少し詳しくご指定下さい」とフォールバック
5. **仮説確認フロー**
   - 抽出した内容を「この内容でよろしいですか？」とユーザーに確認
   - ユーザーが修正指示を出した場合は再度LLMで抽出・再確認
   - 「はい」「お願いします」等で確定
6. **ワークフロー実行**
   - 予定の追加・変更・削除などを実行し、結果を返答

#### LLMが関与する主なポイント
- インテント判定（どのワークフローか）
- 必要情報の抽出（タイトル・日時など）
- 仮説確認時の修正指示の再抽出

---

## 2. 関連ファイル・ディレクトリ

- `src/workflow/intentClassifier.ts` … インテント判定（LLM）
- `src/workflow/workflowExecutor.ts` … ワークフロー実行のメインロジック
- `src/workflow/eventSelector.ts` … LLMによる情報抽出・ルート判定
- `src/workflow/conversationContext.ts` … 会話状態（pendingEvent等）の管理
- `src/formatter/responseFormatter.ts` … 返答フォーマット
- `src/llm/openaiClient.ts` … LLM（OpenAI API）呼び出し

---

## 3. ワークフロー追加時に修正すべきファイル一覧

1. **workflowExecutor.ts**
   - `switch`文に新しいワークフローのcaseを追加
   - 必要に応じて仮説確認・pendingEvent管理の分岐も追加
2. **eventSelector.ts**
   - LLM抽出プロンプトの拡張（新ワークフロー用の情報抽出）
   - ルート判定や情報抽出関数の追加
3. **formatter/responseFormatter.ts**
   - 新ワークフローの返答フォーマット追加
4. **llm/openaiClient.ts**
   - 必要に応じてLLM呼び出しの拡張
5. **config/workflows.yaml**
   - 新しいワークフローの定義・説明・ステップを追加
6. **config/system_prompts/**
   - 新しいワークフロー用のシステムプロンプトMarkdownファイルを追加

---

## 4. フォールバック設計のポイント
- LLMで情報抽出できなかった場合は「内容を抽出できませんでした。もう少し詳しくご指定下さい」と返す
- 仮説確認フローで修正指示が来た場合は再度LLM抽出→再確認
- pendingEventが確定したら必ずクリア

---

## 5. 参考：今後の拡張例
- より複雑なワークフローや専門型ボットへの展開
- LLMプロンプトの最適化・多言語対応
- セッション管理の高度化（ユーザーごと・複数同時会話対応）

--- 