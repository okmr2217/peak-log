"use client";

import { useState, useTransition } from "react";
import dayjs from "dayjs";
import { fetchMoreDays } from "@/server/actions/log";
import type { HistoryDayItem, LogItem } from "@/server/queries/log";
import { buildDayRange, formatDayFull } from "@/lib/date-utils";
import { getDayType, getDateTextClassName } from "@/lib/day-type";
import { DayDetailSheet } from "./day-detail-sheet";

type ReflectionPayload = {
  id: string;
  excitement: number | null;
  achievement: number | null;
  wantAgain: boolean | null;
  note: string | null;
};

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
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
      const to = dayjs(oldest).startOf("day");
      const from = to.subtract(30, "day");
      const newItems = buildDayRange(logs as LogItem[], from.toDate(), to.toDate());
      setDayItems((prev) => [...prev, ...newItems]);
      setOldest(from.format("YYYY-MM-DD"));
      setHasMore(nextHasMore);
    });
  }

  const selectedDayItem = selectedDate ? (dayItems.find((d) => d.date === selectedDate) ?? null) : null;

  return (
    <>
      <div className="divide-y divide-white/[0.04]">
        {dayItems.map((day) => (
          <button
            key={day.date}
            type="button"
            onClick={() => setSelectedDate(day.date)}
            className="w-full flex items-center gap-4 py-3 px-1 text-left hover:bg-white/[0.02] transition-colors rounded"
          >
            <span className={`text-sm tabular-nums shrink-0 ${getDateTextClassName(getDayType(day.date))}`}>
              {formatDayFull(day.date)}
            </span>
            <span className="flex-1 min-w-0">
              {day.logs.length === 0 ? (
                <span className="text-zinc-700 text-sm">-</span>
              ) : (
                <span className="text-base leading-none tracking-wide">
                  {day.logs.map((log, i) => (
                    <span key={`${log.id}-${i}`}>{log.activity.emoji ?? "·"}</span>
                  ))}
                </span>
              )}
            </span>
          </button>
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

      {selectedDayItem && (
        <DayDetailSheet
          date={selectedDayItem.date}
          logs={selectedDayItem.logs}
          onClose={() => setSelectedDate(null)}
          onReflectionSaved={handleReflectionSaved}
          onPerformedAtSaved={handlePerformedAtSaved}
        />
      )}
    </>
  );
}
