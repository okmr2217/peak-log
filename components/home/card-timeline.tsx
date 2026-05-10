"use client";

import { useState, useEffect } from "react";
import type { HistoryDayItem, LogEditedPayload, LogItem } from "@/server/queries/log";
import { LogCard } from "@/components/log/log-card";
import { formatDayFull } from "@/lib/date-utils";
import { getDayType, getDateTextClassName } from "@/lib/day-type";

type Props = {
  initialItems: HistoryDayItem[];
};

export function CardTimeline({ initialItems }: Props) {
  const [dayItems, setDayItems] = useState<HistoryDayItem[]>(initialItems);

  useEffect(() => {
    setDayItems(initialItems);
  }, [initialItems]);

  function handleLogEdited(logId: string, data: LogEditedPayload) {
    setDayItems((prev) =>
      prev.map((day) => ({
        ...day,
        logs: day.logs.map((log): LogItem => {
          if (log.id !== logId) return log;
          return { ...log, performedAt: data.newDate, stars: data.stars, note: data.note, fieldValues: data.fieldValues };
        }),
      })),
    );
  }

  const daysWithLogs = dayItems.filter((d) => d.logs.length > 0);

  return (
    <div className="space-y-4">
      {daysWithLogs.map(({ date, logs }) => (
        <div key={date}>
          <span className={`text-sm font-semibold tabular-nums block mb-2 px-1 ${getDateTextClassName(getDayType(date))}`}>
            {formatDayFull(date)}
          </span>
          <div className="space-y-1.5">
            {[...logs].reverse().map((log) => (
              <LogCard key={log.id} log={log} onLogEdited={handleLogEdited} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
