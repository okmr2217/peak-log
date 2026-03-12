import Link from "next/link";
import { getLogsPageForCurrentUser } from "@/server/queries/log";
import { HistoryList } from "@/components/history/history-list";
import { HistoryFilter } from "@/components/history/history-filter";

type Props = {
  searchParams: Promise<{ q?: string; from?: string; to?: string }>;
};

export default async function HistoryPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const from = params.from || undefined;
  const to = params.to || undefined;
  const hasFilters = !!(q || from || to);

  let initialPage;
  try {
    initialPage = await getLogsPageForCurrentUser({ q, from, to });
  } catch {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-white mb-5">記録</h1>
        <p className="text-zinc-500 text-sm">記録の読み込みに失敗しました</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-white mb-5">記録</h1>
      <HistoryFilter q={q} from={from} to={to} />
      {initialPage.items.length === 0 ? (
        hasFilters ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-zinc-400 text-sm mb-1">記録が見つかりません</p>
            <p className="text-zinc-600 text-xs mb-6">条件を変えてもう一度試してみてください</p>
            <Link href="/history" className="text-sm text-[#7C4DFF] hover:text-[#9E70FF] transition-colors">
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
