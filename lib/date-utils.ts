import { differenceInCalendarDays, subDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

const TZ = "Asia/Tokyo";
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function formatLastPerformed(date: Date): string {
  const todayJST = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
  const dateJST = formatInTimeZone(date, TZ, "yyyy-MM-dd");
  const diffDays = differenceInCalendarDays(new Date(todayJST), new Date(dateJST));

  if (diffDays === 0) return "今日";
  if (diffDays === 1) return "昨日";
  if (diffDays < 7) return `${diffDays}日前`;
  return formatInTimeZone(date, TZ, "M/d");
}

export function formatDayFull(dateStr: string): string {
  const d = new Date(dateStr);
  const dayOfWeek = new Date(formatInTimeZone(d, TZ, "yyyy-MM-dd")).getDay();
  return `${formatInTimeZone(d, TZ, "M/d")}（${WEEKDAYS[dayOfWeek]}）`;
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

/**
 * 記録カード用のコンパクトな日時表示
 * - 60分以内: 「X分前」
 * - 今日: 「HH:mm」
 * - 昨日: 「昨日 HH:mm」
 * - 一昨日以前: 「M/d HH:mm」
 */
export function formatCompactTime(date: Date): string {
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMin < 60) return `${diffMin}分前`;

  const time = formatInTimeZone(date, TZ, "HH:mm");
  const todayJST = formatInTimeZone(now, TZ, "yyyy-MM-dd");
  const yesterdayJST = formatInTimeZone(subDays(now, 1), TZ, "yyyy-MM-dd");
  const dateJST = formatInTimeZone(date, TZ, "yyyy-MM-dd");

  if (dateJST === todayJST) return time;
  if (dateJST === yesterdayJST) return `昨日 ${time}`;
  return `${formatInTimeZone(date, TZ, "M/d")} ${time}`;
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

export function formatFullDateTime(date: Date): string {
  return formatInTimeZone(date, TZ, "yyyy/MM/dd HH:mm");
}

