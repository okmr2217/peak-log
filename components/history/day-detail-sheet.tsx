"use client";

import { X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { LogItem } from "@/server/queries/log";
import { LogCard } from "@/components/log/log-card";
import { formatDayFull } from "@/lib/date-utils";
import { Dialog, BottomSheetContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <BottomSheetContent className="flex flex-col max-h-[82vh] sm:max-h-[80vh]">
        <VisuallyHidden>
          <DialogTitle>{formatDayFull(date)}</DialogTitle>
          <DialogDescription>この日のピーク記録一覧</DialogDescription>
        </VisuallyHidden>

        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-3 pb-3 shrink-0 border-b border-white/[0.06]">
          <div>
            <h2 className="text-white font-semibold">{formatDayFull(date)}</h2>
            {logs.length > 0 && (
              <p className="text-xs mt-0.5" style={{ color: "rgba(124,77,255,0.7)" }}>
                この日のピーク {logs.length}件
              </p>
            )}
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
            logs.map((log, index) => (
              <div
                key={log.id}
                className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 fill-mode-both"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <LogCard
                  log={log}
                  timeOnly
                  showDelete
                  showEditDate
                  onReflectionSaved={(logId, r) => onReflectionSaved(logId, r)}
                  onPerformedAtSaved={(logId, d) => onPerformedAtSaved(logId, d)}
                />
              </div>
            ))
          )}
        </div>
      </BottomSheetContent>
    </Dialog>
  );
}
