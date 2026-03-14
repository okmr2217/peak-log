import Link from "next/link";
import { BarChart2 } from "lucide-react";
import dayjs from "dayjs";
import { getLogsRangePageForCurrentUser } from "@/server/queries/log";
import { buildDayRange } from "@/lib/date-utils";
import { DayList } from "@/components/history/day-list";

const RANGE_DAYS = 30;

export default async function HistoryPage() {
  const today = dayjs().startOf("day");
  const to = today.add(1, "day").toDate(); // exclusive: covers today
  const from = today.subtract(RANGE_DAYS - 1, "day").toDate(); // inclusive: 30 days including today
  const oldestDate = today.subtract(RANGE_DAYS - 1, "day").format("YYYY-MM-DD");

  const result = await getLogsRangePageForCurrentUser({ from, to }).catch(() => null);

  if (!result) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-white mb-5">記録</h1>
        <p className="text-zinc-500 text-sm">記録の読み込みに失敗しました</p>
      </div>
    );
  }

  const { logs, hasMore } = result;
  const dayItems = buildDayRange(logs, from, to);
  const hasAnyLogs = logs.length > 0 || hasMore;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-white">記録</h1>
        <Link
          href="/history/stats"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-sm"
          aria-label="月次統計を見る"
        >
          <BarChart2 size={15} />
          <span>統計</span>
        </Link>
      </div>

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
