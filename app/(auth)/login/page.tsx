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
          setError(result.error.message ?? "サインアップに失敗しました");
          return;
        }
      } else {
        const result = await signIn.email({ email, password });
        if (result.error) {
          setError(result.error.message ?? "ログインに失敗しました");
          return;
        }
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">Peak Log</h1>
        <p className="text-zinc-500 text-sm text-center mb-8">あなたのピーク体験を記録する</p>

        <div className="bg-[#1A1A1A] rounded-xl p-6">
          <div className="flex mb-6 bg-[#0A0A0A] rounded-lg p-1">
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(""); }}
              className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                mode === "signin" ? "bg-[#7C4DFF] text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              ログイン
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                mode === "signup" ? "bg-[#7C4DFF] text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              新規登録
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs text-zinc-400 mb-1">名前</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#7C4DFF]"
                  placeholder="あなたの名前"
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-zinc-400 mb-1">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#7C4DFF]"
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#7C4DFF]"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7C4DFF] hover:bg-[#6B3FEE] disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium transition-colors"
            >
              {loading ? "処理中..." : mode === "signin" ? "ログイン" : "アカウントを作成"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
