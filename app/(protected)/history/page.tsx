import Link from "next/link";
import dayjs from "dayjs";
import { getLogsRangePageForCurrentUser, getMonthlySummaryForCurrentUser } from "@/server/queries/log";
import { buildDayRange } from "@/lib/date-utils";
import { DayList } from "@/components/history/day-list";
import { MonthlySummarySection } from "@/components/history/monthly-summary";

const RANGE_DAYS = 30;

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function HistoryPage() {
  const today = dayjs().startOf("day");
  const to = today.add(1, "day").toDate(); // exclusive: covers today
  const from = today.subtract(RANGE_DAYS - 1, "day").toDate(); // inclusive: 30 days including today
  const oldestDate = today.subtract(RANGE_DAYS - 1, "day").format("YYYY-MM-DD");
  const month = getCurrentMonth();

  const [rangeResult, summaryResult] = await Promise.allSettled([
    getLogsRangePageForCurrentUser({ from, to }),
    getMonthlySummaryForCurrentUser(month),
  ]);

  if (rangeResult.status === "rejected") {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-white mb-5">記録</h1>
        <p className="text-zinc-500 text-sm">記録の読み込みに失敗しました</p>
      </div>
    );
  }

  const { logs, hasMore } = rangeResult.value;
  const summary = summaryResult.status === "fulfilled" ? summaryResult.value : null;
  const dayItems = buildDayRange(logs, from, to);
  const hasAnyLogs = logs.length > 0 || hasMore;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-white mb-5">記録</h1>

      {summary && <MonthlySummarySection summary={summary} month={month} baseParams="" />}

      <div className="border-t border-zinc-800/50 my-5" />

      {!hasAnyLogs ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-zinc-400 text-sm mb-1">まだピークはありません</p>
          <p className="text-zinc-600 text-xs mb-6">記録した内容はここに並びます</p>
          <Link href="/" className="text-sm text-[#7C4DFF] hover:text-[#9E70FF] transition-colors">
            ピークを記録 →
          </Link>
        </div>
      ) : (
        <DayList initialItems={dayItems} oldestDate={oldestDate} hasMore={hasMore} />
      )}
    </div>
  );
}
