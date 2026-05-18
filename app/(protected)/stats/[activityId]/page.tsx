import { notFound } from "next/navigation";
import { MobileHeader } from "@/components/mobile-header";
import { getActivityStatDetailForCurrentUser } from "@/server/queries/log";
import type { PeriodPreset } from "@/server/queries/log";
import { PeriodFilter } from "@/components/stats/period-filter";
import { LogGraph } from "@/components/stats/log-graph";
import { FieldDistributionSection } from "@/components/stats/field-distribution";
import { formatRelativeTime } from "@/lib/date-utils";

const VALID_PERIODS: PeriodPreset[] = ["thisMonth", "3months", "thisYear", "all"];

type Props = {
  params: Promise<{ activityId: string }>;
  searchParams: Promise<{ period?: string }>;
};

function formatAvgInterval(days: number): string {
  if (days < 1) {
    const hours = Math.round(days * 24);
    return `${hours}時間ごと`;
  }
  const rounded = Math.round(days * 10) / 10;
  return `${rounded % 1 === 0 ? rounded : rounded.toFixed(1)}日ごと`;
}

export default async function ActivityStatsPage({ params, searchParams }: Props) {
  const { activityId } = await params;
  const { period: periodParam } = await searchParams;
  const period: PeriodPreset = VALID_PERIODS.includes(periodParam as PeriodPreset)
    ? (periodParam as PeriodPreset)
    : "thisMonth";

  const detail = await getActivityStatDetailForCurrentUser(activityId, period);
  if (!detail) notFound();

  const { activity, fieldStats, dailyData } = detail;
  const color = activity.color ?? "#7C4DFF";

  const metrics = [
    {
      label: "累計",
      value: detail.totalCount.toString(),
      unit: "件",
    },
    {
      label: "連続",
      value: detail.streak.toString(),
      unit: "日",
    },
    {
      label: "週平均",
      value: detail.weeklyAvg.toFixed(1),
      unit: "回/週",
    },
    {
      label: "平均間隔",
      value: detail.avgIntervalDays != null ? formatAvgInterval(detail.avgIntervalDays) : "—",
      unit: null,
    },
    {
      label: "1日最大",
      value: detail.maxPerDay > 0 ? detail.maxPerDay.toString() : "—",
      unit: detail.maxPerDay > 0 ? "回" : null,
    },
    {
      label: "前回から",
      value: detail.lastPerformedAt ? formatRelativeTime(detail.lastPerformedAt) : "—",
      unit: null,
    },
  ];

  return (
    <>
      <MobileHeader title={activity.name} showBack />
      <div className="p-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: `${color}18` }}
          >
            {activity.emoji ?? "⚡"}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{activity.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">詳細統計</p>
          </div>
        </div>

        <PeriodFilter currentPeriod={period} basePath={`/stats/${activityId}`} />

        {detail.totalCount === 0 ? (
          <div className="bg-card rounded-xl p-6 text-center border border-border">
            <p className="text-muted-foreground text-sm">この期間の記録はありません</p>
          </div>
        ) : (
          <>
            <div className="bg-card rounded-2xl border border-border p-4 mb-4">
              <div className="grid grid-cols-3 gap-x-4 gap-y-4">
                {metrics.map((m) => (
                  <div key={m.label}>
                    <p className="text-[11px] text-muted-foreground/60 mb-0.5">{m.label}</p>
                    {m.unit && m.unit !== null && !["—"].includes(m.value) ? (
                      <p className="text-foreground font-semibold text-base tabular-nums leading-tight">
                        {m.value}
                        <span className="text-muted-foreground text-xs font-normal ml-0.5">{m.unit}</span>
                      </p>
                    ) : (
                      <p className="text-foreground font-semibold text-base tabular-nums leading-tight">{m.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-4 mb-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">記録グラフ</h2>
              <LogGraph dailyData={dailyData} color={activity.color} />
            </div>

            <FieldDistributionSection fieldStats={fieldStats} color={activity.color} />
          </>
        )}
      </div>
    </>
  );
}
