# リファクタリング実施ログ

実施日: 2026-05-10
対象プラン: REFACTOR_PLAN.md

---

## 実施したコミット（10件）

| コミット | 対応項目 | 内容 |
|---|---|---|
| `9c58a7f` | 6-1 | 未使用コンポーネントを削除（log-card.tsx, delete-log-button.tsx, activity-grid.tsx, activity-button.tsx） |
| `32dabe6` | 6-2 | 未使用サーバー関数を削除（getLogsForCurrentUser, getLogById, getMonthlyLogsForCurrentUser, getLogsRangePageForCurrentUser, getActivitiesForCurrentUser, getActivityById, updateLogPerformedAt, unarchiveActivityField, deleteActivityField, reorderActivityFields） |
| `1abd166` | 6-3 | 未使用 lib 関数を削除（formatDayShort, buildDayRange, toDatetimeLocalString, groupLogsByDate, jstDateToUtc） |
| `1ebeddd` | 5-1, 5-2 | 空の actions/ ディレクトリと types/index.ts を削除 |
| `864c21a` | 1-7 | LogEditedPayload 型を server/queries/log.ts に集約し、7ファイルの重複定義を除去 |
| `bb51fb6` | 1-6 | formatLastPerformed を lib/date-utils.ts に集約（activity-detail.tsx / activity-item.tsx の重複実装を除去） |
| `f03ba57` | 8-4, 6-5 | ActivityField の取得クエリを createdAt → sortOrder でソートするよう修正（バグ修正） |
| `17fddb7` + `0135582` | 5-4 | server/actions/activity-field-queries.ts を server/queries/activity-field.ts に移動 |
| `f5b79ce` | 9（その他） | LogoutButton, ChangePasswordCard を named export に変更（CLAUDE.md ルール準拠） |
| `55e6a8d` | 6-4 | 未使用の @playwright/test / playwright パッケージを削除 |

---

## スキップした項目と理由

| 項目 | 理由 |
|---|---|
| 1-1: CreateLogModal / EditLogModal 共通化 | 修正コスト L。振る舞いに影響する可能性があり、テスト環境なしでの実施は高リスク |
| 1-2: ActivityFormFields 切り出し | 修正コスト M。EditModal には FieldEditor が同居しており分離が複雑 |
| 1-3: ログ表示カード 3 種統合 | 修正コスト M。CompactLogChip と TimelineItem は用途が異なり共通化の恩恵が小さい |
| 1-4: StarRow コンポーネント化 | 修正コスト S だが振る舞い変更（インタラクション UI）を伴う可能性あり |
| 1-5: トースト二系統の統一 | HomeFab の自前トーストの削除は UI 振る舞い変更になる |
| 1-8: Activity / ActivityField DTO 一元化 | 修正コスト M。既存の local 型が微妙に異なり、全ファイル波及のリスクあり |
| 1-9: Prisma select フラグメント整理 | コスト S だが log.ts 側と actions 側で形が違うため慎重に行うべき |
| 1-10: 月境界計算の共通化 | getMonthlyLogsForCurrentUser が dead コードだったため不要になった |
| 1-11: ボトムシートレイアウトコピー | ResponsiveDialogHeader 等が実際には多数使用されており、REFACTOR_PLAN の情報が不正確だった |
| 4-1: props→state コピー useEffect の撤去 | 振る舞い変更（レンダリング挙動）を伴うため慎重な確認が必要 |
| 4-2: クリック外検出を Radix に置き換え | 振る舞い変更（操作体験）を伴う |
| 4-3: Props バケツリレー解消 | Context 化は設計変更が大きく、今回の方針（振る舞いを変えない）の範囲外 |
| 4-4, 7-1, 7-2: ハードコード色のトークン化 | 修正コスト M でスタイル変更を伴う。デザイン確認が必要 |
| 4-5: confirm() → AlertDialog | UI 振る舞い変更 |
| 4-6: useMediaQuery SSR 修正 | レンダリング挙動変更（チラつき除去）を伴う |
| 5-3: history/ ディレクトリ廃止 | ディレクトリ構成変更は公開パス（import パス）の変更を伴い、スコープ外 |
| 8-1: getCategoryStatsForCurrentUser の Prisma groupBy 化 | クエリ変更で振る舞いが変わる可能性あり |
| 8-2: getActivityDetailForCurrentUser のクエリ最適化 | 同上 |
| 8-3: ACTIVITY_FIELDS_SELECT の join 設計変更 | 修正コスト L、全 LogItem 型に波及 |
| 8-5: getMonthlySummaryForCurrentUser のスコアリング SQL 化 | 可読性とのトレードオフが大きい |
| 8-6: revalidatePath をタグベースに変更 | 機能変更（キャッシュ戦略）を伴う |

---

## 第2回実施コミット（2026-05-11, 4件）

| コミット | 対応項目 | 内容 |
|---|---|---|
| `f7e2c37` | 4-6 | useMediaQuery を useSyncExternalStore に移行してSSR不整合を解消 |
| `85371fc` | 1-4 | StarRating コンポーネントを新設し create-log-modal / edit-log-modal / log-detail-modal の重複実装を集約 |
| `cb817fc` | 1-2 | ActivityFormFields を切り出し activity-create-modal / activity-edit-modal の名前・絵文字・カラー・説明フォームの重複を解消 |
| `29e6846` | 1-1 | LogFormBody を切り出し CreateLogModal(332行→173行) / EditLogModal(311行→169行) の重複を解消 |

### 第2回スキップ項目

| 項目 | 理由 |
|---|---|
| 1-3: ログ表示カード 3 種統合 | CompactLogChip と LogCard は用途・レイアウトが異なり共通化の恩恵が小さい |
| 1-5: トースト二系統の統一 | HomeFab の自前トーストの削除は UI 振る舞い変更になる |
| 1-8: Activity / ActivityField DTO 一元化 | 既存の local 型が微妙に異なり、全ファイル波及のリスクあり |
| 1-9: Prisma select フラグメント整理 | コスト S だが log.ts 側と actions 側で形が違うため慎重に行うべき |
| 4-1: props→state コピー useEffect の撤去 | 振る舞い変更（レンダリング挙動）を伴うため慎重な確認が必要 |
| 4-2: クリック外検出を Radix に置き換え | 振る舞い変更（操作体験）を伴う |
| 4-3: Props バケツリレー解消 | Context 化は設計変更が大きい |
| 4-4, 7-1, 7-2: ハードコード色のトークン化 | スタイル変更を伴う。デザイン確認が必要 |
| 4-5: confirm() → AlertDialog | UI 振る舞い変更 |
| 8-x: Prisma クエリ最適化全般 | クエリ変更で振る舞いが変わる可能性あり |

---

## 補足

- REFACTOR_PLAN.md の「6-3: ResponsiveDialogTrigger 等が未使用」は誤り。grep 確認で activity-create-modal, log-detail-modal, activity-edit-modal, filter-fab, edit-log-modal, create-log-modal の 6 ファイルから実際に import されていた。
- `getMonthlyLogsForCurrentUser` の削除により、1-10（月境界計算の共通化）は対象外となった。
