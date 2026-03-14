"use client";

import { useState, useTransition } from "react";
import { LogCard } from "@/components/log/log-card";
import { groupLogsByDate } from "@/lib/date-utils";
import { fetchMoreLogs } from "@/server/actions/log";
import type { LogItem, LogsPage } from "@/server/queries/log";

type Props = {
  initialPage: LogsPage;
  q?: string;
  from?: string;
  to?: string;
};

export function HistoryList({ initialPage, q, from, to }: Props) {
  const [items, setItems] = useState<LogItem[]>(initialPage.items);
  const [nextCursor, setNextCursor] = useState<string | null>(initialPage.nextCursor);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [isPending, startTransition] = useTransition();

  function handlePerformedAtSaved(logId: string, newDate: Date) {
    setItems((prev) => prev.map((item) => (item.id === logId ? { ...item, performedAt: newDate } : item)));
  }

  function handleReflectionSaved(
    logId: string,
    reflection: { id: string; excitement: number | null; achievement: number | null; wantAgain: boolean | null; note: string | null },
  ) {
    setItems((prev) => prev.map((item) => (item.id === logId ? { ...item, reflection } : item)));
  }

  function loadMore() {
    if (!nextCursor) return;
    startTransition(async () => {
      const page = await fetchMoreLogs({ cursor: nextCursor, q, from, to });
      setItems((prev) => [...prev, ...page.items]);
      setNextCursor(page.nextCursor);
      setHasMore(page.hasMore);
    });
  }

  const groups = groupLogsByDate(items);

  return (
    <>
      <div className="space-y-8">
        {groups.map(({ dateLabel, logs: groupLogs }) => {
          const isRecent = dateLabel === "今日" || dateLabel === "昨日";
          return (
            <section key={dateLabel}>
              <div className="flex items-center gap-3 mb-3">
                <h3
                  className="text-xs shrink-0 tabular-nums font-semibold"
                  style={
                    isRecent
                      ? { color: "#7C4DFF", filter: "drop-shadow(0 0 6px rgba(124,77,255,0.5))" }
                      : { color: "rgb(82,82,91)" }
                  }
                >
                  {dateLabel}
                </h3>
                <div
                  className="flex-1 h-px"
                  style={{
                    background: isRecent
                      ? "linear-gradient(90deg, rgba(124,77,255,0.3), transparent)"
                      : "linear-gradient(90deg, rgba(255,255,255,0.06), transparent)",
                  }}
                />
              </div>
              <div className="space-y-2">
                {groupLogs.map((log) => (
                  <LogCard key={log.id} log={log} usage="history" onPerformedAtSaved={handlePerformedAtSaved} onReflectionSaved={handleReflectionSaved} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
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
