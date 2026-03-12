import { AddReflectionButton } from "./add-reflection-button";
import { DeleteLogButton } from "./delete-log-button";
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
};

function RatingDots({ value, activeClass }: { value: number; activeClass: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-xs ${i < value ? activeClass : "text-white/10"}`}>
          ●
        </span>
      ))}
    </div>
  );
}

export function LogCard({ log, timeOnly = false, showDelete = false }: LogCardProps) {
  const { activity, reflection, performedAt } = log;
  const timeLabel = timeOnly ? formatTime(performedAt) : formatPerformedAt(performedAt);

  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/5">
      <div className="flex items-center gap-2">
        {activity.emoji && <span className="text-lg leading-none">{activity.emoji}</span>}
        <span className="text-white font-medium text-sm">{activity.name}</span>
        <span className="ml-auto text-zinc-500 text-xs shrink-0">{timeLabel}</span>
        {showDelete && <DeleteLogButton logId={log.id} />}
      </div>

      {reflection ? (
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            {reflection.excitement != null && (
              <div className="flex items-center gap-1">
                <RatingDots value={reflection.excitement} activeClass="text-[#7C4DFF]" />
                <span className="text-zinc-500 text-xs">興奮</span>
              </div>
            )}
            {reflection.achievement != null && (
              <div className="flex items-center gap-1">
                <RatingDots value={reflection.achievement} activeClass="text-[#00E5FF]/70" />
                <span className="text-zinc-500 text-xs">達成感</span>
              </div>
            )}
            {reflection.wantAgain != null && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${reflection.wantAgain ? "bg-[#7C4DFF]/20 text-[#7C4DFF]" : "bg-white/5 text-zinc-500"}`}
              >
                {reflection.wantAgain ? "またやりたい" : "今回は十分"}
              </span>
            )}
          </div>
          {reflection.note && <p className="text-zinc-400 text-xs line-clamp-2">{reflection.note}</p>}
          <AddReflectionButton logId={log.id} initialValues={reflection} />
        </div>
      ) : (
        <div className="mt-2">
          <AddReflectionButton logId={log.id} />
        </div>
      )}
    </div>
  );
}
