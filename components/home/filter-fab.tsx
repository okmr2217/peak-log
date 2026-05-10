"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, parse } from "date-fns";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
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
import { DAY_PICKER_CLASS_NAMES } from "@/lib/date-picker-utils";

type Activity = { id: string; name: string; emoji: string | null; color: string | null };
type Tab = "card" | "list";

type Props = {
  activities: Activity[];
  selectedActivityId: string | null;
  noteKeyword: string;
  fromDate: string;
  toDate: string;
  defaultFromDate: string;
  defaultToDate: string;
  currentTab: Tab;
  onLoadingStart: () => void;
  onActivityChange: (activityId: string | null) => void;
};

export function FilterFab({
  activities,
  selectedActivityId,
  noteKeyword,
  fromDate,
  toDate,
  defaultFromDate,
  defaultToDate,
  currentTab,
  onLoadingStart,
  onActivityChange,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [localActivityId, setLocalActivityId] = useState(selectedActivityId);
  const [noteLocal, setNoteLocal] = useState(noteKeyword);
  const [localFromDate, setLocalFromDate] = useState<Date>(() => parse(fromDate, "yyyy-MM-dd", new Date()));
  const [localToDate, setLocalToDate] = useState<Date>(() => parse(toDate, "yyyy-MM-dd", new Date()));
  const [activeDateField, setActiveDateField] = useState<"from" | "to" | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsPending(false);
    setLocalActivityId(selectedActivityId);
  }, [selectedActivityId]);

  useEffect(() => {
    setIsPending(false);
    setNoteLocal(noteKeyword);
  }, [noteKeyword]);

  useEffect(() => {
    setLocalFromDate(parse(fromDate, "yyyy-MM-dd", new Date()));
  }, [fromDate]);

  useEffect(() => {
    setLocalToDate(parse(toDate, "yyyy-MM-dd", new Date()));
  }, [toDate]);

  const fromStr = format(localFromDate, "yyyy-MM-dd");
  const toStr = format(localToDate, "yyyy-MM-dd");
  const hasFilters = !!(localActivityId || noteLocal || fromStr !== defaultFromDate || toStr !== defaultToDate);

  const buildParams = (actId: string | null, note: string, tab: Tab, from: string, to: string) => {
    const params = new URLSearchParams();
    if (actId) params.set("activityId", actId);
    if (note) params.set("note", note);
    if (tab !== "card") params.set("tab", tab);
    params.set("from", from);
    params.set("to", to);
    return params;
  };

  const updateUrl = (actId: string | null, note: string, from: string, to: string) => {
    setIsPending(true);
    onLoadingStart();
    const params = buildParams(actId, note, currentTab, from, to);
    router.push(`/?${params.toString()}`);
  };

  const handleActivityClick = (actId: string) => {
    const next = localActivityId === actId ? null : actId;
    setLocalActivityId(next);
    onActivityChange(next);
    updateUrl(next, noteLocal, fromStr, toStr);
  };

  const handleNoteChange = (value: string) => {
    setNoteLocal(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateUrl(localActivityId, value, fromStr, toStr);
    }, 300);
  };

  const handleFromDateSelect = (d: Date | undefined) => {
    if (!d) return;
    setLocalFromDate(d);
    setActiveDateField(null);
    updateUrl(localActivityId, noteLocal, format(d, "yyyy-MM-dd"), toStr);
  };

  const handleToDateSelect = (d: Date | undefined) => {
    if (!d) return;
    setLocalToDate(d);
    setActiveDateField(null);
    updateUrl(localActivityId, noteLocal, fromStr, format(d, "yyyy-MM-dd"));
  };

  const handleClear = () => {
    setLocalActivityId(null);
    onActivityChange(null);
    setNoteLocal("");
    setLocalFromDate(parse(defaultFromDate, "yyyy-MM-dd", new Date()));
    setLocalToDate(parse(defaultToDate, "yyyy-MM-dd", new Date()));
    setActiveDateField(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    router.push("/");
  };

  return (
    <>
      <div className="fixed bottom-36 right-4 z-40">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-12 h-12 rounded-full flex items-center justify-center relative bg-card border border-border shadow-lg transition-transform duration-150 active:scale-90 hover:bg-secondary"
          aria-label="絞り込み"
        >
          {isPending ? (
            <span className="w-4 h-4 rounded-full border border-foreground/30 border-t-foreground animate-spin" />
          ) : (
            <SlidersHorizontal className={`w-4 h-4 ${hasFilters ? "text-primary" : "text-foreground"}`} />
          )}
          {hasFilters && !isPending && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />}
        </button>
      </div>

      <ResponsiveDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setActiveDateField(null); }}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>絞り込み</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>活動・期間・メモで記録を絞り込みます。</ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <ResponsiveDialogBody className="space-y-4 overflow-y-auto pb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">活動</p>
                <div className="flex flex-wrap gap-1.5">
                  {activities.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => handleActivityClick(a.id)}
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                        localActivityId === a.id
                          ? "border-primary/50 bg-primary/20 text-foreground"
                          : "border-border bg-muted text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {a.emoji && <span>{a.emoji}</span>}
                      <span>{a.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1.5">期間</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveDateField(activeDateField === "from" ? null : "from")}
                    className={`flex-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                      activeDateField === "from"
                        ? "border-primary/50 bg-primary/20 text-foreground"
                        : "border-border bg-muted text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {format(localFromDate, "yyyy/MM/dd")}
                  </button>
                  <span className="text-xs text-muted-foreground">〜</span>
                  <button
                    type="button"
                    onClick={() => setActiveDateField(activeDateField === "to" ? null : "to")}
                    className={`flex-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                      activeDateField === "to"
                        ? "border-primary/50 bg-primary/20 text-foreground"
                        : "border-border bg-muted text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {format(localToDate, "yyyy/MM/dd")}
                  </button>
                </div>
                {activeDateField && (
                  <div className="mt-2 bg-muted/50 rounded-2xl p-3 border border-border">
                    <DayPicker
                      mode="single"
                      selected={activeDateField === "from" ? localFromDate : localToDate}
                      onSelect={activeDateField === "from" ? handleFromDateSelect : handleToDateSelect}
                      disabled={
                        activeDateField === "from"
                          ? { after: localToDate }
                          : { before: localFromDate }
                      }
                      defaultMonth={activeDateField === "from" ? localFromDate : localToDate}
                      classNames={DAY_PICKER_CLASS_NAMES}
                      components={{
                        Chevron: ({ orientation }) =>
                          orientation === "left" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1.5">メモ</p>
                <input
                  type="text"
                  value={noteLocal}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  placeholder="メモの内容で絞り込み..."
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

          </ResponsiveDialogBody>

          {hasFilters && (
            <ResponsiveDialogFooter>
              <Button type="button" variant="outline" onClick={handleClear}>
                <X className="w-3 h-3" />
                絞り込みをクリア
              </Button>
            </ResponsiveDialogFooter>
          )}
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}
