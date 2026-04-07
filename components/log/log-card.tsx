"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { LogCardMenu } from "./log-card-menu";

type ReflectionValues = {
  id: string;
  stars: number | null;
  note: string | null;
};

type LogCardProps = {
  log: {
    id: string;
    performedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    activity: {
      id: string;
      name: string;
      emoji: string | null;
      color: string | null;
    };
    reflection: ReflectionValues | null;
  };
  usage: "home" | "history";
  onLogEdited?: (logId: string, data: { newDate: Date; stars: number | null; note: string | null }) => void;
};

export function LogCard({ log, usage, onLogEdited }: LogCardProps) {
  const { activity, performedAt } = log;
  const timeOnly = usage === "history";
  const [reflection, setReflection] = useState<ReflectionValues | null>(log.reflection);

  const color = activity.color;
  const cardStyle = {
    background: color
      ? `radial-gradient(ellipse at 0% 0%, ${color}1A 0%, transparent 60%), hsl(var(--card))`
      : "hsl(var(--card))",
    borderColor: color ? `${color}38` : "hsl(var(--border))",
    boxShadow: color ? `0 4px 20px -8px ${color}38` : undefined,
  };

  function handleLogEdited(data: { newDate: Date; stars: number | null; note: string | null }) {
    setReflection((prev) =>
      data.stars != null || data.note != null
        ? { id: prev?.id ?? "", stars: data.stars, note: data.note }
        : null,
    );
    onLogEdited?.(log.id, data);
  }

  return (
    <div
      className="rounded-2xl border transition-all animate-in fade-in-0 duration-300"
      style={cardStyle}
    >
      {/* Header row */}
      <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-2.5">
        {activity.emoji && (
          <span
            className="text-sm leading-none flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: color ? `${color}28` : "var(--surface-overlay)" }}
          >
            {activity.emoji}
          </span>
        )}
        <span className="text-foreground font-medium text-sm tracking-tight flex-1 min-w-0 truncate">
          {activity.name}
        </span>
        <LogCardMenu
          logId={log.id}
          activity={activity}
          performedAt={performedAt}
          createdAt={log.createdAt}
          updatedAt={log.updatedAt}
          timeOnly={timeOnly}
          stars={reflection?.stars}
          note={reflection?.note}
          onLogEdited={handleLogEdited}
        />
      </div>

      {/* Reflection area - only shown when reflection exists */}
      {reflection && (
        <div
          className="pb-4 border-t"
          style={{
            paddingLeft: "14px",
            paddingRight: "14px",
            borderColor: color ? `${color}22` : "hsl(var(--border))",
            background: "var(--surface-overlay)",
          }}
        >
          <div className="pt-3 space-y-2.5">
            {reflection.stars != null && (
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((v) => (
                  <Star
                    key={v}
                    className="w-3 h-3"
                    style={
                      v <= reflection.stars!
                        ? { fill: "#FBBF24", color: "#FBBF24" }
                        : { fill: "transparent", color: "hsl(var(--muted-foreground))" }
                    }
                  />
                ))}
              </div>
            )}
            {reflection.note && (
              <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 whitespace-pre-wrap">{reflection.note}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
