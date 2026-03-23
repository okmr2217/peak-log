# Session Log

> セッションごとの作業記録。新しい記録をこの直下に追記する（時系列降順）。

## 2026-03-24 ホームのリアルタイム更新修正

### やったこと
- 記録の作成・削除・日時編集後にホームのタイムラインが更新されない問題を修正
- `HomeFab`・`DeleteLogButton`・`EditPerformedAtModal` に `router.refresh()` を追加
- `TimelineList` に `useEffect` を追加し、`initialItems` props 変更時に state を同期

### 技術メモ
- Server Action で `revalidatePath("/")` は呼ばれていたが、`TimelineList` が `useState` でデータを保持しているため UI に反映されなかった
- `router.refresh()` → サーバー再レンダリング → 新しい `initialItems` が props として渡る → `useEffect` で state 同期、という流れ
- 「さらに前を見る」で追加読み込みした分は refresh 後にリセットされる（許容範囲）

## 2026-03-24 Activity 詳細「最近の記録」カード化

### やったこと
- `/activities/[activityId]` の「最近の記録」を日付グループ表示からホームと同じカード形式（`TimelineItem`）に変更
- 日付セパレーター・`RecentLogItem` コンポーネントを削除し、フラットなカードリストに統一
- `RecentLog` 型・Prisma クエリに `createdAt` を追加
- `ActivityDetailView` を Client Component 化し、余韻・performedAt の更新をローカル state で反映

### 技術メモ
- `"use client"` を付与しても、データは page.tsx（サーバー）から props で受け取る構造は変わらず
- `toLogItem()` で `RecentLog` → `LogItem` 形式に変換し `TimelineItem` に渡す

## 2026-03-24 ActivityItem UI 刷新・D&D 並び替え追加

### やったこと
- 並び替え（↑↓）・メニュー（⋮）ボタンを `p-1.5 / size 13-14` → `p-2 / size 15-16` に拡大
- 統計ボタン（BarChart2）をドロップダウンメニューから独立アイコンボタンに昇格
- `@dnd-kit/core` `@dnd-kit/sortable` `@dnd-kit/utilities` を追加
- `ActivityList` に `DndContext` + `SortableContext` を追加しオプティミスティック更新
  - `useState` でローカル順序を管理、`arrayMove` で即時反映 → `reorderActivities` Server Action 呼び出し
  - `DragOverlay` でドラッグ中のゴーストカードを表示
  - `TouchSensor`（delay: 200ms）でモバイルのスクロールと競合しない設定
- `ActivityItem` に `useSortable` フック + `GripVertical` ハンドルを追加
- ↑↓ 並び替えボタンを廃止（D&D に置き換え）
- `MoreVertical` ドロップダウンメニューを廃止
- 統計・編集・アーカイブをカード右端に常時表示のアイコンボタンとして配置
- `ActivityItem` の `allActivityIds` prop を削除（D&D 移行により不要）

### 技術メモ
- `useSortable` の `transform` と既存の `cardStyle` は `style={{ ...cardStyle, ...style }}` で合成
- オプティミスティック更新: `setActivities(reordered)` → `await reorderActivities(...)` の順。エラー時のロールバックは現状なし（Server Action 失敗時は次のページロードで修正される）
- `TouchSensor` の `activationConstraint: { delay: 200, tolerance: 5 }` でタップとドラッグを区別

## 2026-03-24 記録ページ廃止・Home タイムライン化

### やったこと
- `/history` ページ（日次 / タイムライン）を廃止
- Home を `TimelineList`（フラット時系列・日付グループなし）に全面置き換え
- Home に `PageHeader`（title="ピーク"）を追加
- BottomNav から「記録」タブを削除 → 4タブ化（ホーム ｜ 月次 ｜ ピーク ｜ 設定）
- 不要ファイルをすべて削除（8 ファイル・644 行削減）
  - `DayList` / `HistoryTabs` / `DayDetailSheet` / `HistoryFilter` / `HistoryList` / `LogList`
  - `fetchMoreLogs` server action / `getLogsPageForCurrentUser` / `LogsPage` / `LogsPageParams`

