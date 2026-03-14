import dayjs from "dayjs";
import { getActiveActivitiesForCurrentUser } from "@/server/queries/activity";
import { getLogsForCurrentUser } from "@/server/queries/log";
import { ActivityGrid } from "@/components/activity/activity-grid";
import { LogList } from "@/components/log/log-list";

export default async function HomePage() {
  const [activities, logs] = await Promise.all([getActiveActivitiesForCurrentUser(), getLogsForCurrentUser(5)]);
  const dateLabel = dayjs().format("M月D日");

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-8">
      <section>
        <div className="py-3 border-b border-white/5 mb-5">
          <p className="text-xs text-zinc-600 mb-1">{dateLabel}</p>
          <h1 className="text-base font-medium text-zinc-300">今日のピーク</h1>
        </div>
        <ActivityGrid activities={activities} />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide">最近のピーク</h2>
        <LogList logs={logs} />
      </section>
    </div>
  );
}
