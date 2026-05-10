"use client";

import { useState, useTransition } from "react";
import { createLog } from "@/server/actions/log";
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
import { Label } from "@/components/ui/label";
import { LogFormBody } from "@/components/log/log-form-body";
import { type DateMode, floorToNearest30 } from "@/lib/date-picker-utils";
import type { FieldType } from "@prisma/client";

type ActivityField = {
  id: string;
  name: string;
  type: FieldType;
  options: string[];
  isArchived: boolean;
};

type Activity = {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  fields: ActivityField[];
};

type Props = {
  activity?: Activity | null;
  activities?: Activity[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (logId: string, hasReflection: boolean) => void;
  defaultActivityId?: string | null;
};

export function CreateLogModal({ activity, activities, isOpen, onClose, onSuccess, defaultActivityId }: Props) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    () => activities?.find((a) => a.id === defaultActivityId) ?? null,
  );
  const [dateMode, setDateMode] = useState<DateMode>("today");
  const [otherDate, setOtherDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState(() => floorToNearest30(new Date()));
  const [stars, setStars] = useState<number | undefined>();
  const [note, setNote] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string | string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const resolvedActivity = activity ?? selectedActivity;
  const showActivitySelector = !activity && activities && activities.length > 0;

  function handleActivityChange(a: Activity) {
    setSelectedActivity(a);
    setFieldValues({});
  }

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
    if (!resolvedActivity) {
      setError("活動を選択してください");
      return;
    }
    const performedAt = getPerformedAt();
    setError(null);
    startTransition(async () => {
      const result = await createLog({
        activityId: resolvedActivity.id,
        performedAt,
        stars,
        note: note.trim() || undefined,
        fieldValues: Object.keys(fieldValues).length > 0 ? fieldValues : undefined,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      const hasReflection = stars !== undefined || note.trim() !== "";
      onSuccess(result.data.logId, hasReflection);
      onClose();
    });
  }

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>ピークを記録</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>アクティビティの実施日時と余韻を記録します。</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="space-y-4 overflow-y-auto pb-4">
          {/* Activity selector */}
          {showActivitySelector && (
            <div>
              <Label className="text-muted-foreground text-xs mb-1 block tracking-wide uppercase">活動</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {activities!.map((a) => {
                  const isSelected = selectedActivity?.id === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => handleActivityChange(a)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-150 active:scale-[0.98] text-left min-w-0"
                      style={
                        isSelected
                          ? { background: `${a.color ?? "#7C4DFF"}18`, borderColor: `${a.color ?? "#7C4DFF"}50` }
                          : { background: "var(--surface-overlay)", borderColor: "transparent" }
                      }
                    >
                      {a.emoji && <span className="text-base leading-none flex-shrink-0">{a.emoji}</span>}
                      <span className="text-sm text-foreground/80 font-medium truncate">{a.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <LogFormBody
            activity={resolvedActivity ?? null}
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
            noteInputId="create-log-note"
            error={error}
          />
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            キャンセル
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isPending || !resolvedActivity}>
            {isPending ? "記録中..." : "記録する"}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