### 技術メモ
- Home のデータ取得を `getLogsPageForCurrentUser`（cursor pagination）から `getLogsRangePageForCurrentUser`（30日分・range）に変更
- `TimelineList` の「さらに前を見る」は `fetchMoreDays` で継続動作

## 2026-03-24 クイックログ廃止・FAB 導入

### やったこと
- Home の ActivityGrid（「今日のピーク」セクション）を廃止
- Home 右下に FAB（`HomeFab`）を追加。タップで `CreateLogModal` を開く
- `CreateLogModal` を汎用化：`activity` prop をオプションに変更し、未指定時は上部に活動選択リストを表示
  - 活動選択リスト: 各行に左カラーバー・絵文字・名前。選択中はカラーハイライト
  - 活動未選択時は記録ボタンを disabled
- ヘッダーの活動名表示を削除
- 余韻トグルボタンをコンパクト化（`text-xs`・アイコン縮小）し、上ボーダーと説明文を削除

### 技術メモ
- `ActivityGrid` は未使用になったが削除は保留
- `HomeFab` がトースト・余韻モーダルも管理（`ActivityGrid` の責務を移植）

## 2026-03-24 月次ページ独立・ナビゲーション追加

### やったこと
- `/monthly` ページを新設し BottomNav に CalendarDays アイコン「月次」として追加（5タブ構成に）
- 月次ページの構成：
  - ページ上部に MonthNav を中央配置（独立コントロールとして）
  - 今月の概要セクション（統計カード・よく記録したこと）
  - 今月のピーク（日次形式・当月全件・空状態表示あり）
- `/history/stats` ページを削除、history ページの月次統計ボタンを削除
- `getMonthlyLogsForCurrentUser(month)` クエリを追加
- `MonthlySummarySection` から peakLogs ブロックと MonthNav を削除・props を `summary` のみに整理
- `MonthNav` を `text-lg / font-semibold / size=18` にサイズ拡大（スタンドアロン配置に対応）

### 技術メモ
- 月次ページは全件サーバーレンダリング（ページネーション不要・月固定のため）
- ログを `performedAt desc` で取得し Map で日付グループ化、挿入順が新しい日付から並ぶ

## 2026-03-24 Activity 説明文フィールド追加

### やったこと
- `Activity` モデルに `description String?` を追加（Prisma マイグレーション済み）
- バリデータ（`createActivitySchema` / `updateActivitySchema`）に `description`（最大200文字）を追加
- `ActivityWithStats` 型と `getActivitiesWithStatsForCurrentUser` クエリに `description` を追加
- 作成・編集モーダルにテキストエリア（2行・200文字カウンター表示）を追加（カラーフィールドの後）
- `ActivityItem` の `Activity` インターフェースに `description` を追加

### 技術メモ
- カードへの表示はなし。モーダルのみ表示
- `getActiveActivitiesForCurrentUser`（Home用）には `description` を含めていない（不要なため）

## 2026-03-22 activity-detail UI 改善

### やったこと
- `timeline-item.tsx` の Sparkles バッジを削除
- `activity-detail.tsx` の最近の記録をタイムライン形式に変更（左ボーダー・時刻・絵文字ボックス・reflection.note）
- `RecentLog` の取得件数を 5 件 → 30 件に変更

## 2026-03-22 タスク pill-gap：日次表示 pill の縦間隔調整

### やったこと
- `day-list.tsx` の pill コンテナの gap を `gap-1.5` → `gap-x-1.5 gap-y-2` に変更
- 折り返し時の縦間隔のみ拡張（横間隔は維持）

## 2026-03-22 タスク L：余韻ありバッジ削除

### やったこと
- `activity-detail.tsx` の `RecentLogItem` から `Sparkles` アイコン（余韻ありバッジ）を削除
- `Sparkles` インポートを削除

## 2026-03-22（セッション2）

