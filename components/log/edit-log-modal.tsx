"use client";

import { useState, useTransition } from "react";
import { updateLog } from "@/server/actions/log";
import { startOfDay } from "date-fns";
import { type DateMode, floorToNearest30 } from "@/lib/date-picker-utils";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { LogFormBody } from "@/components/log/log-form-body";
import type { LogEditedPayload } from "@/server/queries/log";
import type { ActivityFieldForLog } from "@/server/queries/activity";

type Props = {
  logId: string;
  performedAt: Date;
  initialStars?: number | null;
  initialNote?: string | null;
  activity: {
    id: string;
    name: string;
    emoji: string | null;
    color: string | null;
    fields: ActivityFieldForLog[];
  };
  initialFieldValues?: Record<string, string | string[]> | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (data: LogEditedPayload) => void;
};

function getInitialDateMode(performedAt: Date): DateMode {
  const todayStart = startOfDay(new Date());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const performedAtDay = startOfDay(performedAt);
  if (performedAtDay.getTime() === todayStart.getTime()) return "today";
  if (performedAtDay.getTime() === yesterdayStart.getTime()) return "yesterday";
  return "other";
}

export function EditLogModal({ logId, performedAt, initialStars, initialNote, activity, initialFieldValues, isOpen, onClose, onSaved }: Props) {
  const [dateMode, setDateMode] = useState<DateMode>(() => getInitialDateMode(performedAt));
  const [otherDate, setOtherDate] = useState<Date>(() => startOfDay(performedAt));
  const [selectedTime, setSelectedTime] = useState(() => floorToNearest30(performedAt));
  const [stars, setStars] = useState<number | undefined>(initialStars ?? undefined);
  const [note, setNote] = useState(initialNote ?? "");
  const [fieldValues, setFieldValues] = useState<Record<string, string | string[]>>(() => {
    if (!initialFieldValues) return {};
    const cleaned: Record<string, string | string[]> = {};
    for (const [k, v] of Object.entries(initialFieldValues)) {
      if (typeof v === "string" || (Array.isArray(v) && v.every((x) => typeof x === "string"))) {
        cleaned[k] = v;
      }
    }
    return cleaned;
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function getPerformedAt(): Date {
    let date: Date;
    if (dateMode === "today") date = new Date();
    else if (dateMode === "yesterday") {
      date = new Date();
      date.setDate(date.getDate() - 1);
    } else {
      date = new Date(otherDate);
    }
    const [hours, minutes] = selectedTime.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  function handleSubmit() {
    const newPerformedAt = getPerformedAt();
    setError(null);
    startTransition(async () => {
      const shouldSendFieldValues = activity.fields.length > 0;
      const result = await updateLog({
        logId,
        performedAt: newPerformedAt,
        stars,
        note: note.trim() || undefined,
        ...(shouldSendFieldValues && { fieldValues }),
      });
      if (result.ok) {
        onSaved?.({
          newDate: newPerformedAt,
          stars: stars ?? null,
          note: note.trim() || null,
          fieldValues: Object.keys(fieldValues).length > 0 ? fieldValues : null,
        });
        onClose();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>記録を編集</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>記録の日時・スター数・メモを編集します。</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="space-y-4 overflow-y-auto">
          {/* Activity indicator */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: `${activity.color ?? "#7C4DFF"}12`,
              border: `1px solid ${activity.color ?? "#7C4DFF"}30`,
            }}
          >
            {activity.emoji && <span className="text-base leading-none">{activity.emoji}</span>}
            <span className="text-sm font-medium" style={{ color: `${activity.color ?? "#7C4DFF"}EE` }}>
              {activity.name}
            </span>
          </div>

          <LogFormBody
            activity={activity}
            fieldValues={fieldValues}
            onFieldValuesChange={setFieldValues}
            dateMode={dateMode}
            onDateModeChange={setDateMode}
            otherDate={otherDate}
            onOtherDateChange={setOtherDate}
            selectedTime={selectedTime}
            onSelectedTimeChange={setSelectedTime}
            note={note}
            onNoteChange={setNote}
            stars={stars}
            onStarsChange={setStars}
            onCtrlEnter={handleSubmit}
            noteInputId="edit-log-note"
            error={error}
          />
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            キャンセル
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "保存中..." : "保存する"}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
