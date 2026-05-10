# Peak Log リファクタリング候補

調査日: 2026-05-10
対象: `app/`, `components/`, `server/`, `lib/`, `hooks/`, `types/`, `prisma/`
方針: コードは変更せず、観点ごとに「場所 / 問題 / リスク / 修正コスト / 効果」を一覧化する。

---

## 1. 重複コード

### 1-1. `CreateLogModal` と `EditLogModal` がほぼ完全な双子
- 場所: `components/log/create-log-modal.tsx` (353行) / `components/log/edit-log-modal.tsx` (313行)
- 問題: 日付モード pill (`["today","yesterday","other"]`)、`DayPicker` 設定、`TIME_OPTIONS` セレクト、カスタムフィールド表示、メモ＋スター、`getPerformedAt()` 関数まで同一。差分は初期値とサブミット先 (`createLog` / `updateLog`) のみ。
- リスク: 一方だけバグ修正・スタイル変更されて UI が乖離する（実際 `EditLogModal` だけキャンセル/保存ボタンが二段、`CreateLogModal` は単一ボタンといった差が既にある）。
- 修正コスト: **L**（共通フォーム `LogForm` を切り出して両方から呼ぶ。Stars / DateModePicker / FieldValuesEditor をサブコンポーネントへ分解）
- 効果: **L**（〜400行を半分以下に圧縮、回帰防止に直結）

### 1-2. `ActivityCreateModal` と `ActivityEditModal` の入力フォームが重複
- 場所: `components/activity/activity-create-modal.tsx` / `components/activity/activity-edit-modal.tsx`
- 問題: `PRESET_COLORS` 配列（12色）、名前・絵文字・カラー・説明の同一フォーム、ヘッダー、保存ボタンが二重定義。
- リスク: カラー追加時に片方忘れる、Edit には FieldEditor が乗っているため発見しづらい。
- 修正コスト: **M**（`ActivityFormFields` を切り出す）
- 効果: **M**

### 1-3. ログ表示カードが 3 種類乱立
- 場所: `components/history/timeline-item.tsx` / `components/log/log-card.tsx` / `components/home/compact-timeline.tsx` の `CompactLogChip`
- 問題: いずれも `cardStyle = { background: radial-gradient(${color}1A...) , borderColor: ${color}38, boxShadow: ... }` 系のスタイル + activity emoji バッジ + Stars 列を再実装。`log-card.tsx` は誰からも import されておらず（後述 6-1）、`timeline-item.tsx` のサブセット。
- リスク: 表示の細かいズレ。`log-card.tsx` を消し損ねて新規開発者が混乱する。
- 修正コスト: **M**
- 効果: **M**

### 1-4. Stars 1〜5 のレンダリングが 5 箇所に散在
- 場所: `create-log-modal.tsx:312`, `edit-log-modal.tsx:265`, `timeline-item.tsx:54`, `log-card.tsx:94`, `log-detail-modal.tsx:67`
- 問題: `[1,2,3,4,5].map` + `<Star className=...>` + `fill: "#FBBF24"` のパターンを毎回手書き。`#FBBF24` 直書きが各所に散る。
- 修正コスト: **S**（`<StarRow value={n} editable onChange={...} />` を 1 個作る）
- 効果: **M**（編集 UI の動きを一括で揃えられる）

### 1-5. トースト通知が二系統並存
- 場所: 共通 `components/ui/sonner.tsx`（`Toaster` を `app/layout.tsx` でマウント済）／ 独自実装 `components/log/home-fab.tsx`、`components/activity/activity-grid.tsx`
- 問題: `sonner` の `toast` が利用できる状態なのに、`HomeFab` などは `useState<Toast>` + setTimeout で自前トーストを画面に描画。
- リスク: アクセシビリティ・スタイル不一致、トーストが重なる。
- 修正コスト: **S**
- 効果: **M**

