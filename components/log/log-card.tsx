import { Sparkles } from "lucide-react";
import { AddReflectionButton } from "./add-reflection-button";
import { DeleteLogButton } from "./delete-log-button";
import { EditPerformedAtButton } from "./edit-performed-at-button";
import { LogCardMenu } from "./log-card-menu";
import { formatTime, formatPerformedAt } from "@/lib/date-utils";

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
    reflection: {
      id: string;
      excitement: number | null;
      achievement: number | null;
      wantAgain: boolean | null;
      note: string | null;
    } | null;
  };
  timeOnly?: boolean;
  showDelete?: boolean;
  showEditDate?: boolean;
  showMenu?: boolean;
  onPerformedAtSaved?: (logId: string, newDate: Date) => void;
  onReflectionSaved?: (logId: string, reflection: { id: string; excitement: number | null; achievement: number | null; wantAgain: boolean | null; note: string | null }) => void;
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

export function LogCard({
  log,
  timeOnly = false,
  showDelete = false,
  showEditDate = false,
  showMenu = false,
  onPerformedAtSaved,
  onReflectionSaved,
}: LogCardProps) {
  const { activity, reflection, performedAt } = log;
  const timeLabel = timeOnly ? formatTime(performedAt) : formatPerformedAt(performedAt);
  const hasReflection = !!reflection;

  return (
    <div className="bg-[#1A1A1A] rounded-xl border border-white/[0.06] transition-all animate-in fade-in-0 duration-300">
      {/* Header row */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3.5">
        {activity.emoji && (
          <span className="text-[17px] leading-none flex-shrink-0">{activity.emoji}</span>
        )}
        <span className="text-white font-semibold text-[15px] tracking-tight flex-1 min-w-0 truncate">
          {activity.name}
        </span>
        {hasReflection && (
          <Sparkles
            size={12}
            className="flex-shrink-0"
            style={{
              color: "#00E5FF",
              filter: "drop-shadow(0 0 5px rgba(0,229,255,0.7))",
            }}
            aria-label="余韻あり"
          />
        )}
        {showMenu ? (
          <LogCardMenu
            logId={log.id}
            performedAt={performedAt}
            timeOnly={timeOnly}
            reflection={reflection}
            onPerformedAtSaved={onPerformedAtSaved ? (d) => onPerformedAtSaved(log.id, d) : undefined}
            onReflectionSaved={onReflectionSaved ? (r) => onReflectionSaved(log.id, r) : undefined}
          />
        ) : showEditDate ? (
          <EditPerformedAtButton
            logId={log.id}
            performedAt={performedAt}
            timeOnly={timeOnly}
            onSaved={onPerformedAtSaved ? (d) => onPerformedAtSaved(log.id, d) : undefined}
          />
        ) : (
          <span className="text-zinc-600 text-xs shrink-0 tabular-nums">{timeLabel}</span>
        )}
        {!showMenu && showDelete && <DeleteLogButton logId={log.id} />}
      </div>

      {/* Reflection area */}
      <div className="px-4 pb-4 border-t border-white/5">
        {reflection ? (
          <div className="pt-3 space-y-2.5">
            {/* Ratings row */}
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
              <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">{reflection.note}</p>
            )}
            <AddReflectionButton logId={log.id} initialValues={reflection} onSaved={onReflectionSaved ? (r) => onReflectionSaved(log.id, r) : undefined} />
          </div>
        ) : (
          <div className="pt-3">
            <AddReflectionButton logId={log.id} onSaved={onReflectionSaved ? (r) => onReflectionSaved(log.id, r) : undefined} />
          </div>
        )}
      </div>
    </div>
  );
}
