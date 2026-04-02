"use client";

import { useState, useEffect, useTransition } from "react";
import { subDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { fetchMoreDays } from "@/server/actions/log";
import type { HistoryDayItem, LogItem } from "@/server/queries/log";
import { buildDayRange } from "@/lib/date-utils";
import { TimelineItem } from "./timeline-item";

type LogEditedPayload = {
  newDate: Date;
  stars: number | null;
  note: string | null;
};

type Props = {
  initialItems: HistoryDayItem[];
  oldestDate: string;
  hasMore: boolean;
};

export function TimelineList({ initialItems, oldestDate, hasMore: initialHasMore }: Props) {
  const [dayItems, setDayItems] = useState<HistoryDayItem[]>(initialItems);
  const [oldest, setOldest] = useState<string>(oldestDate);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setDayItems(initialItems);
    setOldest(oldestDate);
    setHasMore(initialHasMore);
  }, [initialItems, oldestDate, initialHasMore]);

  function handleLogEdited(logId: string, data: LogEditedPayload) {
    setDayItems((prev) =>
      prev.map((day) => ({
        ...day,
        logs: day.logs.map((log) => {
          if (log.id !== logId) return log;
          const reflection =
            data.stars != null || data.note != null
              ? { id: log.reflection?.id ?? "", stars: data.stars, note: data.note }
              : null;
          return { ...log, performedAt: data.newDate, reflection };
        }),
      })),
    );
  }

  function loadMore() {
    startTransition(async () => {
      const { logs, hasMore: nextHasMore } = await fetchMoreDays({ before: oldest });
      const TZ = "Asia/Tokyo";
      const to = fromZonedTime(oldest, TZ);
      const from = subDays(to, 30);
      const newItems = buildDayRange(logs as LogItem[], from, to);
      setDayItems((prev) => [...prev, ...newItems]);
      setOldest(formatInTimeZone(from, TZ, "yyyy-MM-dd"));
      setHasMore(nextHasMore);
    });
  }

  const allLogs = dayItems.flatMap((d) => [...d.logs].reverse());

  return (
    <>
      <div className="space-y-1.5">
        {allLogs.map((log) => (
          <TimelineItem
            key={log.id}
            log={log}
            onLogEdited={handleLogEdited}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isPending}
            className="px-5 py-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors border border-border hover:border-muted-foreground/30 rounded-full"
          >
            {isPending ? "読み込み中..." : "さらに前を見る"}
          </button>
        </div>
      )}
    </>
  );
}
