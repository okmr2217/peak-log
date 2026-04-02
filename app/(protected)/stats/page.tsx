import { getMonthlySummaryForCurrentUser, getCategoryStatsForCurrentUser } from "@/server/queries/log";
import type { PeriodPreset } from "@/server/queries/log";
import { MonthlySummarySection } from "@/components/history/monthly-summary";
import { MonthNav } from "@/components/history/month-nav";
import { PageHeader } from "@/components/layout/page-header";
import { StatsTabs } from "@/components/stats/stats-tabs";
import { CategoryStatsSection } from "@/components/stats/category-stats-section";

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const VALID_PERIODS: PeriodPreset[] = ["thisMonth", "3months", "thisYear", "all"];

type Props = {
  searchParams: Promise<{ tab?: string; month?: string; period?: string }>;
};

export default async function StatsPage({ searchParams }: Props) {
  const { tab, month: monthParam, period: periodParam } = await searchParams;

  const currentTab = tab === "monthly" ? "monthly" : "category";
  const month = monthParam ?? getCurrentMonth();
  const period: PeriodPreset = VALID_PERIODS.includes(periodParam as PeriodPreset)
    ? (periodParam as PeriodPreset)
    : "thisMonth";

  return (
    <div className="p-4 max-w-lg mx-auto">
      <PageHeader title="統計" description="記録の傾向を確認できます" />

      <StatsTabs currentTab={currentTab} month={month} period={period} />

      {currentTab === "monthly" && (
        <div className="flex justify-center mb-4">
          <MonthNav month={month} baseParams="tab=monthly" basePath="/stats" />
        </div>
      )}

      {currentTab === "monthly" ? (
        <MonthlyStatsContent month={month} />
      ) : (
        <CategoryStatsContent period={period} />
      )}
    </div>
  );
}

async function MonthlyStatsContent({ month }: { month: string }) {
  const summary = await getMonthlySummaryForCurrentUser(month).catch(() => null);

  if (!summary) {
    return <p className="text-muted-foreground text-sm">統計の読み込みに失敗しました</p>;
  }

  return <MonthlySummarySection summary={summary} />;
}

async function CategoryStatsContent({ period }: { period: PeriodPreset }) {
  const stats = await getCategoryStatsForCurrentUser(period).catch(() => []);
  return <CategoryStatsSection stats={stats} period={period} />;
}
