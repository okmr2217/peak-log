# Peak Log — セッション引き継ぎドキュメント

> 最終更新: 2026-03-17
> バージョン: 0.3.0
> このドキュメントは次の AI セッションで開発を継続するための完全なコンテキストです。

---

## 1. プロダクトコンセプト

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
| 振り返りが楽しい | History で自分のピーク体験が一覧できる |

---

## 2. コア概念

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

## 3. 記録フロー（主導線）

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

## 4. UI 文言トーン

| 概念 | UI 文言 |
|------|---------|
| Reflection | 余韻 |
| Add reflection | 余韻を追加 |
| History | 記録 |
| Recent logs | 最近のピーク |
| Quick log | ピークを記録 |
| Empty state (Home) | 最初の活動を作ろう |
| Empty state (History) | 最初のピークを記録しよう |

---

## 5. 現在の実装状態（v0.3.0）

### 実装済み画面

| パス | 画面 | 主な機能 |
|------|------|---------|
| `/login` | ログイン・登録 | email/password 認証（Better Auth） |
| `/` | Home | Activity グリッド・クイックログ・最近の5件 |
| `/activities` | Activity 管理 | 一覧・作成・編集・並び替え・アーカイブ |
| `/activities/[id]` | Activity 詳細 | 統計・最近のログ一覧 |
| `/history` | History（日次） | 日別ログ表示・余韻追加・削除 |
| `/history/stats` | 月次統計 | 月別集計・上位 Activity・ピークログ |
| `/settings` | 設定 | メール表示・パスワード変更・ログアウト |

### 実装済み機能

- Activity 管理（作成・編集・並び替え・アーカイブ）
- Quick Log（Home からワンタップ記録）
- `performedAt` 入力フロー（当日・前日・カレンダー・時刻 Popover）
- Reflection（余韻）追加・編集（1 ログにつき 0 or 1）
- History 日次表示（日付・曜日・土日祝色分け）
- History 日別詳細（モバイル: Sheet / PC: Modal）
- 月次統計（月ナビ・集計・ピークログ）
- Activity 詳細統計（累計回数・最終実施日）
- PWA manifest 設定（service worker は未実装）
- バージョン管理・CHANGELOG

### v0.1〜v0.3 の変遷

| バージョン | 主な内容 |
|-----------|---------|
| 0.1.0 | MVP リリース（Activity 管理・Quick Log・Reflection・History） |
| 0.2.0 | History を日次主導線に変更・Activity 統計ページ追加・UI 強化 |
| 0.3.0 | performedAt 入力 UI 改善・デザイン刷新（グラデーション・グロー）・PWA |

---

## 6. 技術スタック

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

## 7. アーキテクチャ

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

## 8. フォルダ構成

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
│   │       ├── history/
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
│   └── handoff.md                 # このファイル
├── CLAUDE.md                      # Claude 向け開発ルール
└── CHANGELOG.md
```

---

## 9. DB スキーマ（要点）

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

## 10. デザインシステム

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

## 11. 未実装・今後の候補

### 短期（UX 改善）

| 機能 | 概要 | 優先度 |
|------|------|--------|
| **デフォルト Activity 自動作成** | 新規ユーザー登録時に初期 Activity（💪筋トレ等）を自動作成 | 高 |
| **日毎の空白日表示** | ログがない日も History に表示（連続性の可視化） | 中 |
| **Activity 統計の充実** | 累計数・最終実施日・平均間隔を Activity 詳細・一覧に表示 | 中 |

### 中期（機能拡張）

| 機能 | 概要 |
|------|------|
| カレンダー表示 | History をカレンダー形式で表示 |
| タグ | Log や Activity にタグを付与して絞り込み |
| 画像添付 | Log に写真を添付 |
| データエクスポート | CSV / JSON エクスポート |
| アカウント削除 | 設定からアカウントと全データを削除 |

### 長期（将来構想）

| 機能 | 概要 |
|------|------|
| AI 振り返り | ログを元に AI が振り返りコメント生成 |
| Peakランキング | 最もエネルギーが高かった体験のランキング |
| Service Worker / オフライン | PWA 強化 |

---

## 12. 技術ブログ記事について

- ブログ: https://paritto-dev-diary.vercel.app/
- Peak Log の紹介記事を執筆予定
- Next.js 15 App Router + Better Auth + Prisma + Supabase の構成紹介
- ピーク体験記録というプロダクト思想の説明
- 将来的に機能追加のたびに記事を追加する構成が理想

---

## 13. 開発ルール（抜粋）

詳細は `CLAUDE.md` を参照。

- **シンプルを優先**：不要な抽象化・ライブラリ追加をしない
- **サーバーコンポーネント優先**：Client Component は必要な場合のみ
- **セキュリティ最優先**：全クエリに userId フィルタ
- **コミットメッセージは日本語**（`feat:`, `fix:`, `refactor:`, `chore:` プレフィックス）
- **Prettier printWidth = 120**（`prettier --write` でフォーマット）

---

## 14. 現在の積み残し・注意点

- `components/ui/popover.tsx` が git 未追跡（`??` 状態）→ 次のコミット時に追加が必要
- `package.json` / `package-lock.json` に未コミットの変更あり
- `.claude/settings.json` に変更あり（`.gitignore` 対象のため追跡外）
- `docs/spec.md` は存在しない（`CLAUDE.md` に spec の役割が統合されている）

---

## 15. 次のセッションで相談したいこと

1. **デフォルト Activity 自動作成**の実装方法（Better Auth フック or 初回ログイン検出）
2. **日毎の空白日表示**：History に記録のない日も表示する UI 設計
3. **Activity 統計**：平均間隔の計算ロジックと表示場所
4. **技術ブログ記事**の構成と執筆

---

> このドキュメントは開発が進むたびに更新すること。