### やったこと
- History にタイムライン表示モードを追加（タスク C）
  - `HistoryTabs`（client）: 日次 / タイムラインのタブ切り替え。URL `?mode=timeline` で状態永続化
  - `TimelineItem`（client）: 縦線＋時刻＋絵文字ボックス＋Activity名のコンパクト行。余韻ありは Sparkles アイコン表示
  - `TimelineList`（client）: 日付グループ（ログあり日のみ）＋時系列表示。`DayList` と同じ `fetchMoreDays` で「さらに前を見る」対応
  - `DayList` の日付行に `AlignLeft` アイコンリンク（`/history?mode=timeline#YYYY-MM-DD`）を追加
  - `section id="YYYY-MM-DD" className="scroll-mt-20"` でアンカー遷移のずれを防止
  - `history/page.tsx` に `searchParams` でモード判定を追加し、`TimelineList` / `DayList` を切り替え

### 技術メモ
- タイムライン内のログ順序は `getLogsRangePageForCurrentUser` が `asc` 返却のため、`[...day.logs].reverse()` で新しい順に反転した
- `HistoryTabs` は `"use client"` で `useSearchParams` + `router.push` でモード切り替え。Server Component 側でモードを読み取る設計と相性が良い

## 2026-03-22

### やったこと
- Home「最近のピーク」に cursor pagination を追加（初期30件・もっと見るボタン）
  - `LogList` を `"use client"` に変更し `initialPage: LogsPage` を受け取る形に刷新
  - `page.tsx` を `getLogsPageForCurrentUser({ limit: 30 })` に変更
  - `HistoryList` と同じスタイルの「もっと見る」ボタンを追加
- 新規ユーザー登録時にデフォルト Activity 5件を自動作成
  - `lib/auth.ts` に `databaseHooks.user.create.after` フックを追加
  - `prisma.$transaction` で5件まとめて作成（エラーは握り潰してユーザー登録を妨げない）

### 技術メモ
- `fetchMoreLogs` の既存 Server Action をそのまま流用できた（cursor のみ必須で q/from/to は optional）
- Better Auth の `databaseHooks` は `lib/auth.ts` に直接記述するだけで動作する

<!--
## YYYY-MM-DD セッション記録フォーマット

### やったこと
-

### 改善案（未対応）
-

### 失敗したアプローチ
-

### 技術メモ
-

### 次にやりたいこと
-
-->

---

## 2026-03-22 タスク2: ActivityItem のコンパクト化

### やったこと
- `activity-item.tsx` のカードパディングを `px-4 py-4` → `px-3.5 py-3` に縮小
- 絵文字ボックスを `w-11 h-11 rounded-xl text-xl` → `w-9 h-9 rounded-lg text-lg` に縮小
- アクションボタン行（`border-t` + 統計/編集/アーカイブ）を削除
- 並び替えボタン隣に 3 点メニューボタン（`MoreVertical`）を追加
- `useRef` + `useEffect` で外側クリック時にメニューを閉じる実装
- ドロップダウン内に「統計を見る（Link）」「編集」「アーカイブ/解除」を配置

### 技術メモ
- `menuRef` は 3 点メニューの wrapper `<div>` に当てて、並び替えボタンはその外に置く（並び替えクリックでメニューが閉じないようにするため）

---

## 2026-03-22 タスク1: ログカードの情報密度改善・小型化

### やったこと
- ヘッダー行のパディングを `px-4 pt-4 pb-3.5` → `px-3.5 pt-3 pb-2.5` に縮小
- 絵文字ボックスを `w-9 h-9 rounded-xl text-lg` → `w-7 h-7 rounded-lg text-sm` に縮小
- Activity 名を `text-[15px] font-semibold` → `text-sm font-medium` に変更
- reflection が null のとき Reflection エリア全体（`border-t` 含む）を非表示に変更
- `log-card.tsx` に `"use client"` を追加し、`reflectionOpen` + `reflection` state を管理
- `LogCardMenu` に `hasReflection: boolean` と `onAddReflection: () => void` を追加
- `LogCardMenu` に「余韻を追加/余韻を編集」メニュー項目（`Sparkles` アイコン）を追加（順序: 余韻→時間→削除）
- `AddReflectionButton` の使用を廃止し `ReflectionModal` を `LogCard` で直接レンダリング
- `add-reflection-button.tsx` を削除（他に使用箇所なし）

### 技術メモ
- `log-card.tsx` は元々 `"use client"` なしだったが、state 管理のために追加。Next.js App Router ではサーバーコンポーネントからクライアントコンポーネントへの変換は親に影響しない

### 失敗したアプローチ
- なし

