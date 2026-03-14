"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Activity = {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
};

type ActivityButtonProps = {
  activity: Activity;
  onQuickLog: (activityId: string) => Promise<void>;
  disabled?: boolean;
};

export function ActivityButton({ activity, onQuickLog, disabled }: ActivityButtonProps) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending || disabled) return;
    setPending(true);
    try {
      await onQuickLog(activity.id);
    } finally {
      setPending(false);
    }
  }

  const color = activity.color;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending || disabled}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded-2xl p-4 min-h-[96px] w-full",
        "border text-white",
        "transition-transform duration-150 active:scale-[0.94]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      )}
      style={{
        background: color ? `${color}16` : "rgba(255,255,255,0.04)",
        borderColor: color ? `${color}50` : "rgba(255,255,255,0.09)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {activity.emoji && <span className="text-[26px] leading-none">{activity.emoji}</span>}
      <span className="text-[11px] font-medium text-center leading-tight text-zinc-300">{activity.name}</span>
      {pending && (
        <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </span>
      )}
    </button>
  );
}
