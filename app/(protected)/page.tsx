import { getActiveActivitiesForCurrentUser } from "@/server/queries/activity";
import { getLogsPageForCurrentUser } from "@/server/queries/log";
import { LogList } from "@/components/log/log-list";
import { HomeFab } from "@/components/log/home-fab";

export default async function HomePage() {
  const [activities, logsPage] = await Promise.all([getActiveActivitiesForCurrentUser(), getLogsPageForCurrentUser({ limit: 30 })]);

  return (
    <div className="px-4 pt-4 pb-6 max-w-lg mx-auto space-y-8">
      <section>
        <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide">最近のピーク</h2>
        <LogList initialPage={logsPage} />
      </section>

      <HomeFab activities={activities} />
    </div>
  );
}
