import { getLogsForCurrentUser } from "@/server/queries/log";
import { LogList } from "@/components/log/log-list";

export default async function HistoryPage() {
  const logs = await getLogsForCurrentUser(50);

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-white mb-5">ログ履歴</h2>
      <LogList logs={logs} />
    </div>
  );
}
