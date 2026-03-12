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
        <h2 className="text-xl font-bold text-white mb-5">記録</h2>
        <p className="text-zinc-500 text-sm">記録の読み込みに失敗しました</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-white mb-5">記録</h2>
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <p className="text-zinc-500 text-sm">まだピークは記録されていません</p>
          <Link
            href="/"
            className="text-xs text-[#7C4DFF] hover:text-[#9E70FF] transition-colors"
          >
            最初のピークを記録しに行く →
          </Link>
        </div>
      </div>
    );
  }

  const groups = groupLogsByDate(logs);

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-white mb-5">記録</h2>
      <div className="space-y-6">
        {groups.map(({ dateLabel, logs: groupLogs }) => (
          <section key={dateLabel}>
            <h3 className="text-xs text-zinc-500 mb-2 px-0.5">{dateLabel}</h3>
            <div className="space-y-3">
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
