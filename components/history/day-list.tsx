"use client";

import { useState, useTransition } from "react";
import { subDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import Link from "next/link";
import { fetchMoreDays } from "@/server/actions/log";
import type { HistoryDayItem, LogItem } from "@/server/queries/log";
import { buildDayRange, formatDayFull, formatTime } from "@/lib/date-utils";
import { getDayType, getDateTextClassName } from "@/lib/day-type";

type Props = {
  initialItems: HistoryDayItem[];
  /** 一覧で表示している最も古い日付 (YYYY-MM-DD, inclusive) */
  oldestDate: string;
  hasMore: boolean;
};

export function DayList({ initialItems, oldestDate, hasMore: initialHasMore }: Props) {
  const [dayItems, setDayItems] = useState<HistoryDayItem[]>(initialItems);
  const [oldest, setOldest] = useState<string>(oldestDate);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

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

  return (
    <>
      <div className="divide-y divide-white/[0.04]">
        {dayItems.map((day) => (
          <Link
            key={day.date}
            href={`/history?mode=timeline#${day.date}`}
            className="w-full flex flex-col gap-2.5 py-2.5 px-1 text-left hover:bg-white/[0.02] transition-colors rounded"
          >
            <span className={`text-sm font-medium tabular-nums ${getDateTextClassName(getDayType(day.date))}`}>
              {formatDayFull(day.date)}
            </span>
            <span className="flex flex-wrap gap-x-1.5 gap-y-2">
              {day.logs.length === 0 ? (
                <span className="text-zinc-700 text-sm">-</span>
              ) : (
                day.logs.map((log, i) => {
                  const color = log.activity.color;
                  return (
                    <span
                      key={`${log.id}-${i}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-sm text-zinc-300 shrink-0"
                      style={{
                        background: color ? `${color}22` : "rgba(255,255,255,0.06)",
                        borderColor: color ? `${color}44` : "rgba(255,255,255,0.08)",
                      }}
                    >
                      <span className="text-sm leading-none">{log.activity.emoji ?? "·"}</span>
                      <span className="tabular-nums text-zinc-400 text-sm leading-none">
                        {formatTime(log.performedAt)}
                      </span>
                    </span>
                  );
                })
              )}
            </span>
          </Link>
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
