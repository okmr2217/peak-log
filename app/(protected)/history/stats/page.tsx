import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getMonthlySummaryForCurrentUser } from "@/server/queries/log";
import { MonthlySummarySection } from "@/components/history/monthly-summary";
import { PageHeader } from "@/components/layout/page-header";

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

type Props = {
  searchParams: Promise<{ month?: string }>;
};

export default async function HistoryStatsPage({ searchParams }: Props) {
  const { month: monthParam } = await searchParams;
  const month = monthParam ?? getCurrentMonth();

  const summary = await getMonthlySummaryForCurrentUser(month).catch(() => null);

  return (
    <div className="px-4 pb-6 max-w-lg mx-auto">
      <PageHeader
        title="月次統計"
        description="月ごとの記録を集計して確認できます"
        action={
          <Link
            href="/history"
            className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-white"
            aria-label="記録に戻る"
          >
            <ChevronLeft size={16} />
            <span className="text-sm">記録</span>
          </Link>
        }
      />

      {summary ? (
        <MonthlySummarySection summary={summary} month={month} baseParams="" basePath="/history/stats" />
      ) : (
        <p className="text-zinc-500 text-sm">統計の読み込みに失敗しました</p>
      )}
    </div>
  );
}
