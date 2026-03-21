"use client";

import { useState, useTransition } from "react";
import { LogCard } from "./log-card";
import { fetchMoreLogs } from "@/server/actions/log";
import type { LogItem, LogsPage } from "@/server/queries/log";

type LogListProps = {
  initialPage: LogsPage;
};

export function LogList({ initialPage }: LogListProps) {
  const [items, setItems] = useState<LogItem[]>(initialPage.items);
  const [nextCursor, setNextCursor] = useState<string | null>(initialPage.nextCursor);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    if (!nextCursor) return;
    startTransition(async () => {
      const page = await fetchMoreLogs({ cursor: nextCursor });
      setItems((prev) => [...prev, ...page.items]);
      setNextCursor(page.nextCursor);
      setHasMore(page.hasMore);
    });
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-zinc-300 text-sm font-medium mb-1">まだ記録がありません</p>
        <p className="text-zinc-600 text-xs">今日のピークをひとつ残してみよう</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {items.map((log) => (
          <LogCard key={log.id} log={log} usage="home" />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isPending}
            className="px-5 py-2 text-xs text-zinc-500 hover:text-zinc-300 disabled:text-zinc-700 transition-colors border border-white/8 hover:border-white/15 rounded-full"
          >
            {isPending ? "読み込み中..." : "もっと見る"}
          </button>
        </div>
      )}
    </>
  );
}
