"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { formatCompactTime } from "@/lib/date-utils";
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
  const [currentDate, setCurrentDate] = useState(log.performedAt);
  const { activity } = log;
  const color = activity.color;

  function handleLogEdited(data: { newDate: Date; stars: number | null; note: string | null }) {
    setCurrentDate(data.newDate);
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
    boxShadow: color ? `0 2px 12px -6px ${color}38` : undefined,
  };

  return (
    <div className="rounded-xl border transition-all animate-in fade-in-0 duration-300" style={cardStyle}>
      {/* Main row */}
      <div className="flex items-center gap-2.5 px-3 pt-2 pb-1">
        <span
          className="w-6 h-6 rounded-md flex items-center justify-center text-xs leading-none shrink-0"
          style={{ backgroundColor: color ? `${color}28` : "var(--surface-overlay)" }}
        >
          {activity.emoji ?? "·"}
        </span>

        <span className="text-sm font-medium text-foreground truncate flex-1 min-w-0">{activity.name}</span>

        {reflection?.stars != null && (
          <div className="flex items-center gap-0.5 shrink-0">
            {[1, 2, 3, 4, 5].map((v) => (
              <Star
                key={v}
                className="w-2.5 h-2.5"
                style={
                  v <= reflection.stars!
                    ? { fill: "#FBBF24", color: "#FBBF24" }
                    : { fill: "transparent", color: "hsl(var(--muted-foreground))" }
                }
              />
            ))}
          </div>
        )}

        <span className="text-xs tabular-nums text-muted-foreground shrink-0">{formatCompactTime(currentDate)}</span>
        <LogCardMenu
          logId={log.id}
          performedAt={currentDate}
          timeOnly
          stars={reflection?.stars}
          note={reflection?.note}
          onLogEdited={handleLogEdited}
        />
      </div>

      {/* Note row - only when exists, left-aligned with activity name */}
      {reflection?.note && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 whitespace-pre-wrap pl-[46px] pr-3 pb-2">
          {reflection.note}
        </p>
      )}
    </div>
  );
}
