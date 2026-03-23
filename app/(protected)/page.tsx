import { addDays, subDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { getActiveActivitiesForCurrentUser } from "@/server/queries/activity";
import { getLogsRangePageForCurrentUser, getLogsSearchForCurrentUser } from "@/server/queries/log";
import type { LogItem, HistoryDayItem } from "@/server/queries/log";
import { buildDayRange } from "@/lib/date-utils";
import { HomeFab } from "@/components/log/home-fab";
import { HomeContent } from "@/components/home/home-content";

const RANGE_DAYS = 30;
const TZ = "Asia/Tokyo";

function groupToHistoryDays(logs: LogItem[]): HistoryDayItem[] {
  const map = new Map<string, LogItem[]>();
  for (const log of logs) {
    const date = formatInTimeZone(log.performedAt, TZ, "yyyy-MM-dd");
    const arr = map.get(date);
    if (arr) arr.push(log);
    else map.set(date, [log]);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, dayLogs]) => ({ date, logs: dayLogs }));
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ activityId?: string; note?: string }> }) {
  const { activityId, note } = await searchParams;
  const hasFilters = !!(activityId || note);

  const todayJST = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
  const todayStart = fromZonedTime(todayJST, TZ);
  const to = addDays(todayStart, 1);
  const from = subDays(todayStart, RANGE_DAYS - 1);
  const oldestDate = formatInTimeZone(from, TZ, "yyyy-MM-dd");

  const activities = await getActiveActivitiesForCurrentUser();

  let dayItems: HistoryDayItem[];
  let hasMore = false;

  if (hasFilters) {
    const logs = await getLogsSearchForCurrentUser({
      activityId: activityId || undefined,
      noteKeyword: note || undefined,
    });
    dayItems = groupToHistoryDays(logs);
  } else {
    const result = await getLogsRangePageForCurrentUser({ from, to }).catch(() => null);
    const { logs, hasMore: _hasMore } = result ?? { logs: [], hasMore: false };
    dayItems = buildDayRange(logs, from, to);
    hasMore = _hasMore;
  }

  return (
    <div>
      <HomeContent
        activities={activities}
        dayItems={dayItems}
        oldestDate={oldestDate}
        hasMore={hasMore}
        selectedActivityId={activityId ?? null}
        noteKeyword={note ?? ""}
      />
      <HomeFab activities={activities} defaultActivityId={activityId ?? null} />
    </div>
  );
}
