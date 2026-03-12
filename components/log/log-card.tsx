import { AddReflectionButton } from "./add-reflection-button";
import { DeleteLogButton } from "./delete-log-button";
import { EditPerformedAtButton } from "./edit-performed-at-button";
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
};

function RatingDots({ value, activeClass }: { value: number; activeClass: string }) {
  return (
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`inline-block w-1.5 h-1.5 rounded-full ${i < value ? activeClass : "bg-white/10"}`}
        />
      ))}
    </div>
  );
}

export function LogCard({ log, timeOnly = false, showDelete = false, showEditDate = false }: LogCardProps) {
  const { activity, reflection, performedAt } = log;
  const timeLabel = timeOnly ? formatTime(performedAt) : formatPerformedAt(performedAt);
  const accentColor = activity.color;

  return (
    <div
      className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden"
      style={accentColor ? { borderLeftColor: `${accentColor}50`, borderLeftWidth: "2px" } : undefined}
    >
      {/* Header row */}
      <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-2">
        {activity.emoji && (
          <span className="text-base leading-none flex-shrink-0">{activity.emoji}</span>
        )}
        <span className="text-white font-semibold text-sm flex-1 min-w-0 truncate">{activity.name}</span>
        {showEditDate ? (
          <EditPerformedAtButton logId={log.id} performedAt={performedAt} label={timeLabel} />
        ) : (
          <span className="text-zinc-600 text-xs shrink-0 tabular-nums">{timeLabel}</span>
        )}
        {showDelete && <DeleteLogButton logId={log.id} />}
      </div>

      {/* Reflection area */}
      <div className="px-4 pb-3">
        {reflection ? (
          <div className="space-y-2">
            {/* Ratings row */}
            {(reflection.excitement != null || reflection.achievement != null || reflection.wantAgain != null) && (
              <div className="flex items-center gap-3 flex-wrap">
                {reflection.excitement != null && (
                  <div className="flex items-center gap-1.5">
                    <RatingDots value={reflection.excitement} activeClass="bg-[#7C4DFF]" />
                    <span className="text-zinc-500 text-[11px]">興奮</span>
                  </div>
                )}
                {reflection.achievement != null && (
                  <div className="flex items-center gap-1.5">
                    <RatingDots value={reflection.achievement} activeClass="bg-[#00E5FF]/70" />
                    <span className="text-zinc-500 text-[11px]">達成感</span>
                  </div>
                )}
                {reflection.wantAgain != null && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      reflection.wantAgain
                        ? "bg-[#7C4DFF]/15 text-[#7C4DFF]"
                        : "bg-white/5 text-zinc-500"
                    }`}
                  >
                    {reflection.wantAgain ? "またやりたい" : "今回は十分"}
                  </span>
                )}
              </div>
            )}
            {reflection.note && (
              <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">{reflection.note}</p>
            )}
            <AddReflectionButton logId={log.id} initialValues={reflection} />
          </div>
        ) : (
          <AddReflectionButton logId={log.id} />
        )}
      </div>
    </div>
  );
}
