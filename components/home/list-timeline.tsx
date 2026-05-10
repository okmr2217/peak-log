"use client";

import { useState, useEffect, useTransition } from "react";
import { Star } from "lucide-react";
import type { HistoryDayItem, LogEditedPayload, LogItem } from "@/server/queries/log";
import { formatDayFull, formatTime } from "@/lib/date-utils";
import { getDayType, getDateTextClassName } from "@/lib/day-type";
import { LogDetailModal } from "@/components/log/log-detail-modal";
import { EditLogModal } from "@/components/log/edit-log-modal";
import { deleteLog } from "@/server/actions/log";
import { DeleteLogAlertDialog } from "@/components/log/delete-log-alert-dialog";

type Props = {
  initialItems: HistoryDayItem[];
};

type ChipProps = {
  log: LogItem;
};

function LogChip({ log }: ChipProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [performedAt, setPerformedAt] = useState(log.performedAt);
  const [stars, setStars] = useState(log.stars ?? null);
  const [note, setNote] = useState(log.note ?? null);
  const [fieldValues, setFieldValues] = useState(log.fieldValues);
  const [isPending, startTransition] = useTransition();

  const activity = log.activity;
  const color = activity.color;

  function handleLogEdited(data: LogEditedPayload) {
    setPerformedAt(data.newDate);
    setStars(data.stars);
    setNote(data.note);
    setFieldValues(data.fieldValues);
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteLog(log.id);
    });
  }

  const hoverFields = activity.fields
    .map((f) => ({
      label: f.name,
      value: Array.isArray(fieldValues?.[f.id])
        ? (fieldValues[f.id] as string[]).join("、")
        : (fieldValues?.[f.id] as string | undefined) ?? null,
    }))
    .filter((f): f is { label: string; value: string } => f.value !== null && f.value !== "");

  const hasFields = hoverFields.length > 0;
  const hasNote = !!note;

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => setIsDetailOpen(true)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-sm shrink-0 hover:brightness-110 transition-all"
        style={{
          background: color ? `${color}22` : "var(--surface-overlay)",
          borderColor: color ? `${color}44` : "hsl(var(--border))",
        }}
      >
        <span className="text-sm leading-none">{activity.emoji ?? "·"}</span>
        <span className="tabular-nums text-sm leading-none font-semibold">{formatTime(performedAt)}</span>
      </button>

      <div
        className="absolute bottom-[calc(100%+8px)] left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50"
        style={{ minWidth: 200, maxWidth: 260 }}
      >
        <div
          className="rounded-[10px] px-3 py-2.5 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.12)]"
          style={{ background: "hsl(var(--card))", border: "0.5px solid hsl(var(--border))" }}
        >
          <div className="flex items-start gap-2">
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-[6px] text-base leading-none"
              style={{ width: 28, height: 28, background: color ? `${color}28` : "hsl(var(--muted))" }}
            >
              {activity.emoji ?? "·"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium leading-tight truncate">{activity.name}</p>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{formatTime(performedAt)}</p>
            </div>
            {stars != null && (
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {[1, 2, 3, 4, 5].map((v) => (
                  <Star
                    key={v}
                    className="w-3 h-3"
                    style={v <= stars ? { fill: "#EF9F27", color: "#EF9F27" } : { fill: "transparent", color: "hsl(var(--muted-foreground))" }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="my-2" style={{ borderTop: "0.5px solid hsl(var(--border))" }} />

          {!hasFields && !hasNote ? (
            <p className="text-[12px] text-muted-foreground">メモ・フィールドなし</p>
          ) : (
            <>
              {hasFields && (
                <div className="flex flex-col gap-1">
                  {hoverFields.map((f) => (
                    <div key={f.label} className="flex justify-between gap-2">
                      <span className="text-[12px] text-muted-foreground shrink-0">{f.label}</span>
                      <span className="text-[12px] text-foreground text-right break-words">{f.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {hasFields && hasNote && <div className="my-2" style={{ borderTop: "0.5px solid hsl(var(--border))" }} />}
              {hasNote && (
                <p className="text-[12px] text-muted-foreground leading-[1.55] break-words">{note}</p>
              )}
            </>
          )}
        </div>
      </div>

      <LogDetailModal
        activity={log.activity}
        performedAt={performedAt}
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
        performedAt={performedAt}
        initialStars={stars}
        initialNote={note}
        activity={log.activity}
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
    </div>
  );
}

export function ListTimeline({ initialItems }: Props) {
  const [dayItems, setDayItems] = useState<HistoryDayItem[]>(initialItems);

  useEffect(() => {
    setDayItems(initialItems);
  }, [initialItems]);

  const daysWithLogs = dayItems.filter((d) => d.logs.length > 0);

  if (daysWithLogs.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">この期間のピークはありません</p>
      </div>
    );
  }

  return (
    <div>
      {daysWithLogs.map(({ date, logs }) => (
        <div key={date} className="flex flex-col gap-1 py-1.5 px-1">
          <span className={`text-sm font-semibold tabular-nums ${getDateTextClassName(getDayType(date))}`}>
            {formatDayFull(date)}
          </span>
          <span className="flex flex-wrap gap-x-1.5 gap-y-2">
            {logs.map((log) => (
              <LogChip key={log.id} log={log} />
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}
