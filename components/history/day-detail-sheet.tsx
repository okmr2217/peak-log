"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { LogItem } from "@/server/queries/log";
import { LogCard } from "@/components/log/log-card";
import { formatDayFull } from "@/lib/date-utils";

type ReflectionPayload = {
  id: string;
  excitement: number | null;
  achievement: number | null;
  wantAgain: boolean | null;
  note: string | null;
};

type Props = {
  date: string; // YYYY-MM-DD
  logs: LogItem[];
  onClose: () => void;
  onReflectionSaved: (logId: string, reflection: ReflectionPayload) => void;
  onPerformedAtSaved: (logId: string, newDate: Date) => void;
};

export function DayDetailSheet({ date, logs, onClose, onReflectionSaved, onPerformedAtSaved }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-[#111111] rounded-t-2xl max-h-[82vh] flex flex-col shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-2 pb-3 shrink-0 border-b border-white/[0.06]">
          <div>
            <h2 className="text-white font-semibold">{formatDayFull(date)}</h2>
            {logs.length > 0 && <p className="text-xs text-zinc-600 mt-0.5">この日のピーク {logs.length}件</p>}
          </div>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1 -mr-1 mt-0.5">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-4 py-4 space-y-2 pb-10">
          {logs.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-zinc-500 text-sm">この日の記録はありません</p>
            </div>
          ) : (
            logs.map((log) => (
              <LogCard
                key={log.id}
                log={log}
                timeOnly
                showDelete
                showEditDate
                onReflectionSaved={(logId, r) => onReflectionSaved(logId, r)}
                onPerformedAtSaved={(logId, d) => onPerformedAtSaved(logId, d)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
