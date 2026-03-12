import { getActiveActivitiesForCurrentUser } from "@/server/queries/activity";
import { getLogsForCurrentUser } from "@/server/queries/log";
import { ActivityGrid } from "@/components/activity/activity-grid";
import { LogList } from "@/components/log/log-list";

export default async function HomePage() {
  const [activities, logs] = await Promise.all([getActiveActivitiesForCurrentUser(), getLogsForCurrentUser(5)]);

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-8">
      <section>
        <h1 className="text-xl font-bold text-white mb-5">今日のピーク</h1>
        <ActivityGrid activities={activities} />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide">最近のピーク</h2>
        <LogList logs={logs} />
      </section>
    </div>
  );
}
