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
  const glowIntensity = hovered ? "40" : "22";
  const glowSize = hovered ? "28px" : "16px";
  const glowShadow = color ? `0 0 ${glowSize} -4px ${color}${glowIntensity}` : undefined;
  const insetHighlight = "inset 0 1px 0 rgba(255,255,255,0.08)";
  const boxShadow = [glowShadow, insetHighlight].filter(Boolean).join(", ");

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={pending || disabled}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded-2xl p-4 min-h-[96px] w-full",
        "border text-white",
        "transition-all duration-200 active:scale-[0.96]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      )}
      style={{
        background: color
          ? hovered
            ? `radial-gradient(ellipse at 50% 0%, ${color}18 0%, ${color}0C 60%), #1E1E1E`
            : `radial-gradient(ellipse at 50% 0%, ${color}12 0%, ${color}07 60%), #1A1A1A`
          : hovered
            ? "#222222"
            : "#1A1A1A",
        borderColor: color ? `${color}35` : "rgba(255,255,255,0.07)",
        boxShadow,
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
