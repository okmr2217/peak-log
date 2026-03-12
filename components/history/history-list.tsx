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
      <div className="space-y-7">
        {groups.map(({ dateLabel, logs: groupLogs }) => (
          <section key={dateLabel}>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xs font-medium text-zinc-500 shrink-0">{dateLabel}</h3>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="space-y-2.5">
              {groupLogs.map((log) => (
                <LogCard key={log.id} log={log} timeOnly showDelete showEditDate />
              ))}
            </div>
          </section>
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isPending}
            className="text-sm text-zinc-400 hover:text-white disabled:text-zinc-600 transition-colors"
          >
            {isPending ? "読み込み中..." : "もっと見る"}
          </button>
        </div>
      )}
    </>
  );
}
