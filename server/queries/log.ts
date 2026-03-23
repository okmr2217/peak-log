import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import type { Prisma } from "@prisma/client";
import { fromZonedTime } from "date-fns-tz";

const TZ = "Asia/Tokyo";

export type MonthlySummary = {
  month: string;
  totalLogs: number;
  reflectionCount: number;
  activityCount: number;
  topActivities: Array<{
    activityId: string;
    name: string;
    emoji: string | null;
    color: string | null;
    count: number;
  }>;
  peakLogs: Array<{
    id: string;
    performedAt: Date;
    activity: {
      id: string;
      name: string;
      emoji: string | null;
      color: string | null;
    };
    reflection: {
      excitement: number | null;
      achievement: number | null;
      wantAgain: boolean | null;
      note: string | null;
    } | null;
  }>;
};

export async function getMonthlySummaryForCurrentUser(month: string): Promise<MonthlySummary> {
  const userId = await requireUserId();

  const [yearStr, monthStr] = month.split("-");
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);
  const endYear = monthNum === 12 ? year + 1 : year;
  const endMonth = monthNum === 12 ? 1 : monthNum + 1;
  const start = fromZonedTime(`${yearStr}-${monthStr}-01`, TZ);
  const end = fromZonedTime(`${endYear}-${String(endMonth).padStart(2, "0")}-01`, TZ);

  const logs = await prisma.log.findMany({
    where: { userId, performedAt: { gte: start, lt: end } },
    include: {
      activity: { select: { id: true, name: true, emoji: true, color: true } },
      reflection: { select: { excitement: true, achievement: true, wantAgain: true, note: true } },
    },
    orderBy: [{ performedAt: "desc" }],
  });

  const totalLogs = logs.length;
  const reflectionCount = logs.filter((l) => l.reflection !== null).length;

  const activityMap = new Map<
    string,
    { activityId: string; name: string; emoji: string | null; color: string | null; count: number }
  >();
  for (const log of logs) {
    const a = log.activity;
    const existing = activityMap.get(a.id);
    if (existing) {
      existing.count++;
    } else {
      activityMap.set(a.id, { activityId: a.id, name: a.name, emoji: a.emoji, color: a.color, count: 1 });
    }
  }

  const topActivities = Array.from(activityMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const activityCount = activityMap.size;

  // Score each log: reflection presence > excitement > note > recency
  const scored = logs.map((log) => {
    const r = log.reflection;
    const hasReflection = r !== null ? 1000 : 0;
    const excitement = (r?.excitement ?? 0) * 100;
    const hasNote = r?.note ? 10 : 0;
    return { log, score: hasReflection + excitement + hasNote };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.log.performedAt.getTime() - a.log.performedAt.getTime();
  });

  const peakLogs = scored.slice(0, 3).map(({ log }) => ({
    id: log.id,
    performedAt: log.performedAt,
    activity: log.activity,
    reflection: log.reflection,
  }));

  return { month, totalLogs, reflectionCount, activityCount, topActivities, peakLogs };
}

export async function getLogsForCurrentUser(limit = 20) {
  const userId = await requireUserId();
  return prisma.log.findMany({
    where: { userId },
    include: { activity: true, reflection: true },
    orderBy: { performedAt: "desc" },
    take: limit,
  });
}

export const HISTORY_PAGE_SIZE = 20;

export type LogItem = {
  id: string;
  performedAt: Date;
  createdAt: Date;
  activity: {
    id: string;
    name: string;
    emoji: string | null;
    color: string | null;
  };
  reflection: {
    id: string;
    excitement: number | null;
    achievement: number | null;
    wantAgain: boolean | null;
    note: string | null;
  } | null;
};

export type LogsPage = {
  items: LogItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type LogsPageParams = {
  limit?: number;
  cursor?: string;
  q?: string;
  from?: string;
  to?: string;
};

export async function getLogsPageForCurrentUser({
  limit = HISTORY_PAGE_SIZE,
  cursor,
  q,
  from,
  to,
}: LogsPageParams = {}): Promise<LogsPage> {
  const userId = await requireUserId();

  const where: Prisma.LogWhereInput = { userId };

  if (from || to) {
    where.performedAt = {
      ...(from ? { gte: fromZonedTime(from, TZ) } : {}),
      ...(to ? { lte: fromZonedTime(`${to}T23:59:59.999`, TZ) } : {}),
    };
  }

  const trimmedQ = q?.trim();
  if (trimmedQ) {
    where.OR = [
      { activity: { name: { contains: trimmedQ, mode: "insensitive" } } },
      { reflection: { note: { contains: trimmedQ, mode: "insensitive" } } },
    ];
  }

  const rows = await prisma.log.findMany({
    where,
    include: {
      activity: { select: { id: true, name: true, emoji: true, color: true } },
      reflection: { select: { id: true, excitement: true, achievement: true, wantAgain: true, note: true } },
    },
    orderBy: [{ performedAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor, hasMore };
}

export type HistoryDayItem = {
  date: string; // YYYY-MM-DD
  logs: LogItem[];
};

export async function getLogsRangePageForCurrentUser({
  from,
  to,
}: {
  from: Date;
  to: Date;
}): Promise<{ logs: LogItem[]; hasMore: boolean }> {
  const userId = await requireUserId();

  const [logs, olderLog] = await Promise.all([
    prisma.log.findMany({
      where: { userId, performedAt: { gte: from, lt: to } },
      include: {
        activity: { select: { id: true, name: true, emoji: true, color: true } },
        reflection: { select: { id: true, excitement: true, achievement: true, wantAgain: true, note: true } },
      },
      orderBy: [{ performedAt: "asc" }],
    }),
    prisma.log.findFirst({
      where: { userId, performedAt: { lt: from } },
      select: { id: true },
    }),
  ]);

  return { logs, hasMore: olderLog !== null };
}

export async function getMonthlyLogsForCurrentUser(month: string): Promise<LogItem[]> {
  const userId = await requireUserId();

  const [yearStr, monthStr] = month.split("-");
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);
  const endYear = monthNum === 12 ? year + 1 : year;
  const endMonth = monthNum === 12 ? 1 : monthNum + 1;
  const start = fromZonedTime(`${yearStr}-${monthStr}-01`, TZ);
  const end = fromZonedTime(`${endYear}-${String(endMonth).padStart(2, "0")}-01`, TZ);

  return prisma.log.findMany({
    where: { userId, performedAt: { gte: start, lt: end } },
    include: {
      activity: { select: { id: true, name: true, emoji: true, color: true } },
      reflection: { select: { id: true, excitement: true, achievement: true, wantAgain: true, note: true } },
    },
    orderBy: [{ performedAt: "desc" }, { id: "desc" }],
  });
}

export async function getLogById(id: string) {
  const userId = await requireUserId();
  return prisma.log.findFirst({
    where: { id, userId },
    include: { activity: true, reflection: true },
  });
}
