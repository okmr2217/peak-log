"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

type Activity = { id: string; name: string; emoji: string | null; color: string | null };

type Props = {
  activities: Activity[];
  selectedActivityId: string | null;
  noteKeyword: string;
  onLoadingStart: () => void;
  onOpenChange: (open: boolean) => void;
  onActivityChange: (activityId: string | null) => void;
};

export function HomeHeader({ activities, selectedActivityId, noteKeyword, onLoadingStart, onOpenChange, onActivityChange }: Props) {
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

  const updateUrl = (actId: string | null, note: string) => {
    setIsPending(true);
    onLoadingStart();
    const params = new URLSearchParams();
    if (actId) params.set("activityId", actId);
    if (note) params.set("note", note);
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
    router.push("/");
  };

  return (
    <div className={open ? "sticky top-0 z-10 bg-[#0A0A0A] border-b border-white/8" : ""}>
      <div className="px-4 max-w-lg mx-auto">
        <PageHeader
          title="ピーク"
          description="記録したピーク体験が、時系列で並びます"
          action={
            <button
              type="button"
              onClick={() => { const next = !open; setOpen(next); onOpenChange(next); }}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border transition-colors ${
                open || hasFilters
                  ? "bg-[#7C4DFF]/20 text-[#7C4DFF] border-[#7C4DFF]/30"
                  : "bg-white/5 text-zinc-400 border-white/8 hover:bg-white/8"
              }`}
            >
              {isPending ? (
                <span className="w-3.5 h-3.5 rounded-full border border-[#7C4DFF]/40 border-t-[#7C4DFF] animate-spin" />
              ) : (
                <SlidersHorizontal className="w-3.5 h-3.5" />
              )}
              <span>絞り込み</span>
              {hasFilters && !isPending && <span className="w-1.5 h-1.5 rounded-full bg-[#7C4DFF]" />}
            </button>
          }
        />

        {open && (
          <div className="pb-3 space-y-3">
            <div>
              <p className="text-xs text-zinc-500 mb-1.5">活動</p>
              <div className="flex flex-wrap gap-1.5">
                {activities.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleActivityClick(a.id)}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                      localActivityId === a.id
                        ? "border-[#7C4DFF]/50 bg-[#7C4DFF]/20 text-white"
                        : "border-white/10 bg-white/[0.04] text-zinc-400 hover:bg-white/8"
                    }`}
                  >
                    {a.emoji && <span>{a.emoji}</span>}
                    <span>{a.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-zinc-500 mb-1.5">メモ</p>
              <input
                type="text"
                value={noteLocal}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder="メモの内容で絞り込み..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#7C4DFF]/50"
              />
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/8 transition-colors"
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