### 1-6. `formatLastPerformed*` 系の同一関数が 2 ファイルに
- 場所: `components/activity/activity-detail.tsx:14` (`formatLastPerformedAt`) / `components/activity/activity-item.tsx:20` (`formatLastPerformedShort`)
- 問題: 中身は同じ「今日 / 昨日 / N日前 / M/d」分岐。`lib/date-utils.ts` に集約すべき内容。
- 修正コスト: **S**
- 効果: **S**

### 1-7. `LogEditedPayload` 型が 7 ファイルで再定義
- 場所: `timeline-list.tsx:7`, `timeline-item.tsx:12`, `log-card.tsx:23`, `log-card-menu.tsx:38`, `edit-log-modal.tsx:37`, `compact-timeline.tsx:28`, `activity-detail.tsx:30`
- 問題: `{ newDate: Date; stars: number | null; note: string | null; fieldValues: Record<string, string | string[]> | null }` を毎回手で書いている。
- リスク: フィールド追加時にすべての署名を直す必要があり、漏れると型エラーが波及する。
- 修正コスト: **S**（`server/queries/log.ts` あたりに `LogEditedPayload` を export）
- 効果: **M**

### 1-8. `Activity` / `ActivityField` のローカル型が量産
- 場所: `create-log-modal.tsx:18-32`, `edit-log-modal.tsx:17-22`, `home-content.tsx:13-19`, `home-fab.tsx:8-14`, `activity-grid.tsx:8-14`, `filter-fab.tsx:11`, `log-card-menu.tsx:21-30`, `log-field-values-preview.tsx:3-8`
- 問題: Prisma model の partial を独自 type alias にしているが、似て非なる定義（`isArchived` を含む/含まない、`description`の有無）が点在。
- 修正コスト: **M**（`server/queries/activity.ts` に `ActivityForLog`, `ActivityFieldDTO` 等の DTO を一元化）
- 効果: **M**

### 1-9. Prisma の field 用 `select` フラグメントが 3 箇所
- 場所: `server/queries/log.ts:136` (`ACTIVITY_FIELDS_SELECT`)、`server/actions/log.ts:20` (`ACTIVITY_FIELDS_SELECT`、形違い)、`server/queries/activity.ts:56` (`FIELD_SELECT`)、`server/actions/activity-field-queries.ts:7` (`FIELD_SELECT`)
- 問題: 名前は同じでも `isArchived` を含む/含まないの差で 4 通り。`server/queries/activity.ts` 内では `getActivitiesForCurrentUser` が `FIELD_SELECT` を経由せずインラインで再定義もしている。
- 修正コスト: **S**
- 効果: **S**

### 1-10. 月の境界計算が 2 箇所で同一実装
- 場所: `server/queries/log.ts:37-43`（`getMonthlySummaryForCurrentUser`）と `server/queries/log.ts:178-184`（`getMonthlyLogsForCurrentUser`）
- 問題: `yyyy-MM` 文字列から月初・翌月初を求めるコードがコピー。`lib/date-utils.ts` に `monthRange(month: string): { start: Date; end: Date }` を出すべき（ただし `getMonthlyLogsForCurrentUser` 自体が dead — 6-2）。
- 修正コスト: **S**
- 効果: **S**

### 1-11. ボトムシート系モーダルのレイアウトコピー
- 場所: `create-log-modal.tsx`（`px-6 pt-3 pb-6 sm:pb-5 sm:pt-5`）、`edit-log-modal.tsx`、`activity-create-modal.tsx`、`activity-edit-modal.tsx`、`log-detail-modal.tsx`、`filter-fab.tsx` など
- 問題: ヘッダー（`<X>` 閉じる）、Sticky フッター、`px-6 pt-3 sm:pt-5` のレイアウトトークンが各モーダルに直書き。`ResponsiveDialogHeader` / `ResponsiveDialogFooter` は定義済みだがどこからも使われていない（6-3）。
- 修正コスト: **M**
- 効果: **M**

---

## 2. 責務が大きすぎるファイル/関数

