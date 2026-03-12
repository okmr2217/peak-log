import Link from "next/link";
import { getLogsPageForCurrentUser } from "@/server/queries/log";
import { HistoryList } from "@/components/history/history-list";

export default async function HistoryPage() {
  let initialPage;
  try {
    initialPage = await getLogsPageForCurrentUser();
  } catch {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-white mb-5">記録</h1>
        <p className="text-zinc-500 text-sm">記録の読み込みに失敗しました</p>
      </div>
    );
  }

  if (initialPage.items.length === 0) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-white mb-5">記録</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-zinc-400 text-sm mb-1">まだピークはありません</p>
          <p className="text-zinc-600 text-xs mb-6">記録した内容はここに並びます</p>
          <Link href="/" className="text-sm text-[#7C4DFF] hover:text-[#9E70FF] transition-colors">
            ピークを記録 →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-white mb-5">記録</h1>
      <HistoryList initialPage={initialPage} />
    </div>
  );
}
