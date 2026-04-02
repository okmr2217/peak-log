"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { deleteLog } from "@/server/actions/log";
import { EditLogModal } from "./edit-log-modal";
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
import { formatTime, formatRelativeTime } from "@/lib/date-utils";

type Props = {
  logId: string;
  performedAt: Date;
  timeOnly?: boolean;
  stars?: number | null;
  note?: string | null;
  onLogEdited?: (data: { newDate: Date; stars: number | null; note: string | null }) => void;
};

export function LogCardMenu({ logId, performedAt, timeOnly, stars, note, onLogEdited }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(performedAt);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  const timeLabel = timeOnly ? formatTime(currentDate) : formatRelativeTime(currentDate);

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

  function handleLogEdited(data: { newDate: Date; stars: number | null; note: string | null }) {
    setCurrentDate(data.newDate);
    onLogEdited?.(data);
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteLog(logId);
    });
  }

  return (
    <div className="relative flex items-center gap-1" ref={menuRef}>
      {!timeOnly && <span className="text-muted-foreground text-xs shrink-0 tabular-nums">{timeLabel}</span>}
      <button
        type="button"
        onClick={() => setIsMenuOpen((v) => !v)}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="操作メニュー"
      >
        <MoreVertical size={16} />
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl z-50 min-w-[148px] overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              setIsEditOpen(true);
            }}
            className="flex items-center gap-2 w-full px-3.5 py-2.5 text-xs text-foreground hover:bg-muted transition-colors text-left"
          >
            <Pencil size={12} className="text-muted-foreground shrink-0" />
            記録を編集
          </button>
          <div className="border-t border-border mx-2" />
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

      <EditLogModal
        logId={logId}
        performedAt={currentDate}
        initialStars={stars}
        initialNote={note}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSaved={handleLogEdited}
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