| ファイル | 行数 | 主な問題 |
|---|---|---|
| `components/log/create-log-modal.tsx` | 353 | 入力 state 7 個 + 日時計算 + サブミットを 1 コンポーネントで保持 |
| `server/queries/log.ts` | 349 | 月次サマリ／履歴／検索／カテゴリ統計／単発取得 が 1 ファイル。`getCategoryStatsForCurrentUser`, `getMonthlySummaryForCurrentUser` は集計ロジックを app 側で抱える |
| `components/log/edit-log-modal.tsx` | 313 | create-log-modal とほぼ同じ |
| `components/home/filter-fab.tsx` | 258 | 4 つの `useEffect` で props と local state を同期、`buildParams`/`updateUrl`/`handleClear` 等のロジックが密結合 |
| `components/activity/activity-edit-modal.tsx` | 225 | 活動編集 + フィールド編集 (CRUD UI) が同居 |
| `server/queries/activity.ts` | 209 | クエリ + DTO 型 + 集計まで全部入り |
| `server/actions/activity-field.ts` | 216 | CRUD 5 関数。Zod バリデーション + 所有権チェック + revalidate がコピペで並ぶ |

提案:
- `getCategoryStatsForCurrentUser` の Map 集計ループは Prisma `groupBy` に委譲できる（後述 8-1）
- `FilterFab` は `useFilterState(initial)` フックに状態を切り出すと宣言的になる
- `server/queries/log.ts` を `summary.ts` / `history.ts` / `category.ts` に分割可能

修正コスト: **M〜L**　効果: **M**

---

## 3. 型定義の重複・`any` の濫用

- `any` の使用: `grep -rn ": any\b" --include="*.ts" --include="*.tsx" .` でヒット 0 件。strict ルールは守られている。
- 重複型: 1-7、1-8 で列挙したとおり複数箇所で local 定義。**ここを潰すのが最大の改善ポイント**。
- `types/index.ts` は `export {};` のみ＝事実上空。ルール上「Zod スキーマから型推論」と書かれているが、共有 DTO の置き場が存在しない。
- 修正コスト: **S〜M**
- 効果: **M**

---

## 4. 古い書き方 / 不要 useEffect / Props バケツリレー

### 4-1. 「props を local state にコピーする」 useEffect が多い
- 場所:
  - `home-content.tsx:52-56`（`selectedActivityId, noteKeyword, fromDate, toDate` 変化で setIsLoading を解除）
  - `compact-timeline.tsx:91-93`（`initialItems` を都度 setDayItems）
  - `timeline-list.tsx:21-23`（同上）
  - `filter-fab.tsx:49-65`（4 個の `useEffect` で props を local に同期）
- 問題: React の典型的アンチパターン。`key` 属性で再マウントするか、props を直接使うべき。`HomeContent` は既に `key={...}` を `TimelineList` に渡しているため、`useEffect` は不要。
- 修正コスト: **S**
- 効果: **M**（バグの温床になりやすい）

### 4-2. クリック外検出を手書き
- 場所: `components/log/log-card-menu.tsx:54-63`
- 問題: `mousedown` リスナを自前管理。`@radix-ui/react-popover` が依存にあるので `Popover` か `DropdownMenu` (radix) で代替できる（タッチ・ESC・aria 対応も付いてくる）。
- 修正コスト: **S**
- 効果: **M**

### 4-3. Props バケツリレー: edit ペイロードが 4 階層を縦断
- 経路: `EditLogModal.onSaved` → `LogCardMenu.onLogEdited` → `TimelineItem.onLogEdited` → `TimelineList.handleLogEdited`
- 問題: 同じ payload 型 (1-7) を 4 つの署名で再宣言しながら受け流すだけ。
- 改善案: `useOptimisticLogs` のような hook、または `Context` 化。最低でも payload 型 1 箇所化。
- 修正コスト: **M**
- 効果: **M**

### 4-4. インラインスタイル多用 / 色直書き
- 場所: 全モーダル、`activity-button.tsx`, `home-fab.tsx`, `timeline-item.tsx` など
- 問題: `style={{ background: "linear-gradient(135deg, #7C4DFF 0%, #5533cc 100%)" }}` のリテラルが 6 箇所以上にコピー。Tailwind の `theme` 拡張（`primary` 等）と CSS variable を活用していない。動的 activity color は `style` 必須だが、固定の Peak Log 紫グラデーションはトークン化可能。
- 修正コスト: **M**
- 効果: **M**（デザイン統一・ダークライトテーマ対応）

