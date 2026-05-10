"use client";

import { useState, useEffect } from "react";
import type { HistoryDayItem, LogEditedPayload, LogItem } from "@/server/queries/log";
import { LogCard } from "@/components/log/log-card";

type Props = {
  initialItems: HistoryDayItem[];
};

export function TimelineList({ initialItems }: Props) {
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

  const allLogs = dayItems.flatMap((d) => [...d.logs].reverse());

  return (
    <div className="space-y-1.5">
      {allLogs.map((log) => (
        <LogCard key={log.id} log={log} onLogEdited={handleLogEdited} />
      ))}
    </div>
  );
}
