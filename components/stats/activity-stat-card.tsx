import Link from "next/link";
import type { ActivityListStat, PeriodPreset } from "@/server/queries/log";
import { formatRelativeTime } from "@/lib/date-utils";

type Props = {
  stat: ActivityListStat;
  rank: number;
  period: PeriodPreset;
};

export function ActivityStatCard({ stat, rank, period }: Props) {
  const color = stat.color ?? "#7C4DFF";

  return (
    <Link
      href={`/stats/${stat.activityId}?period=${period}`}
      className="relative bg-card rounded-xl border border-border overflow-hidden flex items-center gap-3 pl-4 pr-4 py-3.5 hover:bg-muted transition-colors"
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: color }} />
      <span className="text-xs text-muted-foreground/60 w-5 text-right tabular-nums font-medium shrink-0">{rank}</span>
      <span className="text-xl shrink-0">{stat.emoji ?? "·"}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-medium text-foreground truncate">{stat.name}</span>
          <span className="text-2xl font-bold tabular-nums" style={{ color }}>
            {stat.logCount}
          </span>
          <span className="text-xs text-muted-foreground">件</span>
          {stat.streak > 0 && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full" style={{ background: `${color}22`, color }}>
              🔥{stat.streak}日
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <span>週{stat.weeklyAvg.toFixed(1)}回</span>
          {stat.lastPerformedAt && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span>{formatRelativeTime(stat.lastPerformedAt)}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
