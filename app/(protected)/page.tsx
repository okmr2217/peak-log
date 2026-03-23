import { addDays, subDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { getActiveActivitiesForCurrentUser } from "@/server/queries/activity";
import { getLogsRangePageForCurrentUser } from "@/server/queries/log";
import { buildDayRange } from "@/lib/date-utils";
import { TimelineList } from "@/components/history/timeline-list";
import { HomeFab } from "@/components/log/home-fab";
import { PageHeader } from "@/components/layout/page-header";

const RANGE_DAYS = 30;
const TZ = "Asia/Tokyo";

export default async function HomePage() {
  const todayJST = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
  const todayStart = fromZonedTime(todayJST, TZ);
  const to = addDays(todayStart, 1);
  const from = subDays(todayStart, RANGE_DAYS - 1);
  const oldestDate = formatInTimeZone(from, TZ, "yyyy-MM-dd");

  const [activities, result] = await Promise.all([
    getActiveActivitiesForCurrentUser(),
    getLogsRangePageForCurrentUser({ from, to }).catch(() => null),
  ]);

  const { logs, hasMore } = result ?? { logs: [], hasMore: false };
  const dayItems = buildDayRange(logs, from, to);

  return (
    <div className="px-4 pt-4 pb-6 max-w-lg mx-auto">
      <PageHeader title="ピーク" description="記録したピーク体験が、時系列で並びます" />
      <TimelineList initialItems={dayItems} oldestDate={oldestDate} hasMore={hasMore} />
      <HomeFab activities={activities} />
    </div>
  );
}
