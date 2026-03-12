"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const result = await signUp.email({ name, email, password });
        if (result.error) {
          setError(result.error.message ?? "アカウントを作成できませんでした");
          return;
        }
      } else {
        const result = await signIn.email({ email, password });
        if (result.error) {
          setError(result.error.message ?? "ログインできませんでした");
          return;
        }
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-white/5 border border-white/8 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#7C4DFF]/60 transition-colors";

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1.5">Peak Log</h1>
          <p className="text-zinc-500 text-sm">あなたのピーク体験を記録する</p>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/5">
          <div className="flex mb-6 bg-[#0A0A0A] rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(""); }}
              className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${
                mode === "signin" ? "bg-[#7C4DFF] text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              ログイン
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${
                mode === "signup" ? "bg-[#7C4DFF] text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              新規登録
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "signup" && (
              <div>
                <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">名前</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="あなたの名前"
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClass}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-400 text-xs bg-red-400/5 px-3 py-2 rounded-lg">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7C4DFF] hover:bg-[#8D5FFF] disabled:opacity-50 text-white rounded-xl py-3.5 text-sm font-semibold transition-all active:scale-[0.98] mt-1"
            >
              {loading ? "処理中..." : mode === "signin" ? "ログイン" : "アカウントを作成"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
