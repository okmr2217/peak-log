"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1.5">Peak Log</h1>
          <p className="text-muted-foreground text-sm">あなたのピーク体験を記録する</p>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex mb-6 bg-background rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(""); }}
              className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${
                mode === "signin" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ログイン
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${
                mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              新規登録
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-muted-foreground text-xs uppercase tracking-wide">
                  名前
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="あなたの名前"
                  className="bg-muted border-border rounded-xl px-3.5 py-3 h-auto placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-0"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground text-xs uppercase tracking-wide">
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
                autoComplete="email"
                className="bg-muted border-border rounded-xl px-3.5 py-3 h-auto placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground text-xs uppercase tracking-wide">
                パスワード
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                className="bg-muted border-border rounded-xl px-3.5 py-3 h-auto placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-0"
              />
            </div>

            {error && <p className="text-red-400 text-xs bg-red-400/5 px-3 py-2 rounded-lg">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl h-auto py-3.5 mt-1"
            >
              {loading ? "処理中..." : mode === "signin" ? "ログイン" : "アカウントを作成"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
