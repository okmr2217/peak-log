"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Dialog, BottomSheetContent, DialogTitle } from "@/components/ui/dialog";

type Activity = { id: string; name: string; emoji: string | null; color: string | null };
type Tab = "detail" | "compact";

type Props = {
  activities: Activity[];
  selectedActivityId: string | null;
  noteKeyword: string;
  currentTab: Tab;
  onLoadingStart: () => void;
  onActivityChange: (activityId: string | null) => void;
};

export function FilterFab({ activities, selectedActivityId, noteKeyword, currentTab, onLoadingStart, onActivityChange }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [localActivityId, setLocalActivityId] = useState(selectedActivityId);
  const [noteLocal, setNoteLocal] = useState(noteKeyword);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsPending(false);
    setLocalActivityId(selectedActivityId);
  }, [selectedActivityId]);

  useEffect(() => {
    setIsPending(false);
    setNoteLocal(noteKeyword);
  }, [noteKeyword]);

  const hasFilters = !!(localActivityId || noteLocal);

  const buildParams = (actId: string | null, note: string, tab: Tab) => {
    const params = new URLSearchParams();
    if (actId) params.set("activityId", actId);
    if (note) params.set("note", note);
    if (tab !== "detail") params.set("tab", tab);
    return params;
  };

  const updateUrl = (actId: string | null, note: string) => {
    setIsPending(true);
    onLoadingStart();
    const params = buildParams(actId, note, currentTab);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  };

  const handleActivityClick = (actId: string) => {
    const next = localActivityId === actId ? null : actId;
    setLocalActivityId(next);
    onActivityChange(next);
    updateUrl(next, noteLocal);
  };

  const handleNoteChange = (value: string) => {
    setNoteLocal(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateUrl(selectedActivityId, value);
    }, 300);
  };

  const handleClear = () => {
    setLocalActivityId(null);
    onActivityChange(null);
    setNoteLocal("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const params = buildParams(null, "", currentTab);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
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

      <Dialog open={open} onOpenChange={setOpen}>
        <BottomSheetContent>
          <div className="px-4 pb-6 pt-2">
            <div className="flex items-center justify-between mb-4">
              <DialogTitle className="text-base font-semibold">絞り込み</DialogTitle>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
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
                <p className="text-xs text-muted-foreground mb-1.5">メモ</p>
                <input
                  type="text"
                  value={noteLocal}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  placeholder="メモの内容で絞り込み..."
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-border bg-muted text-foreground hover:bg-secondary transition-colors"
                >
                  <X className="w-3 h-3" />
                  絞り込みをクリア
                </button>
              )}
            </div>
          </div>
        </BottomSheetContent>
      </Dialog>
    </>
  );
}
