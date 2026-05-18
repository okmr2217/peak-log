"use client";

import { useState, useTransition } from "react";
import { formatCompactTime } from "@/lib/date-utils";
import { LogDetailModal } from "./log-detail-modal";
import { EditLogModal } from "./edit-log-modal";
import { NoteText } from "./note-text";
import { deleteLog } from "@/server/actions/log";
import { DeleteLogAlertDialog } from "@/components/log/delete-log-alert-dialog";
import type { LogEditedPayload, LogItem } from "@/server/queries/log";

type Props = {
  log: LogItem;
  onLogEdited: (logId: string, data: LogEditedPayload) => void;
};

export function LogCard({ log, onLogEdited }: Props) {
  const [stars, setStars] = useState<number | null>(log.stars ?? null);
  const [note, setNote] = useState<string | null>(log.note ?? null);
  const [currentDate, setCurrentDate] = useState(log.performedAt);
  const [fieldValues, setFieldValues] = useState<Record<string, string | string[]> | null>(log.fieldValues);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { activity } = log;
  const color = activity.color;

  function handleLogEdited(data: LogEditedPayload) {
    setCurrentDate(data.newDate);
    setStars(data.stars);
    setNote(data.note);
    setFieldValues(data.fieldValues);
    onLogEdited(log.id, data);
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteLog(log.id);
    });
  }

  const fieldEntries: { id: string; name: string; displayValue: string }[] = [];
  if (fieldValues != null && activity.fields.length > 0) {
    for (const field of activity.fields) {
      const raw = fieldValues[field.id];
      if (raw === undefined) continue;
      if (Array.isArray(raw)) {
        if (raw.length === 0) continue;
        fieldEntries.push({ id: field.id, name: field.name, displayValue: raw.join("、") });
      } else {
        if (raw.trim() === "") continue;
        fieldEntries.push({ id: field.id, name: field.name, displayValue: raw });
      }
    }
  }

  return (
    <>
      <div
        className="rounded-xl border border-border bg-card cursor-pointer animate-in fade-in-0 duration-300"
        onClick={() => setIsDetailOpen(true)}
      >
        {/* Header row */}
        <div className="flex items-center gap-2 px-3 pt-3 pb-2.5">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base leading-none shrink-0"
            style={{ backgroundColor: color ? `${color}28` : "hsl(var(--muted))" }}
          >
            {activity.emoji ?? "·"}
          </span>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-foreground truncate block">{activity.name}</span>
            <span className="text-xs tabular-nums text-muted-foreground block">{formatCompactTime(currentDate)}</span>
          </div>
        </div>

        {/* Fields section */}
        {fieldEntries.length > 0 && (
          <>
            <div className="border-t border-border" />
            <div className="pl-[52px] pr-3 py-2 text-xs text-muted-foreground/80">
              {fieldEntries.map((entry, i) => (
                <span key={entry.id}>
                  {i > 0 && <span className="mx-1 opacity-40">·</span>}
                  <span className="opacity-60">{entry.name}</span>{" "}
                  <span className="text-foreground/70">{entry.displayValue}</span>
                </span>
              ))}
            </div>
          </>
        )}

        {/* Note section */}
        {note && (
          <>
            <div className="border-t border-border" />
            <div className="pl-[52px] pr-3 py-2">
              <NoteText text={note} singleLine className="text-xs text-muted-foreground" />
            </div>
          </>
        )}
      </div>

      <LogDetailModal
        activity={activity}
        performedAt={currentDate}
        stars={stars}
        note={note}
        fieldValues={fieldValues}
        createdAt={log.createdAt}
        updatedAt={log.updatedAt}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEditRequest={() => {
          setIsDetailOpen(false);
          setIsEditOpen(true);
        }}
        onDelete={() => {
          setIsDetailOpen(false);
          setIsDeleteOpen(true);
        }}
      />

      <EditLogModal
        logId={log.id}
        performedAt={currentDate}
        initialStars={stars}
        initialNote={note}
        activity={{
          id: activity.id,
          name: activity.name,
          emoji: activity.emoji,
          color: activity.color,
          fields: activity.fields,
        }}
        initialFieldValues={fieldValues}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSaved={handleLogEdited}
      />

      <DeleteLogAlertDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
        isPending={isPending}
      />
    </>
  );
}
