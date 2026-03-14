import { AddReflectionButton } from "./add-reflection-button";
import { LogCardMenu } from "./log-card-menu";

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
  usage: "home" | "history";
  onPerformedAtSaved?: (logId: string, newDate: Date) => void;
  onReflectionSaved?: (
    logId: string,
    reflection: {
      id: string;
      excitement: number | null;
      achievement: number | null;
      wantAgain: boolean | null;
      note: string | null;
    },
  ) => void;
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
  const { activity, reflection, performedAt } = log;
  const timeOnly = usage === "history";

  const color = activity.color;
  const cardStyle = {
    background: color
      ? `radial-gradient(ellipse at 0% 20%, ${color}18 0%, transparent 55%), #1A1A1A`
      : "#1A1A1A",
    borderColor: color ? `${color}38` : "rgba(255,255,255,0.08)",
    boxShadow: color
      ? `0 4px 20px -8px ${color}38, inset 0 1px 0 rgba(255,255,255,0.07)`
      : `0 2px 10px -4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
  };

  return (
    <div
      className="rounded-2xl border transition-all animate-in fade-in-0 duration-300"
      style={cardStyle}
    >
      {/* Header row */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3.5">
        {activity.emoji && (
          <span
            className="text-lg leading-none flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: color ? `${color}28` : "rgba(255,255,255,0.07)" }}
          >
            {activity.emoji}
          </span>
        )}
        <span className="text-white font-semibold text-[15px] tracking-tight flex-1 min-w-0 truncate">
          {activity.name}
        </span>
        <LogCardMenu
          logId={log.id}
          performedAt={performedAt}
          timeOnly={timeOnly}
          onPerformedAtSaved={onPerformedAtSaved ? (d) => onPerformedAtSaved(log.id, d) : undefined}
        />
      </div>

      {/* Reflection area */}
      <div
        className="pb-4 border-t"
        style={{
          paddingLeft: "16px",
          paddingRight: "16px",
          borderColor: color ? `${color}22` : "rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.18)",
        }}
      >
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
            {reflection.note && <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">{reflection.note}</p>}
            <AddReflectionButton
              logId={log.id}
              initialValues={reflection}
              onSaved={onReflectionSaved ? (r) => onReflectionSaved(log.id, r) : undefined}
            />
          </div>
        ) : (
          <div className="pt-3">
            <AddReflectionButton
              logId={log.id}
              onSaved={onReflectionSaved ? (r) => onReflectionSaved(log.id, r) : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}
