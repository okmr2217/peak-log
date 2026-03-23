"use client";

import { useState } from "react";
import { formatTime } from "@/lib/date-utils";
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

  return (
    <div className="flex items-start gap-3 pl-4 border-l-2 border-zinc-800 py-2">
      <span
        className="w-6 h-6 rounded-md flex items-center justify-center text-sm leading-none shrink-0"
        style={{ backgroundColor: color ? `${color}28` : "rgba(255,255,255,0.07)" }}
      >
        {activity.emoji ?? "·"}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-zinc-200 truncate">{activity.name}</span>
        </div>
        {reflection?.note && <p className="text-sm text-zinc-500 truncate mt-1.5">{reflection.note}</p>}
      </div>

      <span className="text-sm tabular-nums text-zinc-500 shrink-0 mt-0.5">{formatTime(performedAt)}</span>

      <LogCardMenu
        logId={log.id}
        performedAt={performedAt}
        timeOnly
        hasReflection={!!reflection}
        onAddReflection={() => setReflectionOpen(true)}
        onPerformedAtSaved={(newDate) => onPerformedAtSaved(log.id, newDate)}
      />

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
