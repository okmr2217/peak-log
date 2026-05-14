import { getActivityListStatsForCurrentUser } from "@/server/queries/log";
import type { PeriodPreset } from "@/server/queries/log";
import { MobileHeader } from "@/components/mobile-header";
import { PeriodFilter } from "@/components/stats/period-filter";
import { ActivityStatCard } from "@/components/stats/activity-stat-card";

const VALID_PERIODS: PeriodPreset[] = ["thisMonth", "3months", "thisYear", "all"];

type Props = {
  searchParams: Promise<{ period?: string }>;
};

export default async function StatsPage({ searchParams }: Props) {
  const { period: periodParam } = await searchParams;
  const period: PeriodPreset = VALID_PERIODS.includes(periodParam as PeriodPreset) ? (periodParam as PeriodPreset) : "thisMonth";

  const stats = await getActivityListStatsForCurrentUser(period).catch(() => []);

  return (
    <>
      <MobileHeader title="統計" />
      <div className="p-4 max-w-lg mx-auto">
      <p className="text-xs text-muted-foreground mb-3">活動ごとの記録を確認できます</p>
      <PeriodFilter currentPeriod={period} basePath="/stats" />

      {stats.length === 0 ? (
        <div className="bg-card rounded-xl p-6 text-center border border-border">
          <p className="text-muted-foreground text-sm mb-1">この期間の記録はありません</p>
          <p className="text-muted-foreground/60 text-xs">記録すると、ここに統計が表示されます</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {stats.map((stat, index) => (
            <li key={stat.activityId}>
              <ActivityStatCard stat={stat} rank={index + 1} period={period} />
            </li>
          ))}
        </ul>
      )}
    </div>
    </>
  );
}
