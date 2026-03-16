"use client";

import { useState, useTransition } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import dayjs from "dayjs";
import { createLog } from "@/server/actions/log";
import { upsertReflection } from "@/server/actions/reflection";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dialog, BottomSheetContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type DateMode = "today" | "yesterday" | "other";

function roundToNearest30(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  if (minutes < 15) {
    return `${String(hours).padStart(2, "0")}:00`;
  } else if (minutes < 45) {
    return `${String(hours).padStart(2, "0")}:30`;
  } else {
    const nextHour = (hours + 1) % 24;
    return `${String(nextHour).padStart(2, "0")}:00`;
  }
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
  const [otherDate, setOtherDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [selectedTime, setSelectedTime] = useState(() => roundToNearest30(new Date()));
  const [showReflection, setShowReflection] = useState(false);
  const [excitement, setExcitement] = useState<number | undefined>();
  const [achievement, setAchievement] = useState<number | undefined>();
  const [wantAgain, setWantAgain] = useState<boolean | undefined>();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function getPerformedAt(): Date {
    let dateStr: string;
    if (dateMode === "today") dateStr = dayjs().format("YYYY-MM-DD");
    else if (dateMode === "yesterday") dateStr = dayjs().subtract(1, "day").format("YYYY-MM-DD");
    else dateStr = otherDate;
    return new Date(`${dateStr}T${selectedTime}:00`);
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

  const maxOtherDate = dayjs().format("YYYY-MM-DD");

  const dateModeLabels: Record<DateMode, string> = {
    today: "今日",
    yesterday: "昨日",
    other: "他の日",
  };

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
            {/* Date selection */}
            <div>
              <Label className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">いつの体験として残しますか？</Label>
              <div className="flex gap-2 mb-3">
                {(["today", "yesterday", "other"] as DateMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setDateMode(mode)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 ${
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
              {dateMode === "other" && (
                <input
                  type="date"
                  value={otherDate}
                  max={maxOtherDate}
                  onChange={(e) => setOtherDate(e.target.value)}
                  className="w-full bg-white/5 rounded-xl px-3.5 py-3 text-white text-sm border-0 [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-[#7C4DFF]/50"
                />
              )}
            </div>

            {/* Time selection */}
            <div>
              <Label className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">時刻</Label>
              <div className="relative">
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full bg-white/5 rounded-xl px-3.5 py-3 text-white text-sm border-0 [color-scheme:dark] appearance-none focus:outline-none focus:ring-2 focus:ring-[#7C4DFF]/50 cursor-pointer"
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
