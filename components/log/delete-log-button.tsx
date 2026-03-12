"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteLog } from "@/server/actions/log";

type DeleteLogButtonProps = {
  logId: string;
};

export function DeleteLogButton({ logId }: DeleteLogButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm("この記録を削除しますか？")) return;
    startTransition(async () => {
      await deleteLog(logId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
      aria-label="削除"
    >
      <Trash2 size={14} />
    </button>
  );
}
