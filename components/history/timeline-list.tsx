"use client";

import { useState, useEffect } from "react";
import type { HistoryDayItem, LogItem } from "@/server/queries/log";
import { TimelineItem } from "./timeline-item";

type LogEditedPayload = {
  newDate: Date;
  stars: number | null;
  note: string | null;
};

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
          return { ...log, performedAt: data.newDate, stars: data.stars, note: data.note };
        }),
      })),
    );
  }

  const allLogs = dayItems.flatMap((d) => [...d.logs].reverse());

  return (
    <div className="space-y-1.5">
      {allLogs.map((log) => (
        <TimelineItem key={log.id} log={log} onLogEdited={handleLogEdited} />
      ))}
    </div>
  );
}
