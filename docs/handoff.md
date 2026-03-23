# Peak Log — セッション引き継ぎ

> 最終更新: 2026-03-24（記録ページ廃止・Home タイムライン化）
> バージョン: 1.1.0
> このドキュメントは「今どこにいるか」を記録する。コンセプト・技術設計は @docs/project.md を参照。

---

## 現在の実装状態

### 実装済み画面

| パス | 画面 | 主な機能 |
|------|------|---------|
| `/login` | ログイン・登録 | email/password 認証（Better Auth） |
| `/` | Home | タイムライン（30日分・さらに前を見る）・FAB クイックログ |
| `/activities` | Activity 管理 | 一覧・作成・編集・並び替え・アーカイブ |
| `/activities/[id]` | Activity 詳細 | 統計・最近のログ一覧 |
| `/monthly` | 月次 | 月選択ナビ・月別集計・上位 Activity・今月のピーク（日次形式） |
| `/settings` | 設定 | メール表示・パスワード変更・ログアウト・バージョン表示 |

### 実装済み機能

- Activity 管理（作成・編集・並び替え・アーカイブ）
- ログ作成 FAB（Home 右下固定。活動選択 → 日時・メモ・余韻を 1 フォームで入力）
- `performedAt` 入力フロー（当日・前日・カレンダー・時刻セレクト）—— 作成・編集モーダルで UI を統一済み
- ログ作成時にメモ（余韻 note）を任意入力可能（note のみの Reflection 作成にも対応）
- Reflection（余韻）追加・編集（1 ログにつき 0 or 1）
- ログカードのメモ改行反映（`whitespace-pre-wrap`）
- 各ページの説明文表示（PageHeader の description prop 対応）
- `/monthly` ページ：今月の概要（統計・よく記録したこと）+ 今月のピーク（日次形式・月全件）
- MonthNav をページレベルに独立配置・サイズ拡大
- Home タイムライン（`TimelineList`・フラット時系列・30日分初期表示・「さらに前を見る」）
- 月次統計（月ナビ・集計・ピークログ）
- Activity 詳細統計（累計回数・最終実施日）
- セッション期限 90 日設定（Better Auth `session.expiresIn`）
- ログインページのオートフィル対応（`autocomplete` 属性）
- PWA manifest 設定（service worker は未実装）
- バージョン管理・CHANGELOG（`package.json` → Settings ページに表示）
- LogCard のコンパクト化（絵文字ボックス縮小・余韻なし時の Reflection エリア非表示・余韻追加/編集をドロップダウンメニューに統合）
- ActivityItem のコンパクト化（絵文字ボックス縮小・アクションボタン行を廃止し 3 点メニューに統合）
- 新規ユーザー登録時のデフォルト Activity 自動作成（Better Auth `databaseHooks.user.create.after`・5件 transaction）

変更履歴の詳細は @CHANGELOG.md を参照。

---

## 積み残し・注意点

- **furikaeri-mcp のデプロイ**: タイムゾーン修正をデプロイしないと MCP レスポンスに反映されない

---

## 今後の候補

### 高優先度

| 機能 | 概要 | 実装メモ |
|------|------|---------|
| **無限スクロール** | Home タイムラインの「さらに前を見る」を IntersectionObserver に変更 | `TimelineList` の `loadMore()` を `IntersectionObserver` の callback に置き換えるだけ。state / server action の構造は変更不要 |
| **Log に位置情報を追加** | Log 記録時に緯度・経度（+ 任意の地名）を保存する | Prisma スキーマに `latitude / longitude / locationName` を追加。ブラウザの Geolocation API で取得し、任意添付（拒否しても記録可能）にする |

### 中優先度

| 機能 | 概要 | 実装メモ |
|------|------|---------|
| **削除確認ダイアログ** | `window.confirm` → カスタムダイアログ | `components/ui/confirm-dialog.tsx` として `title / description / onConfirm / isPending / isOpen / onClose` を受け取る汎用コンポーネントに。現状は1箇所のみなので他の destructive action が増えた時点で共通化 |
| **余韻ありバッジ** | Reflection 済みの Log にアイコンバッジを表示 | Log カードに小アイコンを追加するだけ |

### 低優先度 / 長期

| 機能 | 概要 |
|------|------|
| **ビジュアル改善（frontend-design）** | LogCard 入場アニメーション・ActivityButton グロウ・モーダルグラデーション・空状態デザイン |
| **insights 強化** | 月またぎ比較・年次ビュー。`/monthly` ページを拡張する形で対応可能 |
| **カレンダー表示** | ピークをカレンダー形式で表示 |
| **タグ** | Log や Activity にタグを付与して絞り込み |
| **データエクスポート** | CSV / JSON エクスポート |
| **アカウント削除** | 設定からアカウントと全データを削除 |
| **PWA 強化** | Service Worker 実装・オフライン対応の完全化 |

---

## 次のセッションで相談したいこと

1. **余韻ありバッジ**：Reflection 済みの Log にアイコンバッジを表示するか
2. **無限スクロール**：「さらに前を見る」ボタンを IntersectionObserver に切り替えるか
