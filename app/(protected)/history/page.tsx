import Link from "next/link";
import { getLogsPageForCurrentUser, getMonthlySummaryForCurrentUser } from "@/server/queries/log";
import { HistoryList } from "@/components/history/history-list";
import { HistoryFilter } from "@/components/history/history-filter";
import { MonthlySummarySection } from "@/components/history/monthly-summary";

type Props = {
  searchParams: Promise<{ q?: string; from?: string; to?: string; month?: string }>;
};

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function isValidMonth(s: string | undefined): s is string {
  if (!s) return false;
  return /^\d{4}-(?:0[1-9]|1[0-2])$/.test(s);
}

export default async function HistoryPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const from = params.from || undefined;
  const to = params.to || undefined;
  const hasFilters = !!(q || from || to);

  const month = isValidMonth(params.month) ? params.month : getCurrentMonth();

  // Build base params for month nav (preserves filter state, excludes month)
  const baseParams = new URLSearchParams({
    ...(q ? { q } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  }).toString();

  const [pageResult, summaryResult] = await Promise.allSettled([
    getLogsPageForCurrentUser({ q, from, to }),
    getMonthlySummaryForCurrentUser(month),
  ]);

  if (pageResult.status === "rejected") {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-white mb-5">記録</h1>
        <p className="text-zinc-500 text-sm">記録の読み込みに失敗しました</p>
      </div>
    );
  }

  const initialPage = pageResult.value;
  const summary = summaryResult.status === "fulfilled" ? summaryResult.value : null;

  const clearHref = month !== getCurrentMonth() ? `/history?month=${month}` : "/history";

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-white mb-5">記録</h1>

      {summary && <MonthlySummarySection summary={summary} month={month} baseParams={baseParams} />}

      <div className="border-t border-zinc-800/50 my-5" />

      <HistoryFilter q={q} from={from} to={to} month={month} />

      {initialPage.items.length === 0 ? (
        hasFilters ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-zinc-400 text-sm mb-1">記録が見つかりません</p>
            <p className="text-zinc-600 text-xs mb-6">条件を変えてもう一度試してみてください</p>
            <Link href={clearHref} className="text-sm text-[#7C4DFF] hover:text-[#9E70FF] transition-colors">
              条件をクリア
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-zinc-400 text-sm mb-1">まだピークはありません</p>
            <p className="text-zinc-600 text-xs mb-6">記録した内容はここに並びます</p>
            <Link href="/" className="text-sm text-[#7C4DFF] hover:text-[#9E70FF] transition-colors">
              ピークを記録 →
            </Link>
          </div>
        )
      ) : (
        <HistoryList initialPage={initialPage} q={q} from={from} to={to} />
      )}
    </div>
  );
}
