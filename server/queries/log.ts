import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

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

export async function getLogsSearchForCurrentUser({
  activityId,
  noteKeyword,
}: {
  activityId?: string;
  noteKeyword?: string;
}): Promise<LogItem[]> {
  const userId = await requireUserId();

  return prisma.log.findMany({
    where: {
      userId,
      ...(activityId ? { activityId } : {}),
      ...(noteKeyword ? { reflection: { note: { contains: noteKeyword, mode: "insensitive" } } } : {}),
    },
    include: {
      activity: { select: { id: true, name: true, emoji: true, color: true } },
      reflection: { select: { id: true, excitement: true, achievement: true, wantAgain: true, note: true } },
    },
    orderBy: [{ performedAt: "asc" }],
  });
}

export type PeriodPreset = "thisMonth" | "3months" | "thisYear" | "all";

export type ActivityCategoryStat = {
  activityId: string;
  name: string;
  emoji: string | null;
  color: string | null;
  logCount: number;
  distinctDays: number;
  weeklyAvg: number;
  lastPerformedAt: Date | null;
};

export async function getCategoryStatsForCurrentUser(period: PeriodPreset): Promise<ActivityCategoryStat[]> {
  const userId = await requireUserId();
  const now = new Date();

  let periodStart: Date | null = null;
  if (period === "thisMonth") {
    const ym = formatInTimeZone(now, TZ, "yyyy-MM");
    periodStart = fromZonedTime(`${ym}-01`, TZ);
  } else if (period === "3months") {
    periodStart = new Date(now.getTime() - 90 * 24 * 3600 * 1000);
  } else if (period === "thisYear") {
    const y = formatInTimeZone(now, TZ, "yyyy");
    periodStart = fromZonedTime(`${y}-01-01`, TZ);
  }

  const periodDays = periodStart ? (now.getTime() - periodStart.getTime()) / (24 * 3600 * 1000) : null;

  const logs = await prisma.log.findMany({
    where: {
      userId,
      performedAt: periodStart ? { gte: periodStart, lte: now } : { lte: now },
    },
    select: {
      activityId: true,
      performedAt: true,
      activity: { select: { id: true, name: true, emoji: true, color: true } },
    },
    orderBy: { performedAt: "desc" },
  });

  type ActData = {
    activity: { id: string; name: string; emoji: string | null; color: string | null };
    dates: Set<string>;
    firstPerformedAt: Date;
    lastPerformedAt: Date;
    logCount: number;
  };

  const activityMap = new Map<string, ActData>();

  for (const log of logs) {
    const dateStr = formatInTimeZone(log.performedAt, TZ, "yyyy-MM-dd");
    const existing = activityMap.get(log.activityId);
    if (existing) {
      existing.dates.add(dateStr);
      existing.logCount++;
      existing.firstPerformedAt = log.performedAt; // desc順なので更新し続けると最古になる
    } else {
      activityMap.set(log.activityId, {
        activity: log.activity,
        dates: new Set([dateStr]),
        firstPerformedAt: log.performedAt,
        lastPerformedAt: log.performedAt, // desc順の初回 = 最新
        logCount: 1,
      });
    }
  }

  return Array.from(activityMap.values())
    .sort((a, b) => b.logCount - a.logCount)
    .map((data) => {
      const weeks =
        periodDays != null
          ? Math.max(periodDays / 7, 1 / 7)
          : Math.max((now.getTime() - data.firstPerformedAt.getTime()) / (7 * 24 * 3600 * 1000), 1 / 7);

      return {
        activityId: data.activity.id,
        name: data.activity.name,
        emoji: data.activity.emoji,
        color: data.activity.color,
        logCount: data.logCount,
        distinctDays: data.dates.size,
        weeklyAvg: data.logCount / weeks,
        lastPerformedAt: data.lastPerformedAt,
      };
    });
}

export async function getLogById(id: string) {
  const userId = await requireUserId();
  return prisma.log.findFirst({
    where: { id, userId },
    include: { activity: true, reflection: true },
  });
}
