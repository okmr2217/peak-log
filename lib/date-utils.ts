import dayjs from "dayjs";

export function formatDayShort(dateStr: string): string {
  return dayjs(dateStr).format("M/D");
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function formatDayFull(dateStr: string): string {
  const d = dayjs(dateStr);
  return `${d.format("M/D")}（${WEEKDAYS[d.day()]}）`;
}

/**
 * 指定した日付範囲（from 以上、to 未満）のすべての日を生成し、
 * 各日に対応するログを割り当てる。新しい日付から順に並ぶ。
 */
export function buildDayRange<T extends { performedAt: Date }>(
  logs: T[],
  fromDate: Date,
  toDate: Date,
): Array<{ date: string; logs: T[] }> {
  const logsByDate = new Map<string, T[]>();
  for (const log of logs) {
    const date = dayjs(log.performedAt).format("YYYY-MM-DD");
    const existing = logsByDate.get(date);
    if (existing) existing.push(log);
    else logsByDate.set(date, [log]);
  }

  const days: Array<{ date: string; logs: T[] }> = [];
  let current = dayjs(toDate).subtract(1, "day").startOf("day");
  const from = dayjs(fromDate).startOf("day");

  while (current.isSame(from, "day") || current.isAfter(from, "day")) {
    const dateStr = current.format("YYYY-MM-DD");
    days.push({ date: dateStr, logs: logsByDate.get(dateStr) ?? [] });
    current = current.subtract(1, "day");
  }

  return days;
}

export function formatDateHeader(date: Date): string {
  const d = dayjs(date);
  const today = dayjs().startOf("day");
  const yesterday = today.subtract(1, "day");

  if (d.isSame(today, "day")) return "今日";
  if (d.isSame(yesterday, "day")) return "昨日";
  return d.format("YYYY/MM/DD");
}

export function formatTime(date: Date): string {
  return dayjs(date).format("HH:mm");
}

export function formatPerformedAt(date: Date): string {
  return dayjs(date).format("M/D HH:mm");
}

/** `datetime-local` input の value 形式 ("YYYY-MM-DDTHH:mm") に変換する */
export function toDatetimeLocalString(date: Date): string {
  return dayjs(date).format("YYYY-MM-DDTHH:mm");
}

export function groupLogsByDate<T extends { performedAt: Date }>(
  logs: T[],
): Array<{ dateLabel: string; logs: T[] }> {
  const groups: Map<string, T[]> = new Map();

  for (const log of logs) {
    const label = formatDateHeader(log.performedAt);
    const existing = groups.get(label);
    if (existing) {
      existing.push(log);
    } else {
      groups.set(label, [log]);
    }
  }

  return Array.from(groups.entries()).map(([dateLabel, groupLogs]) => ({
    dateLabel,
    logs: groupLogs,
  }));
}
