# アーキテクチャ決定記録（ADR）

設計上の重要な判断をここに記録する。
「なぜその設計にしたか」「何を却下したか」を残すことで、同じ議論を繰り返さない。

---

## ADR-001: Activity の物理削除を行わない

- **ステータス**: 採用
- **決定**: Activity は `isArchived` フラグで論理削除のみ。物理削除は行わない
- **理由**: Log が Activity に紐づいているため、物理削除すると Log の参照先が消える。MVP では外部キー制約を維持してデータ整合性を優先する
- **却下した選択肢**: CASCADE DELETE で Log ごと削除 → ユーザーの記録が失われるため却下
- **将来の見直し条件**: アカウント削除機能追加時に、全データ削除のフローとして検討する

---

## ADR-002: Reflection は 1 Log につき 0 か 1（upsert パターン）

- **ステータス**: 採用
- **決定**: `Reflection` は `logId` に `@unique` 制約を持ち、1 Log に対して最大 1 件のみ
- **理由**: 「余韻」は一つの体験への感想であり、複数持つ概念ではない。シンプルな 1:1 関係にすることで upsert で扱える
- **却下した選択肢**: 複数の Reflection を持てる設計 → 複雑になる割にユースケースがない

---

## ADR-003: performedAt を createdAt と分離する

- **ステータス**: 採用
- **決定**: Log の `performedAt` は体験した日時を指す。DB の `createdAt`（記録した日時）とは別のフィールドとして管理する
- **理由**: ユーザーが後からログを記録することが多い。「筋トレした時刻」と「アプリに入力した時刻」は異なる
- **却下した選択肢**: `createdAt` のみで管理 → 後追い入力ができなくなる

---

## ADR-004: DB アクセスはサーバーのみ

- **ステータス**: 採用
- **決定**: Prisma クライアントは Server Components・Server Actions からのみ呼び出す。Client Component から直接呼ばない
- **理由**: セキュリティ上、DB 接続情報をクライアントに公開しない。Next.js App Router のサーバー/クライアント境界を明確に保つ
- **却下した選択肢**: tRPC や REST API エンドポイント経由 → MVP 段階では Server Actions で十分、過剰な抽象化を避ける

---

## ADR-005: バージョン番号の正本を package.json に置く

- **ステータス**: 採用
- **決定**: バージョン番号は `package.json` の `version` を唯一の正本とする。UI 表示は `package.json` を参照する
- **理由**: 複数ファイルで管理すると同期ズレが起きる。`package.json` はエコシステム標準であり、npm/GitHub Actions 等のツールと自然に連携できる
- **却下した選択肢**: `src/lib/constants.ts` にハードコード → 更新箇所が増え忘れが発生しやすい

---

## ADR-006: タイムゾーンは常に Asia/Tokyo を明示する

- **ステータス**: 採用
- **決定**: `performedAt` は DB（PostgreSQL `timestamptz`）に UTC で保存し、表示・グループ化・範囲クエリはすべて `date-fns-tz` の `Asia/Tokyo` を明示して処理する
- **理由**: Vercel サーバーは UTC 環境。`new Date()` や `dayjs()` のローカル時刻依存コードはサーバー実行時に JST と 9 時間ずれる。環境依存を排除するため TZ を明示する方針に統一した
- **背景**: 1.0.0 時点まで `dayjs` をタイムゾーン指定なしで使っていた。サーバーサイドの日付範囲計算（`fetchMoreDays`・月次集計）が UTC サーバーで JST を考慮できていなかったため `date-fns-tz` に移行して修正した
- **DB マイグレーションについて（失敗の記録）**: 「JST のつもりの値が UTC カラムに保存されている」と誤判断し、全レコードに +9h を加算するマイグレーションを実施したが誤りだった。`performedAt` はクライアント（JST ブラウザ）で生成した Date オブジェクトを送信しているため、ブラウザが UTC 変換済みで DB には正しい UTC が保存されていた。+9h により全データが 9 時間ずれて表示される不具合が発生したため、直後に -9h の逆マイグレーションで復元した。**DBマイグレーションは不要だった**
- **実装ルール**:
  - 表示・フォーマット: `formatInTimeZone(date, "Asia/Tokyo", pattern)`
  - JST 日付文字列 → UTC Date: `fromZonedTime("YYYY-MM-DD", "Asia/Tokyo")`
  - 月・日付範囲クエリ: `fromZonedTime` で JST 月初を UTC に変換してから Prisma に渡す
  - `datetime-local` 入力値の表示: `toDatetimeLocalString` が `Asia/Tokyo` を使用
- **却下した選択肢**: サーバーの TZ 環境変数を `Asia/Tokyo` に設定 → Vercel 環境での設定管理が煩雑、明示的なコードの方が可搬性が高い
- **furikaeri-mcp との連携**: MCP レスポンスの `performedAt` は `toJSTISOString()` で `"+09:00"` 付き ISO 文字列に変換して返す（Claude が日本語文脈で解釈しやすくするため）

---

## ADR-007: クイックログ（ActivityGrid）を廃止し FAB に置き換える

- **ステータス**: 採用
- **決定**: Home の ActivityGrid（activity タイル一覧）を廃止し、右下固定の FAB から `CreateLogModal` を開く形に変更。フォーム内で活動を選択する
- **理由**: ActivityGrid はホーム画面の大半を占めており、最近のピーク一覧が埋もれていた。FAB + インフォームな活動選択により画面の情報密度を下げ、記録フローを統一する
- **却下した選択肢**: ActivityGrid を残しつつ FAB を追加 → 記録導線が2重になり UX が複雑になるため却下
- **実装**: `HomeFab`（`components/log/home-fab.tsx`）が FAB・トースト・余韻モーダルを管理。`CreateLogModal` の `activity` prop をオプション化し、未指定時に活動選択リストを上部表示する
