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
  const [hovered, setHovered] = useState(false);

  async function handleClick() {
    if (pending || disabled) return;
    setPending(true);
    try {
      await onQuickLog(activity.id);
    } finally {
      setPending(false);
    }
  }

  const glowShadow = activity.color
    ? `0 0 ${hovered ? "28px" : "14px"} -4px ${activity.color}${hovered ? "70" : "35"}`
    : undefined;

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={pending || disabled}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded-2xl p-4 min-h-[96px] w-full",
        "bg-[#1A1A1A] border text-white",
        "transition-all duration-200 active:scale-[0.96]",
        "hover:bg-[#242424]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      )}
      style={{
        borderColor: activity.color ? `${activity.color}35` : "rgba(255,255,255,0.06)",
        boxShadow: glowShadow,
      }}
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
