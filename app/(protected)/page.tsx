import { formatInTimeZone } from "date-fns-tz";
import { getActiveActivitiesForCurrentUser } from "@/server/queries/activity";
import { getLogsForCurrentUser } from "@/server/queries/log";
import { ActivityGrid } from "@/components/activity/activity-grid";
import { LogList } from "@/components/log/log-list";

export default async function HomePage() {
  const [activities, logs] = await Promise.all([getActiveActivitiesForCurrentUser(), getLogsForCurrentUser(5)]);
  const dateLabel = formatInTimeZone(new Date(), "Asia/Tokyo", "M月d日");

  return (
    <div className="px-4 pt-4 pb-6 max-w-lg mx-auto space-y-8">
      <section>
        <div className="pb-4">
          <p className="text-xs text-zinc-600 mb-1">{dateLabel}</p>
          <h1 className="text-base font-medium text-zinc-300">今日のピーク</h1>
          <p className="text-xs text-zinc-600 mt-1.5">今日もピーク体験を記録しよう</p>
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
