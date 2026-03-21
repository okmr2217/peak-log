# Session Log

> セッションごとの作業記録。新しい記録をこの直下に追記する（時系列降順）。

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
