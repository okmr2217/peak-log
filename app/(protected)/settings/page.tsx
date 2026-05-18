import { requireUser } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";
import { ChangePasswordCard } from "@/components/settings/change-password-card";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { APP_VERSION } from "@/lib/app-version";
import { MobileHeader } from "@/components/mobile-header";
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <>
      <MobileHeader title="設定" showBack />
      <div className="p-4 max-w-lg mx-auto">
        <p className="text-xs text-muted-foreground mb-4">アカウント設定とアプリ情報を確認できます</p>
        <div className="space-y-4">
          {/* アカウント */}
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">アカウント</h2>
            <div className="bg-card rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">メールアドレス</span>
                <span className="text-sm text-foreground">{user.email}</span>
              </div>
            </div>
          </section>

          {/* 外観 */}
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">外観</h2>
            <div className="bg-card rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">テーマ</span>
              </div>
              <ThemeSelector />
            </div>
          </section>

          {/* パスワード変更 */}
          <ChangePasswordCard />

          {/* ログアウト */}
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">セッション</h2>
            <div className="bg-card rounded-xl p-4">
              <LogoutButton />
            </div>
          </section>

          {/* データ管理（将来用） */}
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">データ管理</h2>
            <div className="bg-card rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between opacity-40 cursor-not-allowed">
                <span className="text-sm text-muted-foreground">データをエクスポート</span>
                <span className="text-xs text-muted-foreground">今後追加予定</span>
              </div>
              <div className="border-t border-border" />
              <div className="flex items-center justify-between">
                <DeleteAccountDialog />
              </div>
            </div>
          </section>

          {/* アプリについて */}
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">アプリについて</h2>
            <div className="bg-card rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">アプリ名</span>
                <span className="text-sm text-foreground">Peak Log</span>
              </div>
              <div className="border-t border-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">バージョン</span>
                <span className="text-sm text-muted-foreground">v{APP_VERSION}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
