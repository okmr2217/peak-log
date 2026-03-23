import { subDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

const TZ = "Asia/Tokyo";
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function formatDayShort(dateStr: string): string {
  return formatInTimeZone(new Date(dateStr), TZ, "M/d");
}

export function formatDayFull(dateStr: string): string {
  const d = new Date(dateStr);
  const dayOfWeek = new Date(formatInTimeZone(d, TZ, "yyyy-MM-dd")).getDay();
  return `${formatInTimeZone(d, TZ, "M/d")}（${WEEKDAYS[dayOfWeek]}）`;
}

export function buildDayRange<T extends { performedAt: Date }>(
  logs: T[],
  fromDate: Date,
  toDate: Date,
): Array<{ date: string; logs: T[] }> {
  const logsByDate = new Map<string, T[]>();
  for (const log of logs) {
    const date = formatInTimeZone(log.performedAt, TZ, "yyyy-MM-dd");
    const existing = logsByDate.get(date);
    if (existing) existing.push(log);
    else logsByDate.set(date, [log]);
  }

  const days: Array<{ date: string; logs: T[] }> = [];
  let current = subDays(toDate, 1);
  const from = fromDate;

  while (current >= from) {
    const dateStr = formatInTimeZone(current, TZ, "yyyy-MM-dd");
    days.push({ date: dateStr, logs: logsByDate.get(dateStr) ?? [] });
    current = subDays(current, 1);
  }

  return days;
}

export function formatDateHeader(date: Date): string {
  const todayJST = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
  const yesterdayJST = formatInTimeZone(subDays(new Date(), 1), TZ, "yyyy-MM-dd");
  const dateJST = formatInTimeZone(date, TZ, "yyyy-MM-dd");

  if (dateJST === todayJST) return "今日";
  if (dateJST === yesterdayJST) return "昨日";
  return formatInTimeZone(date, TZ, "yyyy/MM/dd");
}

export function formatTime(date: Date): string {
  return formatInTimeZone(date, TZ, "HH:mm");
}

export function formatPerformedAt(date: Date): string {
  return formatInTimeZone(date, TZ, "M/d HH:mm");
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const time = formatInTimeZone(date, TZ, "HH:mm");
  const monthDay = formatInTimeZone(date, TZ, "M月d日");

  if (diffSec < 60) return `${diffSec}秒前`;
  if (diffMin < 60) return `${diffMin}分前`;
  if (diffHour < 24) return `${diffHour}時間前（${time}）`;
  if (diffDay < 7) return `${diffDay}日前（${monthDay}）`;

  const nowYear = formatInTimeZone(now, TZ, "yyyy");
  const dateYear = formatInTimeZone(date, TZ, "yyyy");
  if (nowYear === dateYear) return `${monthDay}（${time}）`;
  return `${formatInTimeZone(date, TZ, "yyyy年M月d日")}（${time}）`;
}

/** `datetime-local` input の value 形式 ("YYYY-MM-DDTHH:mm") に変換する */
export function toDatetimeLocalString(date: Date): string {
  return formatInTimeZone(date, TZ, "yyyy-MM-dd'T'HH:mm");
}

export function groupLogsByDate<T extends { performedAt: Date }>(
  logs: T[],
): Array<{ dateLabel: string; logs: T[] }> {
  const groups: Map<string, T[]> = new Map();
  for (const log of logs) {
    const label = formatDateHeader(log.performedAt);
    const existing = groups.get(label);
    if (existing) existing.push(log);
    else groups.set(label, [log]);
  }
  return Array.from(groups.entries()).map(([dateLabel, groupLogs]) => ({
    dateLabel,
    logs: groupLogs,
  }));
}

/** JST の日付文字列 ("YYYY-MM-DD") を UTC の Date に変換する */
export function jstDateToUtc(dateStr: string): Date {
  return fromZonedTime(dateStr, TZ);
}
