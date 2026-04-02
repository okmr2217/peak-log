"use client";

import { useState, useEffect, useTransition } from "react";
import { subDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { fetchMoreDays } from "@/server/actions/log";
import type { HistoryDayItem, LogItem } from "@/server/queries/log";
import { buildDayRange, formatDayFull, formatTime } from "@/lib/date-utils";
import { getDayType, getDateTextClassName } from "@/lib/day-type";

const TZ = "Asia/Tokyo";

type Props = {
  initialItems: HistoryDayItem[];
  oldestDate: string;
  hasMore: boolean;
};

export function CompactTimelineList({ initialItems, oldestDate, hasMore: initialHasMore }: Props) {
  const [dayItems, setDayItems] = useState<HistoryDayItem[]>(initialItems);
  const [oldest, setOldest] = useState(oldestDate);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setDayItems(initialItems);
    setOldest(oldestDate);
    setHasMore(initialHasMore);
  }, [initialItems, oldestDate, initialHasMore]);

  function loadMore() {
    startTransition(async () => {
      const { logs, hasMore: nextHasMore } = await fetchMoreDays({ before: oldest });
      const to = fromZonedTime(oldest, TZ);
      const from = subDays(to, 30);
      const newItems = buildDayRange(logs as LogItem[], from, to);
      setDayItems((prev) => [...prev, ...newItems]);
      setOldest(formatInTimeZone(from, TZ, "yyyy-MM-dd"));
      setHasMore(nextHasMore);
    });
  }

  const daysWithLogs = dayItems.filter((d) => d.logs.length > 0);

  if (daysWithLogs.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-zinc-500">この期間のピークはありません</p>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-white/[0.04]">
        {daysWithLogs.map(({ date, logs }) => (
          <div key={date} className="flex flex-col gap-2.5 py-2.5 px-1">
            <span className={`text-sm font-medium tabular-nums ${getDateTextClassName(getDayType(date))}`}>
              {formatDayFull(date)}
            </span>
            <span className="flex flex-wrap gap-x-1.5 gap-y-2">
              {logs.map((log) => {
                const color = log.activity.color;
                return (
                  <span
                    key={log.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-sm shrink-0"
                    style={{
                      background: color ? `${color}22` : "rgba(255,255,255,0.06)",
                      borderColor: color ? `${color}44` : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <span className="text-sm leading-none">{log.activity.emoji ?? "·"}</span>
                    <span className="tabular-nums text-zinc-400 text-sm leading-none">{formatTime(log.performedAt)}</span>
                  </span>
                );
              })}
            </span>
          </div>
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
