import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getMonthlySummaryForCurrentUser } from "@/server/queries/log";
import { MonthlySummarySection } from "@/components/history/monthly-summary";

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
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/history"
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-white"
          aria-label="記録に戻る"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-white">統計</h1>
      </div>

      {summary ? (
        <MonthlySummarySection summary={summary} month={month} baseParams="" basePath="/history/stats" />
      ) : (
        <p className="text-zinc-500 text-sm">統計の読み込みに失敗しました</p>
      )}
    </div>
  );
}
