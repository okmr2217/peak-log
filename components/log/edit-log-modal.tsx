"use client";

import { useState, useTransition } from "react";
import { X, ChevronDown, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, startOfDay } from "date-fns";
import { updateLog } from "@/server/actions/log";
import { type DateMode, floorToNearest30, TIME_OPTIONS, DAY_PICKER_CLASS_NAMES } from "@/lib/date-picker-utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dialog, BottomSheetContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  logId: string;
  performedAt: Date;
  initialStars?: number | null;
  initialNote?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (data: { newDate: Date; stars: number | null; note: string | null }) => void;
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

export function EditLogModal({ logId, performedAt, initialStars, initialNote, isOpen, onClose, onSaved }: Props) {
  const [dateMode, setDateMode] = useState<DateMode>(() => getInitialDateMode(performedAt));
  const [otherDate, setOtherDate] = useState<Date>(() => startOfDay(performedAt));
  const [selectedTime, setSelectedTime] = useState(() => floorToNearest30(performedAt));
  const [stars, setStars] = useState<number | undefined>(initialStars ?? undefined);
  const [note, setNote] = useState(initialNote ?? "");
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
      const result = await updateLog({
        logId,
        performedAt: newPerformedAt,
        stars,
        note: note.trim() || undefined,
      });
      if (result.ok) {
        onSaved?.({
          newDate: newPerformedAt,
          stars: stars ?? null,
          note: note.trim() || null,
        });
        onClose();
      } else {
        setError(result.message);
      }
    });
  }

  const today = startOfDay(new Date());
  const dateModeLabels: Record<DateMode, string> = { today: "今日", yesterday: "昨日", other: "他の日" };
  const otherDateLabel = format(otherDate, "M月d日");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <BottomSheetContent>
        <VisuallyHidden>
          <DialogTitle>記録を編集</DialogTitle>
          <DialogDescription>記録の日時・スター数・メモを編集します。</DialogDescription>
        </VisuallyHidden>
        <div className="px-6 pt-4 pb-6 sm:pt-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-foreground font-semibold text-base">記録を編集</h2>
            <Button type="button" variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Date section */}
            <div>
              <Label className="text-muted-foreground text-xs mb-1.5 block tracking-wide uppercase">日付</Label>

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

            {/* Note + Stars */}
            <div className="space-y-1">
              <div>
                <Label htmlFor="edit-log-note" className="text-muted-foreground text-xs mb-1.5 block tracking-wide uppercase">
                  メモ
                </Label>
                <Textarea
                  id="edit-log-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={200}
                  rows={2}
                  placeholder="体験の余韻を残しておこう..."
                  className="bg-muted border-border rounded-xl px-3.5 py-2.5 placeholder:text-muted-foreground/50 resize-none focus-visible:ring-primary/50 leading-relaxed"
                />
                <p className="text-muted-foreground/50 text-xs text-right mt-1">{note.length}/200</p>
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

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
                className="flex-1 rounded-xl h-auto py-3 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                キャンセル
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-1 rounded-xl h-auto py-3"
              >
                {isPending ? "保存中..." : "保存する"}
              </Button>
            </div>
          </div>
        </div>
      </BottomSheetContent>
    </Dialog>
  );
}