### 4-5. `confirm()` を使っている
- 場所: `components/activity/activity-field-editor.tsx:61`
- 問題: ブラウザネイティブダイアログは UI ガイドライン外。`AlertDialog`（既に `components/ui/alert-dialog.tsx` が存在）を使うべき。
- 修正コスト: **S**
- 効果: **S**

### 4-6. `useMediaQuery` の SSR 不整合
- 場所: `hooks/use-media-query.ts:7`（`useState(false)` 固定で初期化）
- 問題: `ResponsiveDialog` がデスクトップ閲覧時に最初の 1 レンダで Drawer 判定 → ハイドレーション後に Dialog に切り替わる。チラつき・コンテンツの差分。
- 修正コスト: **S**（`useSyncExternalStore` か `getServerSnapshot` を使う）
- 効果: **S〜M**

---

## 5. ディレクトリ構成の歪み

### 5-1. 空ディレクトリ `actions/`（ルート直下）
- `actions/.gitkeep` のみ。すべて `server/actions/` に移動済み。`actions/` を削除して良い。
- 修正コスト: **S**　効果: **S**

### 5-2. 空 `types/index.ts`
- `export {};` だけ。共有 DTO の置き場として活用するか、削除する。
- 修正コスト: **S**　効果: **S**

### 5-3. `components/log/*` と `components/history/*` の境界が曖昧
- `log/log-card-menu.tsx` は `history/timeline-item.tsx` から呼ばれ、`activity/activity-detail.tsx` も `history/timeline-item.tsx` を import。「ログを表示するもの」のオーナーシップが log/history/activity に分散。
- 推奨: `components/log/` を「ログ表示・編集に関わる UI（モーダル含む）」、`components/timeline/` を「タイムラインリスト系」に分け、`history/` は廃止。
- 修正コスト: **M**　効果: **S**

### 5-4. `server/actions/activity-field-queries.ts` の存在
- "use server" になっているが中身は読み取り 1 関数。CLAUDE.md の「クエリ（取得系）はファイルを分ける」に従うなら `server/queries/activity-field.ts` に移すべき。
- 修正コスト: **S**　効果: **S**

---

## 6. 未使用ファイル / export / 依存

### 6-1. 未参照コンポーネント（削除推奨）
| ファイル | 確認 |
|---|---|
| `components/log/log-card.tsx` | `grep` で外部 import 0 件 |
| `components/log/delete-log-button.tsx` | 同上 |
| `components/activity/activity-grid.tsx` | 外部 import 0 件 |
| `components/activity/activity-button.tsx` | 上記 grid からのみ参照（grid と一緒に削除可） |

修正コスト: **S**　効果: **M**（CLAUDE.md「不要な抽象化をしない」の方針に直結）

### 6-2. 未参照 server function
- `server/queries/log.ts`: `getLogsForCurrentUser`, `getLogById`, `getMonthlyLogsForCurrentUser`, `getLogsRangePageForCurrentUser`
- `server/queries/activity.ts`: `getActivitiesForCurrentUser`, `getActivityById`
- `server/actions/log.ts`: `updateLogPerformedAt`
- `server/actions/activity-field.ts`: `unarchiveActivityField`, `deleteActivityField`, `reorderActivityFields`

修正コスト: **S**　効果: **M**

### 6-3. 未参照 lib/UI export
- `lib/date-utils.ts`: `formatDayShort`, `buildDayRange`, `toDatetimeLocalString`, `jstDateToUtc`, `groupLogsByDate`
- `components/ui/responsive-dialog.tsx`: `ResponsiveDialogTrigger`, `ResponsiveDialogClose`, `ResponsiveDialogHeader`, `ResponsiveDialogBody`, `ResponsiveDialogFooter`

修正コスト: **S**　効果: **S**

