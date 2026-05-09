import { addDays, subDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { getActiveActivitiesForCurrentUser } from "@/server/queries/activity";
import { getLogsSearchForCurrentUser } from "@/server/queries/log";
import type { LogItem, HistoryDayItem } from "@/server/queries/log";
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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ activityId?: string; note?: string; tab?: string; from?: string; to?: string }>;
}) {
  const { activityId, note, tab, from: fromParam, to: toParam } = await searchParams;
  const currentTab = tab === "compact" ? "compact" : "detail";

  const todayJST = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
  const todayStart = fromZonedTime(todayJST, TZ);
  const defaultFromStr = formatInTimeZone(subDays(todayStart, RANGE_DAYS - 1), TZ, "yyyy-MM-dd");
  const defaultToStr = todayJST;

  const fromStr = fromParam ?? defaultFromStr;
  const toStr = toParam ?? defaultToStr;

  const fromDate = fromZonedTime(fromStr, TZ);
  const toDate = addDays(fromZonedTime(toStr, TZ), 1);

  const activities = await getActiveActivitiesForCurrentUser();
  const { logs, hasMore } = await getLogsSearchForCurrentUser({
    activityId: activityId || undefined,
    noteKeyword: note || undefined,
    fromDate,
    toDate,
  });

  const dayItems = groupToHistoryDays(logs);

  return (
    <HomeContent
      activities={activities}
      dayItems={dayItems}
      hasMore={hasMore}
      fromDate={fromStr}
      toDate={toStr}
      defaultFromDate={defaultFromStr}
      defaultToDate={defaultToStr}
      selectedActivityId={activityId ?? null}
      noteKeyword={note ?? ""}
      currentTab={currentTab}
    />
  );
}
