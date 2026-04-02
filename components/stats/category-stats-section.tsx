import Link from "next/link";
import type { ActivityCategoryStat, PeriodPreset } from "@/server/queries/log";
import { PeriodFilter } from "./period-filter";
import { formatRelativeTime } from "@/lib/date-utils";

type Props = {
  stats: ActivityCategoryStat[];
  period: PeriodPreset;
};

export function CategoryStatsSection({ stats, period }: Props) {
  return (
    <div>
      <PeriodFilter currentPeriod={period} />

      {stats.length === 0 ? (
        <div className="bg-card rounded-xl p-6 text-center border border-border">
          <p className="text-muted-foreground text-sm mb-1">この期間の記録はありません</p>
          <p className="text-muted-foreground/60 text-xs">記録すると、ここにカテゴリ別の統計が表示されます</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {stats.map((stat, index) => {
            const color = stat.color;
            return (
              <li key={stat.activityId}>
                <Link
                  href={`/activities/${stat.activityId}`}
                  className="relative bg-card rounded-xl border border-border overflow-hidden flex items-center gap-3 pl-4 pr-4 py-3.5 hover:bg-muted transition-colors"
                >
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px]"
                  style={{ background: color ?? "#7C4DFF" }}
                />
                  <span className="text-xs text-muted-foreground/60 w-5 text-right tabular-nums font-medium shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-xl shrink-0">{stat.emoji ?? "·"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground truncate">{stat.name}</span>
                      <span className="text-2xl font-bold tabular-nums" style={{ color: color ?? "#ffffff" }}>
                        {stat.logCount}
                      </span>
                      <span className="text-xs text-muted-foreground">件</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span>{stat.distinctDays}日</span>
                      <span className="text-muted-foreground/40">·</span>
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
