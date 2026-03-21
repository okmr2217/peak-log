"use client";

import { useState } from "react";
import { LogCardMenu } from "./log-card-menu";
import { ReflectionModal } from "@/components/reflection/reflection-modal";

type ReflectionValues = {
  id: string;
  excitement: number | null;
  achievement: number | null;
  wantAgain: boolean | null;
  note: string | null;
};

type LogCardProps = {
  log: {
    id: string;
    performedAt: Date;
    activity: {
      id: string;
      name: string;
      emoji: string | null;
      color: string | null;
    };
    reflection: ReflectionValues | null;
  };
  usage: "home" | "history";
  onPerformedAtSaved?: (logId: string, newDate: Date) => void;
  onReflectionSaved?: (logId: string, reflection: ReflectionValues) => void;
};

function RatingDots({ value, activeColor }: { value: number; activeColor: string }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="inline-block w-1.5 h-1.5 rounded-full transition-all duration-200"
          style={
            i < value
              ? { background: activeColor, boxShadow: `0 0 4px 0 ${activeColor}` }
              : { background: "rgba(255,255,255,0.08)" }
          }
        />
      ))}
    </div>
  );
}

export function LogCard({ log, usage, onPerformedAtSaved, onReflectionSaved }: LogCardProps) {
  const { activity, performedAt } = log;
  const timeOnly = usage === "history";
  const [reflection, setReflection] = useState<ReflectionValues | null>(log.reflection);
  const [reflectionOpen, setReflectionOpen] = useState(false);

  const color = activity.color;
  const cardStyle = {
    background: color
      ? `radial-gradient(ellipse at 0% 0%, ${color}1A 0%, transparent 60%), #1A1A1A`
      : "#1A1A1A",
    borderColor: color ? `${color}38` : "rgba(255,255,255,0.08)",
    boxShadow: color
      ? `0 4px 20px -8px ${color}38`
      : `0 2px 10px -4px rgba(0,0,0,0.4)`,
  };

  function handleReflectionSaved(r: ReflectionValues) {
    setReflection(r);
    onReflectionSaved?.(log.id, r);
  }

  return (
    <div
      className="rounded-2xl border transition-all animate-in fade-in-0 duration-300"
      style={cardStyle}
    >
      {/* Header row */}
      <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-2.5">
        {activity.emoji && (
          <span
            className="text-sm leading-none flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: color ? `${color}28` : "rgba(255,255,255,0.07)" }}
          >
            {activity.emoji}
          </span>
        )}
        <span className="text-white font-medium text-sm tracking-tight flex-1 min-w-0 truncate">
          {activity.name}
        </span>
        <LogCardMenu
          logId={log.id}
          performedAt={performedAt}
          timeOnly={timeOnly}
          hasReflection={!!reflection}
          onAddReflection={() => setReflectionOpen(true)}
          onPerformedAtSaved={onPerformedAtSaved ? (d) => onPerformedAtSaved(log.id, d) : undefined}
        />
      </div>

      {/* Reflection area - only shown when reflection exists */}
      {reflection && (
        <div
          className="pb-4 border-t"
          style={{
            paddingLeft: "14px",
            paddingRight: "14px",
            borderColor: color ? `${color}22` : "rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.18)",
          }}
        >
          <div className="pt-3 space-y-2.5">
            {(reflection.excitement != null || reflection.achievement != null || reflection.wantAgain != null) && (
              <div className="flex items-center gap-3 flex-wrap">
                {reflection.excitement != null && (
                  <div className="flex items-center gap-1.5">
                    <RatingDots value={reflection.excitement} activeColor="#7C4DFF" />
                    <span className="text-zinc-600 text-[11px]">興奮</span>
                  </div>
                )}
                {reflection.achievement != null && (
                  <div className="flex items-center gap-1.5">
                    <RatingDots value={reflection.achievement} activeColor="#00E5FF" />
                    <span className="text-zinc-600 text-[11px]">達成感</span>
                  </div>
                )}
                {reflection.wantAgain != null && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={
                      reflection.wantAgain
                        ? {
                            background: "rgba(124,77,255,0.18)",
                            color: "rgba(167,139,250,0.9)",
                            boxShadow: "0 0 8px -2px rgba(124,77,255,0.35)",
                          }
                        : { background: "rgba(255,255,255,0.05)", color: "rgb(82,82,91)" }
                    }
                  >
                    {reflection.wantAgain ? "またやりたい" : "今回は十分"}
                  </span>
                )}
              </div>
            )}
            {reflection.note && (
              <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 whitespace-pre-wrap">{reflection.note}</p>
            )}
          </div>
        </div>
      )}

      <ReflectionModal
        logId={log.id}
        initialValues={reflection ?? undefined}
        isOpen={reflectionOpen}
        onClose={() => setReflectionOpen(false)}
        onSaved={handleReflectionSaved}
      />
    </div>
  );
}
