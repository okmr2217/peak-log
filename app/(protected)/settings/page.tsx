import { requireUser } from "@/lib/session";
import LogoutButton from "@/components/logout-button";
import ChangePasswordCard from "@/components/settings/change-password-card";
import { APP_VERSION } from "@/lib/app-version";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-8">
      <h1 className="text-xl font-bold text-white">設定</h1>

      {/* アカウント */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">アカウント</h2>
        <div className="bg-[#1A1A1A] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">メールアドレス</span>
            <span className="text-sm text-white">{user.email}</span>
          </div>
        </div>
      </section>

      {/* パスワード変更 */}
      <ChangePasswordCard />

      {/* ログアウト */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">セッション</h2>
        <div className="bg-[#1A1A1A] rounded-xl p-4">
          <LogoutButton />
        </div>
      </section>

      {/* データ管理（将来用） */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">データ管理</h2>
        <div className="bg-[#1A1A1A] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between opacity-40 cursor-not-allowed">
            <span className="text-sm text-zinc-400">データをエクスポート</span>
            <span className="text-xs text-zinc-600">今後追加予定</span>
          </div>
          <div className="border-t border-zinc-800" />
          <div className="flex items-center justify-between opacity-40 cursor-not-allowed">
            <span className="text-sm text-red-400">アカウントを削除</span>
            <span className="text-xs text-zinc-600">今後追加予定</span>
          </div>
        </div>
      </section>

      {/* アプリについて */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">アプリについて</h2>
        <div className="bg-[#1A1A1A] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">アプリ名</span>
            <span className="text-sm text-white">Peak Log</span>
          </div>
          <div className="border-t border-zinc-800" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">バージョン</span>
            <span className="text-sm text-zinc-500">v{APP_VERSION}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
