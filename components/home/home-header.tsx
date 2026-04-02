"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

type Activity = { id: string; name: string; emoji: string | null; color: string | null };

type Tab = "detail" | "compact";

type Props = {
  activities: Activity[];
  selectedActivityId: string | null;
  noteKeyword: string;
  currentTab: Tab;
  onLoadingStart: () => void;
  onOpenChange: (open: boolean) => void;
  onActivityChange: (activityId: string | null) => void;
};

export function HomeHeader({
  activities,
  selectedActivityId,
  noteKeyword,
  currentTab,
  onLoadingStart,
  onOpenChange,
  onActivityChange,
}: Props) {
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

  const handleTabChange = (tab: Tab) => {
    const params = buildParams(localActivityId, noteLocal, tab);
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
    <div className={open ? "sticky top-0 z-10 bg-background border-b border-border" : ""}>
      <div className="px-4 pt-4 max-w-lg mx-auto">
        <PageHeader
          title="記録"
          description="ピーク体験を時系列で振り返れます"
          action={
            <button
              type="button"
              onClick={() => {
                const next = !open;
                setOpen(next);
                onOpenChange(next);
              }}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border transition-colors ${
                open || hasFilters
                  ? "bg-primary/20 text-primary border-primary/30"
                  : "bg-muted text-muted-foreground border-border hover:bg-secondary"
              }`}
            >
              {isPending ? (
                <span className="w-3.5 h-3.5 rounded-full border border-primary/40 border-t-primary animate-spin" />
              ) : (
                <SlidersHorizontal className="w-3.5 h-3.5" />
              )}
              <span>絞り込み</span>
              {hasFilters && !isPending && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          }
        />

        <div className="flex gap-1 p-0.5 bg-muted rounded-lg border border-border mb-4 mt-0.5">
          {(["detail", "compact"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTabChange(t)}
              className={`flex-1 text-xs py-1.5 rounded-md transition-all font-medium ${
                currentTab === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "detail" ? "詳細" : "コンパクト"}
            </button>
          ))}
        </div>

        {open && (
          <div className="pb-3 space-y-3">
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
        )}
      </div>
    </div>
  );
}
