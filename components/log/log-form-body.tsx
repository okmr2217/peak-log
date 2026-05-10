"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, startOfDay } from "date-fns";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldValueInput } from "@/components/log/field-value-input";
import { StarRating } from "@/components/ui/star-rating";
import { type DateMode, TIME_OPTIONS, DAY_PICKER_CLASS_NAMES } from "@/lib/date-picker-utils";
import type { FieldType } from "@prisma/client";

type ActivityField = {
  id: string;
  name: string;
  type: FieldType;
  options: string[];
};

type ActivityForForm = {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  fields: ActivityField[];
} | null;

type LogFormBodyProps = {
  activity: ActivityForForm;
  fieldValues: Record<string, string | string[]>;
  onFieldValuesChange: React.Dispatch<React.SetStateAction<Record<string, string | string[]>>>;
  dateMode: DateMode;
  onDateModeChange: (mode: DateMode) => void;
  otherDate: Date;
  onOtherDateChange: (date: Date) => void;
  selectedTime: string;
  onSelectedTimeChange: (time: string) => void;
  note: string;
  onNoteChange: (note: string) => void;
  stars: number | undefined;
  onStarsChange: (stars: number | undefined) => void;
  onCtrlEnter: () => void;
  noteInputId: string;
  error: string | null;
};

const DATE_MODE_LABELS: Record<DateMode, string> = { today: "今日", yesterday: "昨日", other: "他の日" };

export function LogFormBody({
  activity,
  fieldValues,
  onFieldValuesChange,
  dateMode,
  onDateModeChange,
  otherDate,
  onOtherDateChange,
  selectedTime,
  onSelectedTimeChange,
  note,
  onNoteChange,
  stars,
  onStarsChange,
  onCtrlEnter,
  noteInputId,
  error,
}: LogFormBodyProps) {
  const today = startOfDay(new Date());
  const otherDateLabel = format(otherDate, "M月d日");

  return (
    <>
      {/* Custom fields */}
      {activity && activity.fields.length > 0 && (
        <div
          className="rounded-2xl p-3 space-y-3"
          style={{
            background: `${activity.color ?? "#7C4DFF"}0A`,
            border: `1px solid ${activity.color ?? "#7C4DFF"}25`,
          }}
        >
          <div className="flex items-center gap-1.5">
            {activity.emoji && <span className="text-xs">{activity.emoji}</span>}
            <Label
              className="text-xs uppercase tracking-wide font-medium"
              style={{ color: `${activity.color ?? "#7C4DFF"}DD` }}
            >
              {activity.name}の記録
            </Label>
          </div>

          {activity.fields.map((field) => (
            <div key={field.id}>
              <Label className="text-muted-foreground text-xs mb-1.5 block">
                {field.name}
                {field.type === "MULTI_SELECT" && (
                  <span className="ml-1.5 text-[10px] text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded">複数選択</span>
                )}
              </Label>
              <FieldValueInput
                field={field}
                value={fieldValues[field.id]}
                onChange={(v) =>
                  onFieldValuesChange((prev) => {
                    const next = { ...prev };
                    if (v === undefined) {
                      delete next[field.id];
                    } else {
                      next[field.id] = v;
                    }
                    return next;
                  })
                }
                activityColor={activity.color}
              />
            </div>
          ))}
        </div>
      )}

      {/* Date */}
      <div>
        <Label className="text-muted-foreground text-xs mb-1 block tracking-wide uppercase">日付</Label>
        <div className="flex gap-2">
          {(["today", "yesterday", "other"] as DateMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onDateModeChange(mode)}
              className={`px-3.5 py-1 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 flex-1 ${
                dateMode === mode ? "text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"
              }`}
              style={
                dateMode === mode
                  ? { background: "linear-gradient(135deg, #7C4DFF, #5533cc)", boxShadow: "0 0 14px 0 rgba(124,77,255,0.35)" }
                  : undefined
              }
            >
              {DATE_MODE_LABELS[mode]}
            </button>
          ))}
        </div>
        {dateMode === "other" && (
          <div className="bg-muted/50 rounded-2xl p-3 border border-border mt-2">
            <DayPicker
              mode="single"
              selected={otherDate}
              onSelect={(d) => d && onOtherDateChange(d)}
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
      </div>

      {/* Time */}
      <div>
        <Label className="text-muted-foreground text-xs mb-1 block tracking-wide uppercase">時刻</Label>
        <div className="relative">
          <select
            value={selectedTime}
            onChange={(e) => onSelectedTimeChange(e.target.value)}
            className="w-full appearance-none bg-muted rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer border border-border"
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

      {/* Memo */}
      <div>
        <Label htmlFor={noteInputId} className="text-muted-foreground text-xs mb-1 block tracking-wide uppercase">
          メモ
        </Label>
        <Textarea
          id={noteInputId}
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              e.preventDefault();
              onCtrlEnter();
            }
          }}
          maxLength={200}
          rows={2}
          placeholder="体験の余韻を残しておこう..."
          className="bg-muted border-border rounded-xl px-3 py-2 placeholder:text-muted-foreground/50 resize-none focus-visible:ring-primary/50 leading-relaxed"
        />
      </div>

      {/* Stars */}
      <div>
        <Label className="text-muted-foreground text-xs mb-1 block tracking-wide uppercase">スター数</Label>
        <StarRating value={stars} onChange={onStarsChange} />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}
    </>
  );
}
