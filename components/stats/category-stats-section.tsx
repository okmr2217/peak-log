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
        <div className="bg-[#1A1A1A] rounded-xl p-6 text-center border border-white/[0.05]">
          <p className="text-zinc-400 text-sm mb-1">この期間の記録はありません</p>
          <p className="text-zinc-600 text-xs">記録すると、ここにカテゴリ別の統計が表示されます</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {stats.map((stat, index) => {
            const color = stat.color;
            return (
              <li
                key={stat.activityId}
                className="relative bg-[#1A1A1A] rounded-xl border border-white/[0.05] overflow-hidden"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px]"
                  style={{ background: color ?? "#7C4DFF" }}
                />
                <div className="pl-4 pr-4 py-3.5 flex items-center gap-3">
                  <span className="text-xs text-zinc-600 w-5 text-right tabular-nums font-medium shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-xl shrink-0">{stat.emoji ?? "·"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-medium text-white truncate">{stat.name}</span>
                      <span className="text-2xl font-bold tabular-nums" style={{ color: color ?? "#ffffff" }}>
                        {stat.logCount}
                      </span>
                      <span className="text-xs text-zinc-500">件</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 flex-wrap">
                      <span>{stat.distinctDays}日</span>
                      <span className="text-zinc-700">·</span>
                      <span>週{stat.weeklyAvg.toFixed(1)}回</span>
                      {stat.lastPerformedAt && (
                        <>
                          <span className="text-zinc-700">·</span>
                          <span>{formatRelativeTime(stat.lastPerformedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
