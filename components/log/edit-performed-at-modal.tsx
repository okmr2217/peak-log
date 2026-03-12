"use client";

import { useState, useTransition } from "react";
import { updateLogPerformedAt } from "@/server/actions/log";
import { toDatetimeLocalString } from "@/lib/date-utils";

type Props = {
  logId: string;
  performedAt: Date;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (newDate: Date) => void;
};

export function EditPerformedAtModal({ logId, performedAt, isOpen, onClose, onSaved }: Props) {
  const [value, setValue] = useState(() => toDatetimeLocalString(performedAt));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleSubmit() {
    if (!value) {
      setError("日時を入力してください");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateLogPerformedAt({ logId, performedAt: new Date(value) });
      if (result.ok) {
        onSaved?.(new Date(value));
        onClose();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-[#1C1C1C] w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-white/8 shadow-2xl">
        {/* Drag handle (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        <div className="px-6 pt-4 pb-8 sm:pb-6 sm:pt-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold text-base">日時を編集</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors text-sm"
            >
              ✕
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">実施日時</label>
              <input
                type="datetime-local"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-white/5 rounded-xl px-3.5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#7C4DFF]/50 [color-scheme:dark]"
              />
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="flex-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-zinc-300 text-sm font-medium rounded-xl py-3.5 transition-all active:scale-[0.98]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-1 bg-[#7C4DFF] hover:bg-[#8D5FFF] disabled:opacity-50 text-white text-sm font-semibold rounded-xl py-3.5 transition-all active:scale-[0.98]"
              >
                {isPending ? "保存中..." : "保存する"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
