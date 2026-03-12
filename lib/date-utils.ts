import dayjs from "dayjs";

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
