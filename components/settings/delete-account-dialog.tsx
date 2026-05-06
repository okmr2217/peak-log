"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { deleteAccount } from "@/server/actions/user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function DeleteAccountDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setPassword("");
      setShowPassword(false);
      setError(null);
    }
    setOpen(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await deleteAccount({ password });
    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.push("/login");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-destructive hover:underline text-left"
      >
        アカウントを削除
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">アカウントを削除</DialogTitle>
            <DialogDescription>
              この操作は元に戻せません。アカウントとすべての記録・データが完全に削除されます。
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">パスワードを入力して確認</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full bg-muted text-sm text-foreground rounded-lg px-3 py-2 pr-9 border border-border focus:outline-none focus:border-destructive/50 placeholder:text-muted-foreground/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading || !password}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "削除中..." : "削除する"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
