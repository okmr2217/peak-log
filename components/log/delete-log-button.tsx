"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteLog } from "@/server/actions/log";

type Props = {
  logId: string;
};

export function DeleteLogButton({ logId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteLog(logId);
      if (result.ok) {
        setIsOpen(false);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        aria-label="削除"
      >
        <Trash2 size={14} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            onClick={() => !isPending && setIsOpen(false)}
          />

          {/* Dialog */}
          <div className="relative bg-[#1C1C1C] w-full max-w-sm rounded-t-3xl sm:rounded-2xl border border-white/8 shadow-2xl">
            {/* Drag handle (mobile only) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-white/15" />
            </div>

            <div className="px-6 pt-5 pb-8 sm:py-6">
              <h2 className="text-white font-semibold text-base mb-2">この記録を削除しますか？</h2>
              <p className="text-zinc-500 text-sm mb-6">削除した記録は元に戻せません。</p>

              {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="flex-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-zinc-300 text-sm font-medium rounded-xl py-3.5 transition-all active:scale-[0.98]"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 text-red-400 text-sm font-semibold rounded-xl py-3.5 transition-all active:scale-[0.98]"
                >
                  {isPending ? "削除中..." : "削除する"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
