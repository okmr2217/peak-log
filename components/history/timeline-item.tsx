"use client";

import { useState } from "react";
import { formatRelativeTime } from "@/lib/date-utils";
import { LogCardMenu } from "@/components/log/log-card-menu";
import { ReflectionModal } from "@/components/reflection/reflection-modal";
import type { LogItem } from "@/server/queries/log";

type ReflectionValues = {
  id: string;
  excitement: number | null;
  achievement: number | null;
  wantAgain: boolean | null;
  note: string | null;
};

type Props = {
  log: LogItem;
  onReflectionSaved: (logId: string, reflection: ReflectionValues) => void;
  onPerformedAtSaved: (logId: string, newDate: Date) => void;
};

export function TimelineItem({ log, onReflectionSaved, onPerformedAtSaved }: Props) {
  const [reflection, setReflection] = useState<ReflectionValues | null>(log.reflection);
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const { activity, performedAt } = log;
  const color = activity.color;

  function handleReflectionSaved(r: ReflectionValues) {
    setReflection(r);
    onReflectionSaved(log.id, r);
  }

  const cardStyle = {
    background: color
      ? `radial-gradient(ellipse at 0% 0%, ${color}1A 0%, transparent 60%), #1A1A1A`
      : "#1A1A1A",
    borderColor: color ? `${color}38` : "rgba(255,255,255,0.08)",
    boxShadow: color ? `0 4px 20px -8px ${color}38` : `0 2px 10px -4px rgba(0,0,0,0.4)`,
  };

  return (
    <div className="rounded-2xl border transition-all animate-in fade-in-0 duration-300" style={cardStyle}>
      <div className="flex items-center gap-2.5 px-3.5 py-2.5">
        <span
          className="w-7 h-7 rounded-md flex items-center justify-center text-sm leading-none shrink-0"
          style={{ backgroundColor: color ? `${color}28` : "rgba(255,255,255,0.07)" }}
        >
          {activity.emoji ?? "·"}
        </span>

        <div className="flex-1 min-w-0">
          <span className="text-sm text-zinc-200 truncate">{activity.name}</span>
          {reflection?.note && <p className="text-sm text-zinc-500 truncate mt-0.5">{reflection.note}</p>}
        </div>

        <span className="text-sm tabular-nums text-zinc-500 shrink-0">{formatRelativeTime(performedAt)}</span>

        <LogCardMenu
          logId={log.id}
          performedAt={performedAt}
          timeOnly
          hasReflection={!!reflection}
          onAddReflection={() => setReflectionOpen(true)}
          onPerformedAtSaved={(newDate) => onPerformedAtSaved(log.id, newDate)}
        />
      </div>

      <ReflectionModal
        logId={log.id}
        initialValues={reflection ?? undefined}
        isOpen={reflectionOpen}
        onClose={() => setReflectionOpen(false)}
        onSaved={handleReflectionSaved}
      />
    </div>
  );
}
