"use client";

import { useState, useTransition } from "react";
import { subDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { fetchMoreDays } from "@/server/actions/log";
import type { HistoryDayItem, LogItem } from "@/server/queries/log";
import { buildDayRange } from "@/lib/date-utils";
import { TimelineItem } from "./timeline-item";

type ReflectionPayload = {
  id: string;
  excitement: number | null;
  achievement: number | null;
  wantAgain: boolean | null;
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

  function handleReflectionSaved(logId: string, reflection: ReflectionPayload) {
    setDayItems((prev) =>
      prev.map((day) => ({
        ...day,
        logs: day.logs.map((log) => (log.id === logId ? { ...log, reflection } : log)),
      })),
    );
  }

  function handlePerformedAtSaved(logId: string, newDate: Date) {
    setDayItems((prev) =>
      prev.map((day) => ({
        ...day,
        logs: day.logs.map((log) => (log.id === logId ? { ...log, performedAt: newDate } : log)),
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
      <div className="space-y-2">
        {allLogs.map((log) => (
          <TimelineItem
            key={log.id}
            log={log}
            onReflectionSaved={handleReflectionSaved}
            onPerformedAtSaved={handlePerformedAtSaved}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isPending}
            className="px-5 py-2 text-xs text-zinc-500 hover:text-zinc-300 disabled:text-zinc-700 transition-colors border border-white/8 hover:border-white/15 rounded-full"
          >
            {isPending ? "読み込み中..." : "さらに前を見る"}
          </button>
        </div>
      )}
    </>
  );
}
