import { getMonthlySummaryForCurrentUser, getMonthlyLogsForCurrentUser } from "@/server/queries/log";
import { MonthlySummarySection } from "@/components/history/monthly-summary";
import { MonthNav } from "@/components/history/month-nav";
import { PageHeader } from "@/components/layout/page-header";
import { formatInTimeZone } from "date-fns-tz";
import { formatDayFull, formatTime } from "@/lib/date-utils";
import { getDayType, getDateTextClassName } from "@/lib/day-type";

const TZ = "Asia/Tokyo";

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

type Props = {
  searchParams: Promise<{ month?: string }>;
};

export default async function MonthlyPage({ searchParams }: Props) {
  const { month: monthParam } = await searchParams;
  const month = monthParam ?? getCurrentMonth();

  const [summary, logs] = await Promise.all([
    getMonthlySummaryForCurrentUser(month).catch(() => null),
    getMonthlyLogsForCurrentUser(month).catch(() => null),
  ]);

  // Group logs by date (logs are ordered desc, so dates appear newest-first)
  const dayGroupsMap = new Map<string, NonNullable<typeof logs>[number][]>();
  for (const log of logs ?? []) {
    const date = formatInTimeZone(log.performedAt, TZ, "yyyy-MM-dd");
    const existing = dayGroupsMap.get(date);
    if (existing) existing.push(log);
    else dayGroupsMap.set(date, [log]);
  }
  const dayGroups = Array.from(dayGroupsMap.entries());

  return (
    <div className="px-4 pb-6 max-w-lg mx-auto">
      <PageHeader
        title="月次"
        description="月ごとの記録を確認できます"
        action={<MonthNav month={month} baseParams="" basePath="/monthly" />}
      />

      {summary ? (
        <MonthlySummarySection summary={summary} />
      ) : (
        <p className="text-zinc-500 text-sm">統計の読み込みに失敗しました</p>
      )}

      <section className="mt-6">
        <span className="text-sm text-zinc-400 uppercase tracking-wider font-medium">今月のピーク</span>
        {dayGroups.length === 0 ? (
          <div className="bg-[#1A1A1A] rounded-xl p-6 text-center border border-white/[0.05] mt-2">
            <p className="text-zinc-400 text-sm mb-1">この月のピークはまだありません</p>
            <p className="text-zinc-600 text-xs">記録すると、ここに日別で表示されます</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04] mt-1">
            {dayGroups.map(([date, dayLogs]) => (
              <div key={date} className="flex flex-col gap-2.5 py-2.5 px-1">
                <span className={`text-sm font-medium tabular-nums ${getDateTextClassName(getDayType(date))}`}>
                  {formatDayFull(date)}
                </span>
                <span className="flex flex-wrap gap-x-1.5 gap-y-2">
                  {dayLogs.map((log, i) => {
                    const color = log.activity.color;
                    return (
                      <span
                        key={`${log.id}-${i}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-sm text-zinc-300 shrink-0"
                        style={{
                          background: color ? `${color}22` : "rgba(255,255,255,0.06)",
                          borderColor: color ? `${color}44` : "rgba(255,255,255,0.08)",
                        }}
                      >
                        <span className="text-sm leading-none">{log.activity.emoji ?? "·"}</span>
                        <span className="tabular-nums text-zinc-400 text-sm leading-none">{formatTime(log.performedAt)}</span>
                      </span>
                    );
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
