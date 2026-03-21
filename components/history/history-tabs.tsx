"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  mode: "day" | "timeline";
};

export function HistoryTabs({ mode }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function switchMode(next: "day" | "timeline") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", next);
    router.push(`/history?${params.toString()}`);
  }

  return (
    <div className="flex gap-1 mb-4 p-1 bg-white/[0.04] rounded-xl w-fit">
      <button
        type="button"
        onClick={() => switchMode("day")}
        className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
          mode === "day" ? "bg-[#7C4DFF] text-white" : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        日次
      </button>
      <button
        type="button"
        onClick={() => switchMode("timeline")}
        className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
          mode === "timeline" ? "bg-[#7C4DFF] text-white" : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        タイムライン
      </button>
    </div>
  );
}
