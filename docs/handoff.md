# Peak Log — セッション引き継ぎ

> 最終更新: 2026-03-22（日付選択UI統一完了後）
> バージョン: 1.0.0
> このドキュメントは「今どこにいるか」を記録する。コンセプト・技術設計は @docs/project.md を参照。

---

## 現在の実装状態

### 実装済み画面

| パス | 画面 | 主な機能 |
|------|------|---------|
| `/login` | ログイン・登録 | email/password 認証（Better Auth） |
| `/` | Home | Activity グリッド・クイックログ・最近の5件 |
| `/activities` | Activity 管理 | 一覧・作成・編集・並び替え・アーカイブ |
| `/activities/[id]` | Activity 詳細 | 統計・最近のログ一覧 |
| `/history` | History（日次） | 日別ログ表示・余韻追加・削除 |
| `/history/stats` | 月次統計 | 月別集計・上位 Activity・ピークログ |
| `/settings` | 設定 | メール表示・パスワード変更・ログアウト・バージョン表示 |

### 実装済み機能

- Activity 管理（作成・編集・並び替え・アーカイブ）
- Quick Log（Home からワンタップ記録）
- `performedAt` 入力フロー（当日・前日・カレンダー・時刻セレクト）—— 作成・編集モーダルで UI を統一済み
- ログ作成時にメモ（余韻 note）を任意入力可能（note のみの Reflection 作成にも対応）
- Reflection（余韻）追加・編集（1 ログにつき 0 or 1）
- ログカードのメモ改行反映（`whitespace-pre-wrap`）
- 各ページの説明文表示（PageHeader の description prop 対応）
- `/history` の月次統計リンクを紫ベースのボタンスタイルに変更（`bg-[#7C4DFF]/10 border border-[#7C4DFF]/30`）
- `/history/stats` のページヘッダーを PageHeader コンポーネントに統一
- 月次統計ページのテキストサイズ全体的に底上げ（StatCard・PeakLogItem・MonthNav・セクション見出し）
- History 日次表示（日付・曜日・土日祝色分け）
- History 日別詳細（モバイル: Sheet / PC: Modal）
- 月次統計（月ナビ・集計・ピークログ）
- Activity 詳細統計（累計回数・最終実施日）
- セッション期限 90 日設定（Better Auth `session.expiresIn`）
- ログインページのオートフィル対応（`autocomplete` 属性）
- PWA manifest 設定（service worker は未実装）
- バージョン管理・CHANGELOG（`package.json` → Settings ページに表示）

変更履歴の詳細は @CHANGELOG.md を参照。

---

## 積み残し・注意点

- **furikaeri-mcp のデプロイ**: タイムゾーン修正をデプロイしないと MCP レスポンスに反映されない

---

## 今後の候補

### 高優先度

| 機能 | 概要 | 実装メモ |
|------|------|---------|
| ~~**performedAt 編集 UI**~~ | ~~既存ログの日時を後から編集するモーダル~~ | 完了: 作成モーダルと同じ UI に統一済み |
| **ページネーション / 無限スクロール** | History の最大 50 件制限を解消する cursor pagination | `history-list.tsx` の `loadMore()` を `IntersectionObserver` の callback に置き換えるだけ。state / server action の構造は変更不要 |
| **Log に位置情報を追加** | Log 記録時に緯度・経度（+ 任意の地名）を保存する | Prisma スキーマに `latitude / longitude / locationName` を追加。ブラウザの Geolocation API で取得し、任意添付（拒否しても記録可能）にする |
| **Home の最近ピーク ページネーション** | 現状の最近 5 件を増やし、もっと見る / 無限スクロールに対応 | クエリの `take` 上限を引き上げ、cursor pagination を追加。表示は「もっと見る」ボタン or IntersectionObserver |
| **History タイムライン表示モード** | 日次 History とは別に、全 Log を時系列で流れるタイムライン表示を追加。日次 History の日付行クリックで該当日へアンカー遷移する | `/history` に表示モード切替（日次 / タイムライン）を追加。タイムライン側は Log を時系列に並べ、日付グループにアンカーを設定。日次側の日付行リンクは `?mode=timeline#YYYY-MM-DD` 形式でアンカーへ遷移 |

### 中優先度

| 機能 | 概要 | 実装メモ |
|------|------|---------|
| **削除確認ダイアログ** | `window.confirm` → カスタムダイアログ | `components/ui/confirm-dialog.tsx` として `title / description / onConfirm / isPending / isOpen / onClose` を受け取る汎用コンポーネントに。現状は1箇所のみなので他の destructive action が増えた時点で共通化 |
| **余韻ありバッジ** | Reflection 済みの Log にアイコンバッジを表示 | Log カードに小アイコンを追加するだけ |
| **History フィルタ** | 日付範囲・Activity 別フィルター | サーバー側クエリ変更＋URL パラメータで実装 |
| **デフォルト Activity 自動作成** | 新規ユーザー登録時に初期 Activity を自動作成 | Better Auth フック or 初回ログイン検出 |

### 低優先度 / 長期

| 機能 | 概要 |
|------|------|
| **ビジュアル改善（frontend-design）** | LogCard 入場アニメーション・ActivityButton グロウ・モーダルグラデーション・空状態デザイン |
| **日毎の空白日表示** | ログがない日も History に表示（連続性の可視化） |
| **insights 専用ページ** | 月またぎ比較・年次ビュー。`getMonthlySummaryForCurrentUser` をそのまま流用可能 |
| **カレンダー表示** | History をカレンダー形式で表示 |
| **タグ** | Log や Activity にタグを付与して絞り込み |
| **データエクスポート** | CSV / JSON エクスポート |
| **アカウント削除** | 設定からアカウントと全データを削除 |
| **PWA 強化** | Service Worker 実装・オフライン対応の完全化 |

---

## 次のセッションで相談したいこと

1. **ページネーション**：cursor pagination か offset か、UX（ボタン式 vs 無限スクロール）の方針
2. **日毎の空白日表示**：History に記録のない日も表示する UI 設計
3. **余韻ありバッジ**：Reflection 済みの Log にアイコンバッジを表示するか
