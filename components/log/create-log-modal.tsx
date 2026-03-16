"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, startOfDay, isAfter } from "date-fns";
import dayjs from "dayjs";
import { createLog } from "@/server/actions/log";
import { upsertReflection } from "@/server/actions/reflection";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dialog, BottomSheetContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type DateMode = "today" | "yesterday" | "other";

function floorToNearest30(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const floored = minutes < 30 ? 0 : 30;
  return `${String(hours).padStart(2, "0")}:${String(floored).padStart(2, "0")}`;
}

const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:00`);
  TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:30`);
}

function RatingButtons({
  value,
  onChange,
  color,
  shadowColor,
  textClass,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  color: string;
  shadowColor: string;
  textClass: string;
}) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((v) => {
        const isActive = value != null && value >= v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(value === v ? undefined : v)}
            className={`w-10 h-10 rounded-full text-sm font-semibold transition-all duration-200 active:scale-90 ${
              isActive ? textClass : "bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
            }`}
            style={
              isActive
                ? {
                    background: color,
                    boxShadow: `0 0 18px 0 ${shadowColor}`,
                    transform: "scale(1.08)",
                  }
                : undefined
            }
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}

type Activity = {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
};

type Props = {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (logId: string, hasReflection: boolean) => void;
};

export function CreateLogModal({ activity, isOpen, onClose, onSuccess }: Props) {
  const [dateMode, setDateMode] = useState<DateMode>("today");
  const [otherDate, setOtherDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState(() => floorToNearest30(new Date()));
  const [timeOpen, setTimeOpen] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [excitement, setExcitement] = useState<number | undefined>();
  const [achievement, setAchievement] = useState<number | undefined>();
  const [wantAgain, setWantAgain] = useState<boolean | undefined>();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const selectedTimeRef = useRef<HTMLButtonElement>(null);

  // Scroll selected time into view when popover opens
  useEffect(() => {
    if (timeOpen && selectedTimeRef.current) {
      setTimeout(() => {
        selectedTimeRef.current?.scrollIntoView({ block: "center" });
      }, 50);
    }
  }, [timeOpen]);

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
    const performedAt = getPerformedAt();
    if (performedAt > new Date()) {
      setError("未来の日時は記録できません");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createLog({ activityId: activity.id, performedAt });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      const logId = result.data.logId;
      const hasReflectionData =
        showReflection &&
        (excitement !== undefined || achievement !== undefined || wantAgain !== undefined || note.trim() !== "");
      if (hasReflectionData) {
        await upsertReflection({
          logId,
          excitement,
          achievement,
          wantAgain,
          note: note.trim() || undefined,
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

  // Format display date for "other" mode
  const otherDateLabel = format(otherDate, "M月d日");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <BottomSheetContent className="max-h-[90dvh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>ピークを記録</DialogTitle>
          <DialogDescription>アクティビティの実施日時と余韻を記録します。</DialogDescription>
        </VisuallyHidden>

        <div className="h-[2px] mx-8 rounded-full opacity-70 mb-1" style={{ background: "linear-gradient(90deg, #7C4DFF, #00E5FF, #7C4DFF)" }} />

        <div className="px-6 pt-4 pb-8 sm:pb-6 sm:pt-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-semibold text-base">ピークを記録</h2>
              <p className="text-zinc-500 text-[11px] mt-0.5">
                {activity.emoji && <span className="mr-1">{activity.emoji}</span>}
                {activity.name}
              </p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-500 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-5">
            {/* Date + Time row */}
            <div>
              <Label className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">いつの体験として残しますか？</Label>

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
                    classNames={{
                      root: "w-full relative",
                      months: "flex flex-col",
                      month: "flex flex-col gap-1",
                      month_caption: "flex justify-center relative items-center h-9 mb-1",
                      caption_label: "text-sm font-semibold text-white",
                      nav: "absolute inset-x-0 top-0 flex justify-between items-center h-9 px-1",
                      button_previous:
                        "h-7 w-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors",
                      button_next:
                        "h-7 w-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors",
                      month_grid: "w-full border-collapse",
                      weekdays: "flex",
                      weekday: "flex-1 text-center text-[11px] text-zinc-500 font-normal pb-2",
                      week: "flex",
                      day: "flex-1 p-0 flex items-center justify-center",
                      day_button:
                        "h-8 w-8 rounded-full text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center",
                      selected: "[&>button]:!bg-[#7C4DFF] [&>button]:!text-white [&>button]:shadow-[0_0_12px_rgba(124,77,255,0.5)]",
                      today: "[&:not(.rdp-selected)>button]:ring-1 [&:not(.rdp-selected)>button]:ring-[#7C4DFF]/50 [&:not(.rdp-selected)>button]:text-white",
                      outside: "opacity-20 pointer-events-none",
                      disabled: "opacity-20 pointer-events-none",
                      hidden: "invisible",
                    }}
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
                <Popover open={timeOpen} onOpenChange={setTimeOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2.5 bg-white/5 rounded-xl px-3.5 py-3 text-white text-sm hover:bg-white/8 transition-colors"
                    >
                      <Clock className="h-4 w-4 text-zinc-500 shrink-0" />
                      <span className="font-medium tabular-nums">{selectedTime}</span>
                      <ChevronDown className="h-4 w-4 text-zinc-500 ml-auto shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 p-1" align="start">
                    <div style={{ maxHeight: "13rem", overflowY: "auto" }}>
                      {TIME_OPTIONS.map((t) => {
                        const isSelected = t === selectedTime;
                        return (
                          <button
                            key={t}
                            ref={isSelected ? selectedTimeRef : undefined}
                            type="button"
                            onClick={() => {
                              setSelectedTime(t);
                              setTimeOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors tabular-nums ${
                              isSelected ? "text-white font-semibold" : "text-zinc-300 hover:bg-white/10"
                            }`}
                            style={isSelected ? { background: "linear-gradient(135deg, #7C4DFF, #5533cc)" } : undefined}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Reflection section — collapsed by default */}
            <div className="border-t border-white/5 pt-4">
              <button type="button" onClick={() => setShowReflection(!showReflection)} className="w-full flex items-center justify-between text-left">
                <span className="text-zinc-400 text-sm font-medium">余韻も一緒に残す</span>
                {showReflection ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
              </button>
              <p className="text-zinc-600 text-[11px] mt-0.5">任意・後から追加もできます</p>

              {showReflection && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">興奮</Label>
                    <RatingButtons
                      value={excitement}
                      onChange={setExcitement}
                      color="#7C4DFF"
                      shadowColor="rgba(124,77,255,0.55)"
                      textClass="text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">達成感</Label>
                    <RatingButtons
                      value={achievement}
                      onChange={setAchievement}
                      color="rgba(0,229,255,0.75)"
                      shadowColor="rgba(0,229,255,0.4)"
                      textClass="text-[#0A0A0A] font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">またやりたい</Label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setWantAgain(wantAgain === true ? undefined : true)}
                        className="px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95"
                        style={
                          wantAgain === true
                            ? {
                                background: "linear-gradient(135deg, #7C4DFF, #9c6fff)",
                                color: "#fff",
                                boxShadow: "0 0 14px 0 rgba(124,77,255,0.45)",
                              }
                            : { background: "rgba(255,255,255,0.05)", color: "rgb(113,113,122)" }
                        }
                      >
                        またやりたい
                      </button>
                      <button
                        type="button"
                        onClick={() => setWantAgain(wantAgain === false ? undefined : false)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 ${
                          wantAgain === false ? "bg-white/15 text-zinc-300" : "bg-white/5 text-zinc-500 hover:bg-white/10"
                        }`}
                      >
                        今回は十分
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="create-log-note" className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">
                      メモ
                    </Label>
                    <Textarea
                      id="create-log-note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={200}
                      rows={3}
                      placeholder="体験の余韻を残しておこう..."
                      className="bg-white/5 border-0 rounded-xl px-3.5 py-3 placeholder:text-zinc-600 resize-none focus-visible:ring-[#7C4DFF]/50 leading-relaxed"
                    />
                    <p className="text-zinc-700 text-xs text-right mt-1">{note.length}/200</p>
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              style={{
                background: isPending ? "rgba(124,77,255,0.5)" : "linear-gradient(135deg, #7C4DFF 0%, #5533cc 100%)",
                boxShadow: isPending ? "none" : "0 4px 24px -4px rgba(124,77,255,0.5)",
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
