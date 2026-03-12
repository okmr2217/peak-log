import Link from "next/link";
import { getLogsForCurrentUser } from "@/server/queries/log";
import { LogCard } from "@/components/log/log-card";
import { groupLogsByDate } from "@/lib/date-utils";

export default async function HistoryPage() {
  let logs;
  try {
    logs = await getLogsForCurrentUser(200);
  } catch {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-white mb-5">記録</h1>
        <p className="text-zinc-500 text-sm">記録の読み込みに失敗しました</p>
      </div>
    );
  }

  if (logs.length === 0) {
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

  const groups = groupLogsByDate(logs);

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-white mb-5">記録</h1>
      <div className="space-y-7">
        {groups.map(({ dateLabel, logs: groupLogs }) => (
          <section key={dateLabel}>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xs font-medium text-zinc-500 shrink-0">{dateLabel}</h3>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="space-y-2.5">
              {groupLogs.map((log) => (
                <LogCard key={log.id} log={log} timeOnly showDelete />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
