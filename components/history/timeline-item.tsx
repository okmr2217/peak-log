"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { formatCompactTime } from "@/lib/date-utils";
import { LogCardMenu } from "@/components/log/log-card-menu";
import { LogFieldValuesPreview } from "@/components/log/log-field-values-preview";
import type { LogItem } from "@/server/queries/log";

type Props = {
  log: LogItem;
  onLogEdited: (logId: string, data: { newDate: Date; stars: number | null; note: string | null; fieldValues: Record<string, string | string[]> | null }) => void;
};

export function TimelineItem({ log, onLogEdited }: Props) {
  const [stars, setStars] = useState<number | null>(log.stars ?? null);
  const [note, setNote] = useState<string | null>(log.note ?? null);
  const [currentDate, setCurrentDate] = useState(log.performedAt);
  const [fieldValues, setFieldValues] = useState<Record<string, string | string[]> | null>(log.fieldValues);
  const { activity } = log;
  const color = activity.color;

  function handleLogEdited(data: { newDate: Date; stars: number | null; note: string | null; fieldValues: Record<string, string | string[]> | null }) {
    setCurrentDate(data.newDate);
    setStars(data.stars);
    setNote(data.note);
    setFieldValues(data.fieldValues);
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

        {stars != null && (
          <div className="flex items-center gap-0.5 shrink-0">
            {[1, 2, 3, 4, 5].map((v) => (
              <Star
                key={v}
                className="w-2.5 h-2.5"
                style={
                  v <= stars
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
          activity={activity}
          performedAt={currentDate}
          createdAt={log.createdAt}
          updatedAt={log.updatedAt}
          timeOnly
          stars={stars}
          note={note}
          fieldValues={fieldValues}
          onLogEdited={handleLogEdited}
        />
      </div>

      {/* Field values preview */}
      {fieldValues != null && activity.fields.length > 0 && (
        <LogFieldValuesPreview fieldValues={fieldValues} fields={activity.fields} />
      )}

      {/* Note row - only when exists, left-aligned with activity name */}
      {note && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 whitespace-pre-wrap pl-[46px] pr-3 pb-2">
          {note}
        </p>
      )}
    </div>
  );
}
