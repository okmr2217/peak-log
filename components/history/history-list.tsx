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
                  className={`text-xs shrink-0 tabular-nums ${
                    isRecent ? "font-semibold text-zinc-400" : "font-medium text-zinc-600"
                  }`}
                >
                  {dateLabel}
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-white/8 to-transparent" />
              </div>
              <div className="space-y-2">
                {groupLogs.map((log) => (
                  <LogCard key={log.id} log={log} timeOnly showDelete showEditDate />
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
