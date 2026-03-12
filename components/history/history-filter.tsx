"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Props = {
  q?: string;
  from?: string;
  to?: string;
};

export function HistoryFilter({ q, from, to }: Props) {
  const router = useRouter();
  const hasFilters = !!(q || from || to);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    const qVal = (data.get("q") as string)?.trim();
    const fromVal = data.get("from") as string;
    const toVal = data.get("to") as string;

    if (qVal) params.set("q", qVal);
    if (fromVal) params.set("from", fromVal);
    if (toVal) params.set("to", toVal);

    const qs = params.toString();
    router.push(`/history${qs ? `?${qs}` : ""}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-3">
      <div>
        <Label htmlFor="filter-q" className="text-xs text-zinc-500 mb-1.5 block">
          検索
        </Label>
        <Input
          id="filter-q"
          name="q"
          defaultValue={q}
          placeholder="アクティビティ・余韻を検索"
          className="bg-[#1A1A1A] border-white/10 text-sm placeholder:text-zinc-600"
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="filter-from" className="text-xs text-zinc-500 mb-1.5 block">
            開始日
          </Label>
          <Input
            id="filter-from"
            type="date"
            name="from"
            defaultValue={from}
            className="bg-[#1A1A1A] border-white/10 text-sm"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="filter-to" className="text-xs text-zinc-500 mb-1.5 block">
            終了日
          </Label>
          <Input
            id="filter-to"
            type="date"
            name="to"
            defaultValue={to}
            className="bg-[#1A1A1A] border-white/10 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1">
          検索
        </Button>
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push("/history")}
            className="text-zinc-500 hover:text-white"
          >
            条件をクリア
          </Button>
        )}
      </div>
    </form>
  );
}