---

## 2026-03-22 タスク: 日付選択UIを作成と編集で統一

### やったこと
- `lib/date-picker-utils.ts` を作成し、`DateMode` 型・`floorToNearest30`・`TIME_OPTIONS`・`DAY_PICKER_CLASS_NAMES` を共通化
- `create-log-modal.tsx` をリファクタリングしてローカル定義を `date-picker-utils` から import に切り替え
- `edit-performed-at-modal.tsx` の `<input type="datetime-local">` を削除し、「今日 / 昨日 / 他の日」ピル + DayPicker + 時刻セレクトに置き換え
- `performedAt` からの初期値復元ロジックを実装（日付→dateMode 判定、時刻→30分刻みで切り捨て）
- 未来日時のバリデーション（「未来の日時は記録できません」）を追加

### 技術メモ
- `DateMode` 判定は `startOfDay()` で日付を正規化して比較（時刻差を無視するため）
- `DAY_PICKER_CLASS_NAMES` は JSX を含まないので `.ts` ファイルに切り出せた。Chevron コンポーネントは各モーダルにインライン記述のまま
- `otherDate` の初期値は `startOfDay(performedAt)` にして時刻成分を除去

### 失敗したアプローチ
- なし

---

## 2026-03-22 タスク2: 月次統計ページのデザイン改善

### やったこと
- `/history/stats/page.tsx` のヘッダーを `PageHeader` コンポーネントに置き換え（タイトル「月次統計」・description・戻るリンクを action に配置）
- `MonthlySummarySection` の「今月の概要」見出しを `text-xs text-zinc-600` → `text-sm text-zinc-400` に変更
- 「よく記録したこと」「今月のピーク」のカード内見出しを `text-xs text-zinc-500` → `text-sm text-zinc-400` に変更
- `StatCard` の数字を `text-2xl` → `text-3xl`、ラベルを `text-xs text-zinc-500` → `text-sm text-zinc-400` に変更
- `PeakLogItem` の Activity 名を `text-sm` → `text-base`、日時を `text-xs text-zinc-600` → `text-sm text-zinc-500`、余韻メモを `text-xs` → `text-sm`、ドットを `w-1.5 h-1.5` → `w-2 h-2` に変更
- `MonthNav` の月ラベルを `text-sm` → `text-base`、ChevronLeft/Right を `size={14}` → `size={16}` に変更

### 技術メモ
- `PageHeader` の `action` は右側配置のため、戻るリンクは action に「← 記録」テキスト付きで配置する形を採用

---

## 2026-03-22 タスク1: 月次統計への遷移リンクを目立たせる

### やったこと
- `/history/page.tsx` の月次統計リンクのクラスを `text-zinc-400 hover:text-white hover:bg-zinc-800` から `bg-[#7C4DFF]/10 border border-[#7C4DFF]/30 text-[#7C4DFF] hover:bg-[#7C4DFF]/20 hover:text-[#9E70FF]` に変更
- `PageHeader` コンポーネント自体は変更せず、`action` に渡す JSX のクラスのみ修正

### 技術メモ
- プロダクトの Primary カラー `#7C4DFF` を 10% 透過の背景・30% 透過のボーダーで使用することで、ダーク背景でも埋没しない薄いボタン風スタイルを実現

---

## 2026-03-22 タスク4: セッション期限90日・オートフィル対応

### やったこと
- `lib/auth.ts` に `session.expiresIn: 60 * 60 * 24 * 90` を追加（90日）
- ログインページの email 入力に `autoComplete="email"`、password 入力に `autoComplete="current-password"` を付与

### 技術メモ
- Better Auth の session 設定は `betterAuth()` の第1引数オブジェクトに `session.expiresIn`（秒数）を渡す
- 既存セッションには遡及しない（新規ログイン以降に適用）

---

## 2026-03-22 タスク3: 各ページに説明文を追加

### やったこと
- `PageHeader` コンポーネントに `description` prop（optional）を追加
- `/history`・`/settings`・`/activities` の PageHeader に description を渡すように変更
- Home (`/`) のヘッダー部分に説明文を直接追加
- `/history/stats` のカスタムヘッダーに説明文を追加
- `ActivityDetailView` のヘッダーに説明文を追加（アーカイブ済みの場合は既存の「アーカイブ済み」表示を優先）

