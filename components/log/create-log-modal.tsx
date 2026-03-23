"use client";

import { useState, useTransition } from "react";
import { X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [showReflection, setShowReflection] = useState(false);
  const [excitement, setExcitement] = useState<number | undefined>();
  const [achievement, setAchievement] = useState<number | undefined>();
  const [wantAgain, setWantAgain] = useState<boolean | undefined>();
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
    if (performedAt > new Date()) {
      setError("未来の日時は記録できません");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createLog({ activityId: resolvedActivity.id, performedAt });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      const logId = result.data.logId;
      const noteTrimmed = note.trim();
      const hasRatingData = showReflection && (excitement !== undefined || achievement !== undefined || wantAgain !== undefined);
      const hasReflectionData = hasRatingData || noteTrimmed !== "";
      if (hasReflectionData) {
        await upsertReflection({
          logId,
          excitement: showReflection ? excitement : undefined,
          achievement: showReflection ? achievement : undefined,
          wantAgain: showReflection ? wantAgain : undefined,
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

        <div className="px-6 pt-4 pb-8 sm:pb-6 sm:pt-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-semibold text-base">ピークを記録</h2>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-500 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-5">
            {/* Activity selector */}
            {showActivitySelector && (
              <div>
                <Label className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">活動を選ぶ</Label>
                <div className="space-y-1.5">
                  {activities!.map((a) => {
                    const isSelected = selectedActivity?.id === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setSelectedActivity(a)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-150 active:scale-[0.98] text-left"
                        style={
                          isSelected
                            ? { background: `${a.color ?? "#7C4DFF"}18`, borderColor: `${a.color ?? "#7C4DFF"}50` }
                            : { background: "rgba(255,255,255,0.04)", borderColor: "transparent" }
                        }
                      >
                        <span className="w-0.5 self-stretch rounded-full flex-shrink-0" style={{ background: a.color ?? "#7C4DFF" }} />
                        {a.emoji && <span className="text-lg leading-none">{a.emoji}</span>}
                        <span className="text-sm text-white/80 font-medium">{a.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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

            {/* Memo */}
            <div>
              <Label htmlFor="create-log-note" className="text-zinc-500 text-xs mb-2 block tracking-wide uppercase">
                メモ（任意）
              </Label>
              <Textarea
                id="create-log-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
                rows={2}
                placeholder="体験の余韻を残しておこう..."
                className="bg-white/5 border-0 rounded-xl px-3.5 py-3 placeholder:text-zinc-600 resize-none focus-visible:ring-[#7C4DFF]/50 leading-relaxed"
              />
              <p className="text-zinc-700 text-xs text-right mt-1">{note.length}/200</p>
            </div>

            {/* Reflection section — collapsed by default */}
            <div>
              <button type="button" onClick={() => setShowReflection(!showReflection)} className="flex items-center gap-1.5 text-left">
                <span className="text-zinc-500 text-xs font-medium">余韻も一緒に残す</span>
                {showReflection ? <ChevronUp className="h-3.5 w-3.5 text-zinc-600" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-600" />}
              </button>

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
                </div>
              )}
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !resolvedActivity}
              className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
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
