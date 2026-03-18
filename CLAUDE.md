# Peak Log

ピーク体験を記録・振り返るログアプリ。Next.js 15 App Router + Better Auth + Prisma + Supabase。

---

<!-- ▼ プロジェクト固有（このプロジェクト専用の設定） ▼ -->

## Tech Stack

- Next.js 15 (App Router) / React 19 / TypeScript
- Prisma 6 / Supabase PostgreSQL
- Better Auth 1.5
- Tailwind CSS 3 / Radix UI / Lucide React
- Zod 4 / dayjs / date-fns / Sonner

## コマンド

```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run lint         # ESLint
npx tsc --noEmit     # 型チェック
npx prisma migrate dev   # マイグレーション
npx prisma studio        # DB GUI
npx prettier --write .   # フォーマット（printWidth: 120）
```

## コーディングルール

- TypeScript strict mode。`any` 禁止
- サーバーコンポーネント優先。Client Component は必要最小限に
- DB アクセスはサーバーのみ（Client から Prisma を呼ばない）
- すべてのクエリに `userId` フィルタを必ず含める
- Server Actions は Zod でバリデーション、Better Auth でセッション確認
- named export を使用（default export は page.tsx のみ）
- Tailwind CSS のみ使用。カスタム CSS ファイルは作らない

## プロダクト前提

- プロダクト名: Peak Log
- 文言トーン: 「ピーク」「余韻」「記録」
- Reflection の UI 名は「余韻」
- Home が主導線。クイックログ後に「余韻を追加」
- アーカイブ済み Activity は Home に表示しない
- Activity の物理削除は MVP ではしない
- ソーシャル機能・外部公開は禁止

## デザインシステム

- Primary: `#7C4DFF` / Accent: `#00E5FF` / Background: `#0A0A0A` / Card: `#1A1A1A`
- Activity ごとのカラーをグラデーション・グローで反映
- アイコンは lucide-react のみ

## やらないこと

- 不要な抽象化・ライブラリ追加
- コードコメント・docstring の追加（変更していないコードへ）
- エラーハンドリングの過剰追加（起こりえないケースへの対処）
- リファクタリング・整理（明示的に依頼されていない場合）
- 機能フラグ・後方互換シムの追加

---

<!-- ▼ 汎用ルール（他プロジェクトでも同じ） ▼ -->

## Git ワークフロー

- コミットメッセージは日本語: `feat: ○○を実装` / `fix: ○○を修正`
- プレフィックス: `feat:` / `fix:` / `refactor:` / `chore:` / `docs:` / `test:` / `style:`
- 1つの論理的変更 = 1コミット
- コミット前に `npx tsc --noEmit && npm run lint` を実行

## セッション管理

- **開始時**: `docs/handoff.md` を読んで現状を把握する
- **終了時**: 以下を実行する
  1. `npx tsc --noEmit && npm run lint` を実行して問題なければコミット
  2. `docs/session-log.md` の先頭にセッション記録を追記（やったこと・改善案・失敗・技術メモ・次にやりたいこと）
  3. `docs/handoff.md` を更新する（実装状態・積み残し・次回相談事項）
- **コンテキスト 60% 到達時**: session-log.md と handoff.md を更新してから `/compact`

---

## 参照ドキュメント

- @docs/handoff.md（現在の実装状態・積み残し・次にやること）
- @docs/session-log.md（セッション作業記録）
- @CHANGELOG.md
- @docs/project.md（プロジェクト概要・技術設計・アーキテクチャ ※必要な時だけ参照）
- @docs/decisions.md（設計判断の記録 ※設計に関わる作業時に参照）
- @docs/versioning.md（バージョン更新作業ガイド ※バージョン更新時に参照）
