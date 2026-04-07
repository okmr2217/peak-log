"use client";

import { useState, useTransition } from "react";
import { X, ChevronDown, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, startOfDay } from "date-fns";
import { createLog } from "@/server/actions/log";
import { upsertReflection } from "@/server/actions/reflection";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dialog, BottomSheetContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { type DateMode, floorToNearest30, TIME_OPTIONS, DAY_PICKER_CLASS_NAMES } from "@/lib/date-picker-utils";

type Activity = {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
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
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const resolvedActivity = activity ?? selectedActivity;
  const showActivitySelector = !activity && activities && activities.length > 0;

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
      const result = await createLog({ activityId: resolvedActivity.id, performedAt });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      const logId = result.data.logId;
      const noteTrimmed = note.trim();
      const hasReflectionData = stars !== undefined || noteTrimmed !== "";
      if (hasReflectionData) {
        await upsertReflection({
          logId,
          stars,
          note: noteTrimmed || undefined,
        });
      }
      onSuccess(logId, hasReflectionData);
      onClose();
    });
  }

  const today = startOfDay(new Date());

  const dateModeLabels: Record<DateMode, string> = {
    today: "今日",
    yesterday: "昨日",
    other: "他の日",
  };

  const otherDateLabel = format(otherDate, "M月d日");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <BottomSheetContent className="max-h-[90dvh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>ピークを記録</DialogTitle>
          <DialogDescription>アクティビティの実施日時と余韻を記録します。</DialogDescription>
        </VisuallyHidden>

        <div className="h-[2px] mx-8 rounded-full opacity-70 mb-1" style={{ background: "linear-gradient(90deg, #7C4DFF, #00E5FF, #7C4DFF)" }} />

        <div className="px-6 pt-3 pb-6 sm:pb-5 sm:pt-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-foreground font-semibold text-base">ピークを記録</h2>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Activity selector */}
            {showActivitySelector && (
              <div>
                <Label className="text-muted-foreground text-xs mb-1.5 block tracking-wide uppercase">活動を選ぶ</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {activities!.map((a) => {
                    const isSelected = selectedActivity?.id === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setSelectedActivity(a)}
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

            {/* Date + Time row */}
            <div>
              <Label className="text-muted-foreground text-xs mb-1.5 block tracking-wide uppercase">日時</Label>

              {/* Date mode pills */}
              <div className="flex gap-2 mb-3">
                {(["today", "yesterday", "other"] as DateMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setDateMode(mode)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 flex-1 ${
                      dateMode === mode ? "text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"
                    }`}
                    style={
                      dateMode === mode
                        ? { background: "linear-gradient(135deg, #7C4DFF, #5533cc)", boxShadow: "0 0 14px 0 rgba(124,77,255,0.35)" }
                        : undefined
                    }
                  >
                    {dateModeLabels[mode]}
                  </button>
                ))}
              </div>

              {/* Inline Calendar for "他の日" */}
              {dateMode === "other" && (
                <div className="bg-muted/50 rounded-2xl p-3 border border-border mb-3">
                  <DayPicker
                    mode="single"
                    selected={otherDate}
                    onSelect={(d) => d && setOtherDate(d)}
                    disabled={{ after: today }}
                    defaultMonth={otherDate}
                    classNames={DAY_PICKER_CLASS_NAMES}
                    components={{
                      Chevron: ({ orientation }) =>
                        orientation === "left" ? (
                          <ChevronLeft className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        ),
                    }}
                  />
                  <p className="text-center text-xs text-muted-foreground mt-2 pt-2 border-t border-border">{otherDateLabel}</p>
                </div>
              )}

              {/* Time picker */}
              <div>
                <Label className="text-muted-foreground text-xs mb-1.5 block tracking-wide uppercase">時刻</Label>
                <div className="relative">
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full appearance-none bg-muted rounded-xl px-3.5 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer border border-border"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Memo + Stars */}
            <div className="space-y-1">
              <div>
                <Label htmlFor="create-log-note" className="text-muted-foreground text-xs mb-1.5 block tracking-wide uppercase">
                  メモ
                </Label>
                <Textarea
                  id="create-log-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  maxLength={200}
                  rows={2}
                  placeholder="体験の余韻を残しておこう..."
                  className="bg-muted border-border rounded-xl px-3.5 py-2.5 placeholder:text-muted-foreground/50 resize-none focus-visible:ring-primary/50 leading-relaxed"
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-muted-foreground/40 text-xs">
                    <kbd className="px-1 py-0.5 rounded border border-muted-foreground/20 bg-muted text-[10px] font-mono">Ctrl+Enter</kbd>
                    <span className="ml-1">で保存</span>
                  </span>
                  <p className="text-muted-foreground/50 text-xs">{note.length}/200</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs mb-1.5 block tracking-wide uppercase">スター数</Label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setStars(stars === v ? undefined : v)}
                      className="transition-all duration-150 active:scale-90"
                      aria-label={`${v}スター`}
                    >
                      <Star
                        className="w-7 h-7"
                        style={
                          stars != null && v <= stars
                            ? { fill: "#FBBF24", color: "#FBBF24" }
                            : { fill: "transparent", color: "hsl(var(--muted-foreground))" }
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !resolvedActivity}
              className="w-full rounded-xl py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              style={{
                background: isPending ? "rgba(124,77,255,0.5)" : "linear-gradient(135deg, #7C4DFF 0%, #5533cc 100%)",
                boxShadow: isPending || !resolvedActivity ? "none" : "0 4px 24px -4px rgba(124,77,255,0.5)",
              }}
            >
              {isPending ? "記録中..." : "記録する"}
            </button>
          </div>
        </div>
      </BottomSheetContent>
    </Dialog>
  );
}