### 6-4. 依存パッケージ
- `@playwright/test` / `playwright` が `devDependencies` にあるが、リポジトリ内で `import` されている箇所なし。`package.json` の `screenshots` スクリプトが指す `scripts/screenshots/take-screenshots.ts` も存在しない。`shot-kit/` は `shot-kit` パッケージ（dev）配下で動くため Playwright は不要。
- `tailwindcss-animate` は `tailwind.config.ts` で参照されているので残す。

修正コスト: **S**（`npm rm` で完了）　効果: **S**

### 6-5. dead だが「将来必要」と思われる API
- `reorderActivityFields` は UI（`activity-edit-modal.tsx`）に並び替え機能が無いため未使用。ただし関連スキーマ・index は揃っている。
  - 加えて `ActivityField.sortOrder` は INSERT 時にしか書かれず、`server/queries/*` で `orderBy: { sortOrder }` ではなく `orderBy: { createdAt: "asc" }` で取得しているため、**仮に reorder を呼んでも並び順は変わらない**（バグ）。
- 修正コスト: **S**（クエリの orderBy を `sortOrder` に変える）
- 効果: **M**（活動カスタムフィールドの将来の並び替えが効くようになる）

---

## 7. shadcn/Tailwind 標準から外れている箇所

### 7-1. ハードコード色
- `#7C4DFF` / `#FBBF24` / `#5533cc` / `#00E5FF` などをコンポーネントに直書き（`grep` で 25 箇所超）。Tailwind theme には `primary` (#7C4DFF) は登録済み。
- 提案: 黄色 (`#FBBF24`) は `theme.colors.star` 等に追加。グラデーションは `bg-gradient-to-br from-primary to-primary/70` のように Tailwind ユーティリティで表現できる場面が多い。
- 修正コスト: **M**　効果: **M**

### 7-2. `var(--surface-overlay)` 直書きと CSS variable の運用
- `globals.css` の存在は未確認だが、`var(--surface-overlay)` と `hsl(var(--card))` が混在。命名規則を `--card` か `--surface` のどちらかに寄せる。
- 修正コスト: **S**
- 効果: **S**

### 7-3. `DialogContent` と `BottomSheetContent` / `ResponsiveDialogContent` の close ボタン責務がバラバラ
- `DialogContent` は built-in close ボタンあり（`components/ui/dialog.tsx:43`）。`ResponsiveDialogContent` と `BottomSheetContent` は built-in なしで、利用側が `<X>` を描く。`log-detail-modal.tsx` は `BottomSheetContent` 直接利用で close 自前、`create-log-modal.tsx` は `ResponsiveDialogContent` で close 自前… と判別が難しい。
- 修正コスト: **M**　効果: **M**

### 7-4. shadcn `DropdownMenu` を使っていない
- `log-card-menu.tsx` のドロップダウンが手書き（4-2）。shadcn には DropdownMenu が標準にある（未導入なら radix-ui Popover/DropdownMenu からの追加コスト小）。
- 修正コスト: **S**　効果: **S**

---

## 8. Prisma / Supabase クエリの非効率

### 8-1. `getCategoryStatsForCurrentUser` で全 log を引いて JS で集計
- 場所: `server/queries/log.ts:281-292`
- 問題: 期間内の全 log を `findMany` で取り、Map で `dates`/`logCount`/`firstPerformedAt`/`lastPerformedAt` を計算。log が万件規模になれば転送量・メモリが効く。
- 改善案:
  - `prisma.log.groupBy({ by: ["activityId"], _count, _min: { performedAt }, _max: { performedAt } })` で件数・最古・最新を取得
  - `distinctDays` だけは `SELECT activityId, COUNT(DISTINCT DATE_TRUNC('day', performedAt))` の生 SQL（`$queryRaw`）または冗長カラムを切る
- 修正コスト: **M**　効果: **M**（現状はインデックス的に問題ないが将来効く）

### 8-2. `getActivityDetailForCurrentUser` が全 log を取得して `slice(-30)`
- 場所: `server/queries/activity.ts:164-176`
- 問題: 累計件数と平均間隔のために全 log を `asc` で取得し、最後に直近 30 件を取り出している。log が増えると都度 N 件ぶん転送。
- 改善案:
  - 累計件数 → `count`、最終実施日 → `findFirst({ orderBy: desc, take: 1 })`、平均間隔 → `(最新 - 最古) / (件数 - 1)` の式に置き換え（最古 1 件だけ別取得）
  - `recentLogs` は `findMany({ orderBy: desc, take: 30 })`
- 修正コスト: **M**　効果: **M**

### 8-3. `ACTIVITY_FIELDS_SELECT` を全 log の join に毎回付ける
- 場所: `server/queries/log.ts` の `getLogsRangePageForCurrentUser`, `getMonthlyLogsForCurrentUser`, `getLogsSearchForCurrentUser`
- 問題: タイムラインの各 log 行に対し activity の fields 配列を nested select。同じ Activity を多数表示するときに同じ field 配列を log 行ぶんだけシリアライズ。
- 改善案: `getActiveActivitiesForCurrentUser` を Home 側で取得済み。Log には `activityId` のみ含めて、表示時に Activity を Map から引く設計（`HistoryDayItem` を JoinedDayItem へ変更）。
- 修正コスト: **L**（全 LogItem 型 + 利用側に波及）
- 効果: **M**

### 8-4. `Activity.sortOrder` はあるが Field の orderBy には使われていない
- 場所: `server/queries/activity.ts:42, 71, 159`、`server/actions/activity-field-queries.ts:22`
- 問題: `ActivityField.sortOrder` カラム＋ index ＋ reorder API は存在するのに、すべての fields クエリは `orderBy: { createdAt: "asc" }`。`reorderActivityFields` を呼んでも UI に反映されない（不具合）。
- 修正コスト: **S**　効果: **M**

### 8-5. `getMonthlySummaryForCurrentUser` の `peakLogs` スコアリング
- 場所: `server/queries/log.ts:80-99`
- 問題: 月内全 log を取得後 JS で score 計算 → top 3。SQL で `ORDER BY (CASE WHEN stars IS NOT NULL OR note IS NOT NULL THEN 1000 ELSE 0 END + stars*100 + ...) DESC LIMIT 3` にすれば余計な転送が消える。ただし可読性とトレードオフ。
- 修正コスト: **M**　効果: **S**（影響は限定的）

### 8-6. `revalidatePath("/")` を全 mutation で叩く
- 場所: `server/actions/log.ts`、`server/actions/activity.ts`、`server/actions/activity-field.ts`
- 問題: 副作用として全ホーム再取得を強制。filter 状態を URL に持っているのでサーバーで再評価されるが、毎回 `getActiveActivitiesForCurrentUser` も走る。タグベースの revalidate (`revalidateTag`) で activity リストと log リストを分けると効率化できる。
- 修正コスト: **M**　効果: **S**

---

## 9. その他気になる点（軽め）

- `components/logout-button.tsx` と `components/settings/change-password-card.tsx` は `default export`。CLAUDE.md は「default は page.tsx / layout.tsx のみ」と規定しているが現状違反。
- `lib/auth.ts:5` の `DEFAULT_ACTIVITIES` と `prisma/seed.ts:59` のデフォルト活動が別の配列で管理されており、変えるときに片方を忘れる。
- `EditLogModal` の `initialFieldValues` クレンジングロジック（`edit-log-modal.tsx:56-65`）は `lib/normalize-field-values.ts` の弱版。役割整理可能。
- `app/(protected)/page.tsx` の `groupToHistoryDays` は `lib/date-utils.ts` の `buildDayRange` / `groupLogsByDate` のどちらでもなく独自実装。重複。
- `console.error("[unexpected error]", error)` を `lib/app-error.ts:37` で出すだけ。本番ロガーへの集約口を将来的に検討。

---

## 先にやるべき TOP5

1. **未使用コードの削除**（6-1〜6-4）
   - 影響範囲: `components/log/log-card.tsx`, `delete-log-button.tsx`, `components/activity/activity-grid.tsx`, `activity-button.tsx`、`server/queries/log.ts` と `server/queries/activity.ts` の dead 関数 6 個、`server/actions/log.ts:updateLogPerformedAt`、`server/actions/activity-field.ts` の dead 関数 3 個、`lib/date-utils.ts` の dead 関数 5 個、`ResponsiveDialog*` 派生 5 個、空 `actions/`・`types/index.ts`、`@playwright/test` / `playwright` の package 削除。
   - 理由: コスト最小・効果即時。**今後の改善作業でノイズになる古いコード**を消してから他の打ち手を打つと作業範囲が明確になる。CLAUDE.md の「不要な抽象化をしない／未完成の半端な実装を残さない」と完全に一致。
   - コスト: **S**　効果: **L**

2. **`CreateLogModal` / `EditLogModal` の共通化**（1-1）と **共有 DTO の整備**（1-7, 1-8, 3）
   - 影響範囲: `components/log/_log-form.tsx`（新設）に DateModePicker, FieldValuesEditor, StarsRow を抽出し、Create/Edit から呼ぶ。`server/queries/log.ts` か新規 `types/log.ts` に `LogEditedPayload`, `ActivityForLog`, `ActivityFieldDTO` を集約して全コンポーネントから import。
   - 理由: アプリで最も大きいファイル 2 つが同時に縮み、payload 型重複が一気に消える。今後ピーク記録の項目を増やすたびに 2 ファイル＋7 つの型を直す手間がなくなる。
   - コスト: **L**（テスト含めて要時間）　効果: **L**

3. **Props→state コピー useEffect の撤去**（4-1）
   - 影響範囲: `home-content.tsx`, `compact-timeline.tsx`, `timeline-list.tsx`, `filter-fab.tsx`。`key` による再マウントか、props を直接利用する形に統一。`FilterFab` は `useFilterState` フックに切り出す。
   - 理由: 古い React パターンが 4 ファイルで現役。フィルタ更新時の意図しないチラつき・stale state バグの温床になる前に潰しておく。
   - コスト: **M**　効果: **M**

4. **ActivityField の並び順バグ修正**（6-5, 8-4）
   - 影響範囲: `server/queries/activity.ts` および `server/actions/activity-field-queries.ts` の fields の `orderBy` を `sortOrder: "asc"` へ変更。`reorderActivityFields` を実 UI（`activity-edit-modal.tsx`）に繋げる or 当該 API を削除。
   - 理由: 「sortOrder の存在 ＋ reorder API 完備 ＋ クエリでは createdAt order」という不整合が、いざ並び替え機能を出す段で気付かれにくいバグになる。修正自体は 1 行クラス。
   - コスト: **S**　効果: **M**

5. **ハードコード色とスタイルトークンの整理**（4-4, 7-1, 7-2）+ **トースト統一**（1-5）+ **`confirm()` → AlertDialog**（4-5）
   - 影響範囲: `tailwind.config.ts` に `colors.star` などを追加し、`#FBBF24` / `#7C4DFF` / `#5533cc` を utility 化／theme 経由に置換。`HomeFab` `ActivityGrid` の自前トーストを `sonner.toast` に集約。`activity-field-editor.tsx` の `confirm()` を `AlertDialog` に。
   - 理由: 中規模のリファクタを一気にデザイン整合の機運に乗せられる。後段で shadcn 標準導入 (DropdownMenu 化) や `useMediaQuery` の SSR 修正が乗りやすくなる。
   - コスト: **M**　効果: **M**

---

## 付録: 修正コスト・効果の目安

- **S**: 数時間以内、1〜数ファイル
- **M**: 半日〜1日、複数ファイル/型に波及
- **L**: 1〜数日、テスト・回帰確認込みで広域

参考に `wc -l` で見た上位ファイルの規模（リファクタ前）:
```
353 components/log/create-log-modal.tsx
349 server/queries/log.ts
313 components/log/edit-log-modal.tsx
258 components/home/filter-fab.tsx
236 prisma/seed.ts
225 components/activity/activity-edit-modal.tsx
216 server/actions/activity-field.ts
209 server/queries/activity.ts
```
