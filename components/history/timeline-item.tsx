"use client";

import { useState } from "react";
import { formatRelativeTime } from "@/lib/date-utils";
import { LogCardMenu } from "@/components/log/log-card-menu";
import type { LogItem } from "@/server/queries/log";

type ReflectionValues = {
  id: string;
  stars: number | null;
  note: string | null;
};

type Props = {
  log: LogItem;
  onLogEdited: (logId: string, data: { newDate: Date; stars: number | null; note: string | null }) => void;
};

export function TimelineItem({ log, onLogEdited }: Props) {
  const [reflection, setReflection] = useState<ReflectionValues | null>(log.reflection);
  const { activity, performedAt } = log;
  const color = activity.color;

  function handleLogEdited(data: { newDate: Date; stars: number | null; note: string | null }) {
    setReflection((prev) =>
      data.stars != null || data.note != null
        ? { id: prev?.id ?? "", stars: data.stars, note: data.note }
        : null,
    );
    onLogEdited(log.id, data);
  }

  const cardStyle = {
    background: color
      ? `radial-gradient(ellipse at 0% 0%, ${color}1A 0%, transparent 60%), hsl(var(--card))`
      : "hsl(var(--card))",
    borderColor: color ? `${color}38` : "hsl(var(--border))",
    boxShadow: color ? `0 4px 20px -8px ${color}38` : undefined,
  };

  return (
    <div className="rounded-2xl border transition-all animate-in fade-in-0 duration-300" style={cardStyle}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span
          className="w-7 h-7 rounded-md flex items-center justify-center text-sm leading-none shrink-0"
          style={{ backgroundColor: color ? `${color}28` : "var(--surface-overlay)" }}
        >
          {activity.emoji ?? "·"}
        </span>

        <div className="flex-1 min-w-0">
          <span className="text-sm text-foreground truncate">{activity.name}</span>
          {reflection?.note && <p className="text-sm text-muted-foreground truncate mt-0.5">{reflection.note}</p>}
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <span className="text-xs tabular-nums text-muted-foreground">{formatRelativeTime(performedAt)}</span>
          <LogCardMenu
            logId={log.id}
            performedAt={performedAt}
            timeOnly
            stars={reflection?.stars}
            note={reflection?.note}
            onLogEdited={handleLogEdited}
          />
        </div>
      </div>
    </div>
  );
}
