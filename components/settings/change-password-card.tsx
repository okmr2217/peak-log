"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { changePasswordSchema } from "@/server/validators/settings";
import { Eye, EyeOff } from "lucide-react";

type FieldErrors = Partial<Record<"currentPassword" | "newPassword" | "confirmPassword", string>>;

export default function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);
    setSuccess(false);

    const parsed = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
      revokeOtherSessions,
    });

    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const { error } = await authClient.changePassword({
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
      revokeOtherSessions: parsed.data.revokeOtherSessions,
    });
    setLoading(false);

    if (error) {
      setFormError(error.message ?? "パスワードを変更できませんでした");
      return;
    }

    setSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setRevokeOtherSessions(false);
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">パスワード</h2>
      <div className="bg-[#1A1A1A] rounded-xl p-4 space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-white">パスワード変更</p>
          <p className="text-xs text-zinc-500">ログインに使用するパスワードを変更できます</p>
        </div>

        {success && (
          <p className="text-xs text-emerald-400 bg-emerald-400/10 rounded-lg px-3 py-2">
            パスワードを変更しました
          </p>
        )}

        {formError && (
          <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{formError}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">現在のパスワード</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-[#111111] text-sm text-white rounded-lg px-3 py-2 pr-9 border border-zinc-800 focus:outline-none focus:border-zinc-600 placeholder-zinc-700"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {fieldErrors.currentPassword && (
              <p className="text-xs text-red-400">{fieldErrors.currentPassword}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-400">新しいパスワード</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full bg-[#111111] text-sm text-white rounded-lg px-3 py-2 pr-9 border border-zinc-800 focus:outline-none focus:border-zinc-600 placeholder-zinc-700"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
                tabIndex={-1}
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {fieldErrors.newPassword && (
              <p className="text-xs text-red-400">{fieldErrors.newPassword}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-400">新しいパスワード（確認）</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full bg-[#111111] text-sm text-white rounded-lg px-3 py-2 pr-9 border border-zinc-800 focus:outline-none focus:border-zinc-600 placeholder-zinc-700"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-400">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={revokeOtherSessions}
              onChange={(e) => setRevokeOtherSessions(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 bg-[#111111] accent-[#7C4DFF]"
            />
            <span className="text-xs text-zinc-400">他の端末からログアウトする</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg text-sm font-medium bg-[#7C4DFF] text-white hover:bg-[#6B3EE8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "変更中..." : "パスワードを変更"}
          </button>
        </form>
      </div>
    </section>
  );
}
