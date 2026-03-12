"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { createActivity } from "@/server/actions/activity";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function ActivityCreateModal({ onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [color, setColor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createActivity({
        name,
        emoji: emoji || undefined,
        color: color || undefined,
      });
      if (result.ok) {
        onSuccess();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold">活動を追加</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">名前 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 筋トレ"
              maxLength={20}
              className="w-full bg-[#0A0A0A] border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#7C4DFF]"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">絵文字</label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="🏋️"
              maxLength={10}
              className="w-full bg-[#0A0A0A] border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#7C4DFF]"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">カラー</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#7C4DFF"
              maxLength={20}
              className="w-full bg-[#0A0A0A] border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#7C4DFF]"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#7C4DFF] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#6B3FE0] disabled:opacity-50 transition-colors"
          >
            {isPending ? "追加中..." : "追加する"}
          </button>
        </form>
      </div>
    </div>
  );
}
