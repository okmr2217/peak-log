# Peak Log — プロジェクト概要

> このドキュメントはプロジェクトの安定した情報（コンセプト・技術設計・アーキテクチャ）を記録する。
> 変化が少ない情報をここに集約し、handoff.md を「現在地」専用に保つ。

---

## プロダクトコンセプト

Peak Log は **自分を高揚させる体験を記録するログアプリ**。

習慣管理・自己改善ではなく、

- 筋トレ完了の達成感
- 勉強の集中できた時間
- 楽しかったイベント
- デートや友達との時間

こういった **ピーク体験をその瞬間に記録し、後から振り返る** ことが目的。

### 思想

| 思想 | 内容 |
|------|------|
| 記録は軽く | Activity タップ一回でログが作れる |
| 余韻は後から | Reflection（余韻）は後から任意で追加できる |
| 振り返りが楽しい | Home のタイムラインで自分のピーク体験を一覧できる |

---

## コア概念

| 概念 | 説明 | 例 |
|------|------|-----|
| **Activity** | 何をしたかの種類（ユーザー定義） | 💪筋トレ、📚勉強、❤️デート |
| **Log** | いつ何をしたかの事実 | 筋トレ @ 2026-03-14 19:10 |
| **Reflection（余韻）** | 体験の感想・評価（任意・後追い可） | 高揚度5、達成感4、またやりたい |

### Reflection の項目

- `excitement`（高揚度 1〜5）
- `achievement`（達成感 1〜5）
- `wantAgain`（またやりたい boolean）
- `note`（メモ、最大 200 文字）

---

## 記録フロー（主導線）

```
Home
↓
Activity をタップ
↓
Log 作成（performedAt を入力、デフォルト = now）
↓
「余韻を追加」導線（任意）
↓
Reflection 入力
```

---

## UI 文言トーン

| 概念 | UI 文言 |
|------|---------|
| Reflection | 余韻 |
| Add reflection | 余韻を追加 |
| Recent logs | 最近のピーク |
| Quick log | ピークを記録 |
| Empty state (Home) | 最初の活動を作ろう |
| Empty state (History) | 最初のピークを記録しよう |

---

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 15（App Router）|
| UI ライブラリ | React 19 |
| 言語 | TypeScript |
| ORM | Prisma 6 |
| DB | Supabase PostgreSQL |
| 認証 | Better Auth 1.5 |
| スタイリング | Tailwind CSS 3 |
| バリデーション | Zod 4 |
| 日付処理 | dayjs / date-fns |
| アイコン | Lucide React |
| Toast | Sonner |
| UI プリミティブ | Radix UI（Dialog・Popover・AlertDialog 等） |
| カレンダー | react-day-picker |
| 絵文字ピッカー | emoji-picker-react |

---

## アーキテクチャ

```
Client Components（モーダル・フォーム）
   ↓ Server Actions
Server Actions（認証・バリデーション・DB書き込み）
   ↓ Prisma
Supabase PostgreSQL

Server Components（ページ・一覧）
   ↓ Server Queries
Server Queries（読み取り専用）
   ↓ Prisma
Supabase PostgreSQL
```

### 鉄則

- DB アクセスはサーバーのみ（Client から Prisma を呼ばない）
- すべてのクエリに `userId` フィルタを必ず含める
- Server Actions は Zod でバリデーション、Better Auth でセッション確認

---

## フォルダ構成

```
peak-log/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── (auth)/login/
│   │   └── (protected)/
│   │       ├── layout.tsx
│   │       ├── page.tsx           # Home
│   │       ├── activities/
│   │       ├── monthly/
│   │       └── settings/
│   ├── components/
│   │   ├── activity/
│   │   ├── log/
│   │   ├── reflection/
│   │   ├── history/
│   │   ├── layout/
│   │   └── ui/                    # shadcn 風プリミティブ
│   ├── lib/
│   │   ├── auth.ts / auth-client.ts / session.ts
│   │   ├── prisma.ts
│   │   ├── date-utils.ts
│   │   ├── action-result.ts
│   │   └── utils.ts
│   └── server/
│       ├── actions/               # 書き込み系 Server Actions
│       ├── queries/               # 読み取り系クエリ
│       └── validators/            # Zod スキーマ
├── prisma/schema.prisma
├── docs/
│   ├── project.md                 # このファイル（安定情報）
│   ├── handoff.md                 # 現在地・積み残し（毎回更新）
│   ├── session-log.md             # セッション作業記録
│   └── versioning.md              # バージョン更新ガイド
├── CLAUDE.md                      # Claude 向け指示書
└── CHANGELOG.md
```

---

## DB スキーマ（要点）

```prisma
model Activity {
  id        String  @id @default(cuid())
  userId    String
  name      String
  emoji     String?
  color     String?
  sortOrder Int     @default(0)
  isArchived Boolean @default(false)
  logs      Log[]
}

model Log {
  id          String     @id @default(cuid())
  userId      String
  activityId  String
  performedAt DateTime
  reflection  Reflection?
}

model Reflection {
  id          String  @id @default(cuid())
  userId      String
  logId       String  @unique
  excitement  Int?    // 1〜5
  achievement Int?    // 1〜5
  wantAgain   Boolean @default(false)
  note        String?
}
```

### 重要な設計判断

- Activity の物理削除は MVP では行わない（Log が紐づくため）
- アーカイブ済み Activity は Home に表示しない
- Reflection は 1 Log につき 0 か 1（upsert パターン）
- Log の `performedAt` は作成時刻と分離（過去日時も入力可）

---

## デザインシステム

| 要素 | 値 |
|------|-----|
| Primary | `#7C4DFF`（紫） |
| Accent | `#00E5FF`（シアン） |
| Background | `#0A0A0A`（ほぼ黒） |
| Card | `#1A1A1A`（ダークグレー） |

- Activity ごとにカラーを持ち、LogCard・ActivityButton にグラデーション・グローで反映
- Tailwind CSS のみ使用（CSS-in-JS なし）
- アイコンは lucide-react のみ
- Prettier の printWidth は 120

---

## 技術ブログ

- ブログ: https://paritto-dev-diary.vercel.app/
- Peak Log の紹介記事を執筆予定
- Next.js 15 App Router + Better Auth + Prisma + Supabase の構成紹介
- 将来的に機能追加のたびに記事を追加する構成が理想
