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

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending || disabled}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded-2xl p-4 min-h-[96px] w-full",
        "bg-[#1A1A1A] border text-white",
        "transition-all duration-150 active:scale-[0.96]",
        "hover:bg-[#242424]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        activity.color && `shadow-[0_0_16px_-4px_${activity.color}30]`,
      )}
      style={activity.color ? { borderColor: `${activity.color}35` } : { borderColor: "rgba(255,255,255,0.06)" }}
    >
      {activity.emoji && <span className="text-2xl leading-none">{activity.emoji}</span>}
      <span className="text-xs font-medium text-center leading-tight text-zinc-200">{activity.name}</span>
      {pending && (
        <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </span>
      )}
    </button>
  );
}
