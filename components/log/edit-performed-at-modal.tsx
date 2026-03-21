"use client";

import { useState, useTransition } from "react";
import { X, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, startOfDay } from "date-fns";
import { updateLogPerformedAt } from "@/server/actions/log";
import { type DateMode, floorToNearest30, TIME_OPTIONS, DAY_PICKER_CLASS_NAMES } from "@/lib/date-picker-utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dialog, BottomSheetContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Props = {
  logId: string;
  performedAt: Date;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (newDate: Date) => void;
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

export function EditPerformedAtModal({ logId, performedAt, isOpen, onClose, onSaved }: Props) {
  const [dateMode, setDateMode] = useState<DateMode>(() => getInitialDateMode(performedAt));
  const [otherDate, setOtherDate] = useState<Date>(() => startOfDay(performedAt));
  const [selectedTime, setSelectedTime] = useState(() => floorToNearest30(performedAt));
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
    if (newPerformedAt > new Date()) {
      setError("未来の日時は記録できません");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateLogPerformedAt({ logId, performedAt: newPerformedAt });
      if (result.ok) {
        onSaved?.(newPerformedAt);
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
          <DialogTitle>日時を編集</DialogTitle>
          <DialogDescription>記録の実施日時を編集します。</DialogDescription>
        </VisuallyHidden>
        <div className="px-6 pt-4 pb-8 sm:pb-6 sm:pt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold text-base">日時を編集</h2>
            <Button type="button" variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-500 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-5">
            <div>
              <Label className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">日付</Label>

              {/* Date mode pills */}
              <div className="flex gap-2 mb-3">
                {(["today", "yesterday", "other"] as DateMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setDateMode(mode)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 flex-1 ${
                      dateMode === mode ? "text-white" : "bg-white/5 text-zinc-500 hover:bg-white/10"
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
                <div className="bg-white/3 rounded-2xl p-3 border border-white/5 mb-3">
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
                  <p className="text-center text-xs text-zinc-500 mt-2 pt-2 border-t border-white/5">{otherDateLabel}</p>
                </div>
              )}

              {/* Time picker */}
              <div>
                <Label className="text-zinc-500 text-xs mb-2 block tracking-wide uppercase">時刻</Label>
                <div className="relative">
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full appearance-none bg-white/5 rounded-xl px-3.5 py-3 text-white text-sm [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-[#7C4DFF]/50 cursor-pointer"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t} className="bg-[#1A1A1A]">
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
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
                className="flex-1 rounded-xl h-auto py-3.5 border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white"
              >
                キャンセル
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-1 rounded-xl h-auto py-3.5"
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
