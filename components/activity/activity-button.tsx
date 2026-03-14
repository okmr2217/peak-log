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

  const color = activity.color;
  const glowShadow = color
    ? `0 4px ${hovered ? "20px" : "12px"} -4px ${color}${hovered ? "45" : "28"}`
    : `0 2px 8px -4px rgba(0,0,0,0.4)`;
  const boxShadow = `${glowShadow}, inset 0 1px 0 rgba(255,255,255,0.09)`;

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={pending || disabled}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2.5 rounded-2xl p-4 min-h-[100px] w-full",
        "border text-white",
        "transition-all duration-200 active:scale-[0.96]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      )}
      style={{
        background: color
          ? hovered
            ? `radial-gradient(ellipse at 50% 10%, ${color}28 0%, ${color}10 55%), #1E1E1E`
            : `radial-gradient(ellipse at 50% 10%, ${color}1E 0%, ${color}0A 55%), #1A1A1A`
          : hovered
            ? "#222222"
            : "#1A1A1A",
        borderColor: color ? `${color}48` : "rgba(255,255,255,0.08)",
        boxShadow,
      }}
    >
      {activity.emoji && <span className="text-[28px] leading-none">{activity.emoji}</span>}
      <span className="text-[11px] font-medium text-center leading-tight text-zinc-300 tracking-wide">{activity.name}</span>
      {pending && (
        <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </span>
      )}
    </button>
  );
}
