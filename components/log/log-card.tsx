import { AddReflectionButton } from "./add-reflection-button";

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
};

function formatPerformedAt(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function LogCard({ log }: LogCardProps) {
  const { activity, reflection, performedAt } = log;

  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/5">
      <div className="flex items-center gap-2">
        {activity.emoji && <span className="text-lg leading-none">{activity.emoji}</span>}
        <span className="text-white font-medium text-sm">{activity.name}</span>
        <span className="ml-auto text-zinc-500 text-xs shrink-0">{formatPerformedAt(performedAt)}</span>
      </div>

      {reflection ? (
        <div className="mt-2 space-y-1">
          {reflection.excitement != null && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-xs ${i < reflection.excitement! ? "text-[#7C4DFF]" : "text-white/10"}`}
                >
                  ●
                </span>
              ))}
              <span className="text-zinc-500 text-xs ml-1">高揚感</span>
            </div>
          )}
          {reflection.note && (
            <p className="text-zinc-400 text-xs line-clamp-2 mt-1">{reflection.note}</p>
          )}
        </div>
      ) : (
        <div className="mt-2">
          <AddReflectionButton logId={log.id} />
        </div>
      )}
    </div>
  );
}
