"use client";

import { useState, useTransition } from "react";
import { updateActivity } from "@/server/actions/activity";

interface Activity {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
}

interface Props {
  activity: Activity;
  onClose: () => void;
}

const inputClass =
  "w-full bg-white/5 border border-white/8 rounded-xl px-3.5 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#7C4DFF]/60 transition-colors";
const labelClass = "block text-zinc-500 text-xs mb-2 uppercase tracking-wide";

export function ActivityEditModal({ activity, onClose }: Props) {
  const [name, setName] = useState(activity.name);
  const [emoji, setEmoji] = useState(activity.emoji ?? "");
  const [color, setColor] = useState(activity.color ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateActivity({
        activityId: activity.id,
        name,
        emoji: emoji || undefined,
        color: color || undefined,
      });
      if (result.ok) {
        onClose();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-[2px] flex items-end sm:items-center justify-center z-50">
      <div className="bg-[#1C1C1C] rounded-t-3xl sm:rounded-2xl w-full max-w-md border border-white/8 shadow-2xl">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        <div className="px-6 pt-4 pb-8 sm:pb-6 sm:pt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold text-base">活動を編集</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors text-sm"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>名前 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 筋トレ"
                maxLength={20}
                className={inputClass}
                required
                autoFocus
              />
            </div>
            <div>
              <label className={labelClass}>絵文字</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="🏋️"
                maxLength={10}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>カラー</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#7C4DFF"
                maxLength={20}
                className={inputClass}
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#7C4DFF] text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-[#8D5FFF] disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isPending ? "保存中..." : "保存する"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
