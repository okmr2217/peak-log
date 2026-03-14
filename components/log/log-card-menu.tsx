"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { MoreVertical, Clock, Trash2 } from "lucide-react";
import { deleteLog } from "@/server/actions/log";
import { EditPerformedAtModal } from "./edit-performed-at-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatTime, formatPerformedAt } from "@/lib/date-utils";

type Props = {
  logId: string;
  performedAt: Date;
  timeOnly?: boolean;
  onPerformedAtSaved?: (newDate: Date) => void;
};

export function LogCardMenu({ logId, performedAt, timeOnly, onPerformedAtSaved }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditDateOpen, setIsEditDateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(performedAt);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  const timeLabel = timeOnly ? formatTime(currentDate) : formatPerformedAt(currentDate);

  useEffect(() => {
    if (!isMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  function handlePerformedAtSaved(newDate: Date) {
    setCurrentDate(newDate);
    onPerformedAtSaved?.(newDate);
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteLog(logId);
    });
  }

  return (
    <div className="relative flex items-center gap-1" ref={menuRef}>
      <span className="text-zinc-600 text-xs shrink-0 tabular-nums">{timeLabel}</span>
      <button
        type="button"
        onClick={() => setIsMenuOpen((v) => !v)}
        className="p-1 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-colors"
        aria-label="操作メニュー"
      >
        <MoreVertical size={14} />
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 top-full mt-1 bg-[#1F1F1F] border border-white/10 rounded-xl shadow-xl z-50 min-w-[148px] overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              setIsEditDateOpen(true);
            }}
            className="flex items-center gap-2 w-full px-3.5 py-2.5 text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-left"
          >
            <Clock size={12} className="text-zinc-500 shrink-0" />
            時間を変更
          </button>
          <div className="border-t border-white/[0.06] mx-2" />
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              setIsDeleteOpen(true);
            }}
            className="flex items-center gap-2 w-full px-3.5 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors text-left"
          >
            <Trash2 size={12} className="shrink-0" />
            削除
          </button>
        </div>
      )}

      <EditPerformedAtModal
        logId={logId}
        performedAt={currentDate}
        isOpen={isEditDateOpen}
        onClose={() => setIsEditDateOpen(false)}
        onSaved={handlePerformedAtSaved}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>この記録を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>削除した記録は元に戻せません。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20"
            >
              {isPending ? "削除中..." : "削除する"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
