import Link from "next/link";
import { BarChart2 } from "lucide-react";
import { addDays, subDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { getLogsRangePageForCurrentUser } from "@/server/queries/log";
import { buildDayRange } from "@/lib/date-utils";
import { DayList } from "@/components/history/day-list";
import { PageHeader } from "@/components/layout/page-header";

const RANGE_DAYS = 30;
const TZ = "Asia/Tokyo";

export default async function HistoryPage() {
  const todayJST = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
  const todayStart = fromZonedTime(todayJST, TZ);
  const to = addDays(todayStart, 1); // exclusive: covers today
  const from = subDays(todayStart, RANGE_DAYS - 1); // inclusive: 30 days including today
  const oldestDate = formatInTimeZone(from, TZ, "yyyy-MM-dd");

  const result = await getLogsRangePageForCurrentUser({ from, to }).catch(() => null);

  if (!result) {
    return (
      <div className="px-4 pb-6 max-w-lg mx-auto">
        <PageHeader title="記録" description="日別にピーク体験を振り返ることができます" />
        <p className="text-zinc-500 text-sm">記録の読み込みに失敗しました</p>
      </div>
    );
  }

  const { logs, hasMore } = result;
  const dayItems = buildDayRange(logs, from, to);
  const hasAnyLogs = logs.length > 0 || hasMore;

  return (
    <div className="px-4 pb-6 max-w-lg mx-auto">
      <PageHeader
        title="記録"
        description="日別にピーク体験を振り返ることができます"
        action={
          <Link
            href="/history/stats"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7C4DFF]/10 border border-[#7C4DFF]/30 text-[#7C4DFF] hover:bg-[#7C4DFF]/20 hover:text-[#9E70FF] transition-colors text-sm"
            aria-label="月次統計を見る"
          >
            <BarChart2 size={15} />
            <span>月次統計</span>
          </Link>
        }
      />

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