### 技術メモ
- PageHeader の description は h1 の下に `text-xs text-zinc-600` で表示
- stats ページはカスタムヘッダー構造だったため、div 構造を調整して description を追加

---

## 2026-03-22 タスク2: ログカードのメモ改行反映

### やったこと
- `log-card.tsx` の note 表示 `<p>` に `whitespace-pre-wrap` クラスを追加
- `activity-detail.tsx` の note 表示にも同様に追加

### 技術メモ
- `whitespace-pre-wrap` と `line-clamp-2` は併用可能。pre-wrap で改行を反映しつつ、2行でクリップする

---

## 2026-03-22 タスク1: ログ作成時にメモ入力を追加

### やったこと
- `create-log-modal.tsx` の note textarea を「余韻も一緒に残す」セクション内から取り出し、時刻選択の直下に常時表示する「メモ（任意）」欄として配置
- submit ロジックを変更: note が入力されていればログ作成と同時に Reflection を作成（rating データなしでも）
- 「余韻も一緒に残す」セクションは excitement / achievement / wantAgain のみに変更

### 技術メモ
- submit 時: `noteTrimmed !== ""` OR `showReflection && ratingData` があれば upsertReflection を呼ぶ
- `upsertReflection` に excitement/achievement/wantAgain は `showReflection` が true のときのみ渡す（note だけで Reflection 作成する場合は rating は undefined）

---

## 2026-03-22

### やったこと
- `performedAt` タイムゾーンバグを修正（JST as UTC 問題）
- `dayjs` を `date-fns` + `date-fns-tz` に完全移行・依存から削除
- `lib/date-utils.ts` を全面書き換え（全関数で `Asia/Tokyo` 明示）
- `server/actions/log.ts`・`server/queries/log.ts` の日付変換を `fromZonedTime` で正規化
- `history/page.tsx`・`page.tsx`・`activity-detail.tsx`・`activity-item.tsx`・`day-list.tsx` の `dayjs` を全置き換え
- `scripts/migrate-performed-at.ts` を作成（既存 DB レコードに +9h 補正）
- `furikaeri-mcp` の `performedAt` レスポンスを `toJSTISOString()` で JST ISO 文字列に変換
- `docs/decisions.md` に ADR-006（タイムゾーン方針）を追記

### 技術メモ
- `new Date("YYYY-MM-DD")` は UTC midnight として解釈される。`startOfDay` は LOCAL time 依存なので UTC サーバーでは使わない
- JST 日付文字列 → UTC 変換: `fromZonedTime("2026-03-22", "Asia/Tokyo")` = `2026-03-21T15:00:00Z`
- `buildDayRange` のループは `fromZonedTime` で統一した UTC 基準の Date で比較し、表示は `formatInTimeZone` で JST に戻す
- `formatDayFull` の曜日取得: `formatInTimeZone(d, TZ, "yyyy-MM-dd")` → `new Date("YYYY-MM-DD").getDay()` でUTC midnight の曜日を取得（JST 日付文字列の曜日として正しい）
- MCP レスポンスの `toJSTISOString`: UTC ms に +9h して `.toISOString().slice(0, 19) + "+09:00"` で生成

### 失敗したアプローチ
- **DBマイグレーション（+9h）は不要だった**: 「JST のつもりの値が UTC カラムに保存されている」と誤判断して全レコードに +9h を加算。実際は `performedAt` はクライアント（JST ブラウザ）で生成した Date オブジェクトを送信しているため DB にはすでに正しい UTC が保存されていた。+9h により全データが 9 時間ずれて表示される不具合が発生した。直後に -9h の逆マイグレーションで開発・本番両 DB を復元した

### 追加作業（不具合対応）
- `scripts/migrate-performed-at.ts` を -9h の逆マイグレーションに書き換え
- 開発 DB（46件）・本番 DB（37件）のロールバック実行
- `docs/decisions.md` ADR-006 に失敗の記録を追記

### 次にやりたいこと
- 動作確認: ログ一覧の表示時刻がズレていないこと・新規ログ作成時の時刻が正しいこと
