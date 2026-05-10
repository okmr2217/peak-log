import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { parseISO, subDays, format, addDays } from "date-fns";
import type { FieldType } from "@prisma/client";

const TZ = "Asia/Tokyo";

export type LogEditedPayload = {
  newDate: Date;
  stars: number | null;
  note: string | null;
  fieldValues: Record<string, string | string[]> | null;
};

export type MonthlySummary = {
  month: string;
  totalLogs: number;
  activeDays: number;
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
    stars: number | null;
    note: string | null;
    activity: {
      id: string;
      name: string;
      emoji: string | null;
      color: string | null;
    };
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
    select: {
      id: true,
      performedAt: true,
      stars: true,
      note: true,
      activity: { select: { id: true, name: true, emoji: true, color: true } },
    },
    orderBy: [{ performedAt: "desc" }],
  });

  const totalLogs = logs.length;
  const activeDays = new Set(logs.map((l) => formatInTimeZone(l.performedAt, TZ, "yyyy-MM-dd"))).size;

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

  // Score each log: stars/note presence > excitement > note > recency
  const scored = logs.map((log) => {
    const hasData = log.stars != null || log.note != null ? 1000 : 0;
    const excitement = (log.stars ?? 0) * 100;
    const hasNote = log.note ? 10 : 0;
    return { log, score: hasData + excitement + hasNote };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.log.performedAt.getTime() - a.log.performedAt.getTime();
  });

  const peakLogs = scored.slice(0, 3).map(({ log }) => ({
    id: log.id,
    performedAt: log.performedAt,
    stars: log.stars,
    note: log.note,
    activity: log.activity,
  }));

  return { month, totalLogs, activeDays, activityCount, topActivities, peakLogs };
}

export type LogItem = {
  id: string;
  performedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  stars: number | null;
  note: string | null;
  fieldValues: Record<string, string | string[]> | null;
  activity: {
    id: string;
    name: string;
    emoji: string | null;
    color: string | null;
    fields: { id: string; name: string; type: FieldType; options: string[] }[];
  };
};

export type HistoryDayItem = {
  date: string; // YYYY-MM-DD
  logs: LogItem[];
};

const ACTIVITY_FIELDS_SELECT = {
  where: { isArchived: false },
  orderBy: { sortOrder: "asc" as const },
  select: { id: true, name: true, type: true, options: true },
} as const;

export async function getLogsSearchForCurrentUser({
  activityId,
  noteKeyword,
  fromDate,
  toDate,
}: {
  activityId?: string;
  noteKeyword?: string;
  fromDate: Date;
  toDate: Date;
}): Promise<{ logs: LogItem[]; hasMore: boolean }> {
  const userId = await requireUserId();

  const [rawLogs, olderLog] = await Promise.all([
    prisma.log.findMany({
      where: {
        userId,
        performedAt: { gte: fromDate, lt: toDate },
        ...(activityId ? { activityId } : {}),
        ...(noteKeyword ? { note: { contains: noteKeyword, mode: "insensitive" } } : {}),
      },
      select: {
        id: true,
        performedAt: true,
        createdAt: true,
        updatedAt: true,
        stars: true,
        note: true,
        fieldValues: true,
        activity: { select: { id: true, name: true, emoji: true, color: true, fields: ACTIVITY_FIELDS_SELECT } },
      },
      orderBy: [{ performedAt: "asc" }],
    }),
    prisma.log.findFirst({
      where: {
        userId,
        performedAt: { lt: fromDate },
        ...(activityId ? { activityId } : {}),
        ...(noteKeyword ? { note: { contains: noteKeyword, mode: "insensitive" } } : {}),
      },
      select: { id: true },
    }),
  ]);

  const logs: LogItem[] = rawLogs.map((log) => ({ ...log, fieldValues: log.fieldValues as LogItem["fieldValues"] }));
  return { logs, hasMore: olderLog !== null };
}

export type PeriodPreset = "thisMonth" | "3months" | "thisYear" | "all";

function calcStreak(dateSet: Set<string>, todayStr: string): number {
  if (dateSet.size === 0) return 0;
  let current = parseISO(todayStr);
  if (!dateSet.has(todayStr)) {
    current = subDays(current, 1);
    if (!dateSet.has(format(current, "yyyy-MM-dd"))) return 0;
  }
  let streak = 0;
  while (dateSet.has(format(current, "yyyy-MM-dd"))) {
    streak++;
    current = subDays(current, 1);
  }
  return streak;
}

export type ActivityListStat = {
  activityId: string;
  name: string;
  emoji: string | null;
  color: string | null;
  logCount: number;
  streak: number;
  weeklyAvg: number;
  lastPerformedAt: Date | null;
};

export async function getActivityListStatsForCurrentUser(period: PeriodPreset): Promise<ActivityListStat[]> {
  const userId = await requireUserId();
  const now = new Date();
  const todayStr = formatInTimeZone(now, TZ, "yyyy-MM-dd");

  const allLogs = await prisma.log.findMany({
    where: { userId, activity: { isArchived: false } },
    select: {
      activityId: true,
      performedAt: true,
      activity: { select: { id: true, name: true, emoji: true, color: true } },
    },
    orderBy: { performedAt: "asc" },
  });

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

  type ActData = {
    activity: { id: string; name: string; emoji: string | null; color: string | null };
    allDates: Set<string>;
    firstAllTime: Date;
    lastAllTime: Date;
    periodCount: number;
  };

  const activityMap = new Map<string, ActData>();

  for (const log of allLogs) {
    const dateStr = formatInTimeZone(log.performedAt, TZ, "yyyy-MM-dd");
    const inPeriod = !periodStart || log.performedAt >= periodStart;
    const existing = activityMap.get(log.activityId);
    if (existing) {
      existing.allDates.add(dateStr);
      if (inPeriod) existing.periodCount++;
      existing.lastAllTime = log.performedAt;
    } else {
      activityMap.set(log.activityId, {
        activity: log.activity,
        allDates: new Set([dateStr]),
        firstAllTime: log.performedAt,
        lastAllTime: log.performedAt,
        periodCount: inPeriod ? 1 : 0,
      });
    }
  }

  return Array.from(activityMap.values())
    .filter((data) => data.periodCount > 0)
    .sort((a, b) => b.periodCount - a.periodCount)
    .map((data) => {
      const streak = calcStreak(data.allDates, todayStr);
      const weeks =
        periodDays != null
          ? Math.max(periodDays / 7, 1 / 7)
          : Math.max((now.getTime() - data.firstAllTime.getTime()) / (7 * 24 * 3600 * 1000), 1 / 7);
      return {
        activityId: data.activity.id,
        name: data.activity.name,
        emoji: data.activity.emoji,
        color: data.activity.color,
        logCount: data.periodCount,
        streak,
        weeklyAvg: data.periodCount / weeks,
        lastPerformedAt: data.lastAllTime,
      };
    });
}

export type DailyCount = {
  date: string;
  count: number;
};

export type FieldDistribution = {
  fieldId: string;
  fieldName: string;
  type: "SELECT" | "MULTI_SELECT" | "TEXT" | "TEXTAREA";
  distribution: { label: string; count: number }[];
};

export type ActivityStatDetail = {
  activity: { id: string; name: string; emoji: string | null; color: string | null };
  period: PeriodPreset;
  streak: number;
  totalCount: number;
  distinctDays: number;
  weeklyAvg: number;
  avgIntervalDays: number | null;
  maxPerDay: number;
  lastPerformedAt: Date | null;
  dailyData: DailyCount[];
  fieldStats: FieldDistribution[];
};

function generateDailyRange(startStr: string, endStr: string, dateCounts: Map<string, number>): DailyCount[] {
  const result: DailyCount[] = [];
  let current = parseISO(startStr);
  const end = parseISO(endStr);
  while (current <= end) {
    const dateStr = format(current, "yyyy-MM-dd");
    result.push({ date: dateStr, count: dateCounts.get(dateStr) ?? 0 });
    current = addDays(current, 1);
  }
  return result;
}

function calcFieldStats(
  fields: { id: string; name: string; type: FieldType; options: string[] }[],
  logs: { fieldValues: unknown }[]
): FieldDistribution[] {
  const result: FieldDistribution[] = [];
  for (const field of fields) {
    const countMap = new Map<string, number>(
      field.type === "SELECT" || field.type === "MULTI_SELECT" ? field.options.map((o) => [o, 0]) : []
    );
    for (const log of logs) {
      const values = log.fieldValues as Record<string, string | string[]> | null;
      if (!values) continue;
      const val = values[field.id];
      if (!val) continue;
      if (field.type === "SELECT" && typeof val === "string") {
        if (countMap.has(val)) countMap.set(val, (countMap.get(val) ?? 0) + 1);
      } else if (field.type === "MULTI_SELECT" && Array.isArray(val)) {
        for (const v of val) {
          if (countMap.has(v)) countMap.set(v, (countMap.get(v) ?? 0) + 1);
        }
      } else if ((field.type === "TEXT" || field.type === "TEXTAREA") && typeof val === "string") {
        const trimmed = val.trim();
        if (trimmed) countMap.set(trimmed, (countMap.get(trimmed) ?? 0) + 1);
      }
    }
    const distribution = Array.from(countMap.entries())
      .filter(([, count]) => count > 0)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    if (distribution.length > 0) {
      result.push({ fieldId: field.id, fieldName: field.name, type: field.type as FieldDistribution["type"], distribution });
    }
  }
  return result;
}

export async function getActivityStatDetailForCurrentUser(
  activityId: string,
  period: PeriodPreset
): Promise<ActivityStatDetail | null> {
  const userId = await requireUserId();
  const now = new Date();
  const todayStr = formatInTimeZone(now, TZ, "yyyy-MM-dd");

  const [activity, allLogs] = await Promise.all([
    prisma.activity.findFirst({
      where: { id: activityId, userId },
      include: {
        fields: {
          where: { isArchived: false },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, type: true, options: true },
        },
      },
    }),
    prisma.log.findMany({
      where: { userId, activityId },
      select: { performedAt: true, fieldValues: true },
      orderBy: { performedAt: "asc" },
    }),
  ]);

  if (!activity) return null;

  const allDates = new Set(allLogs.map((l) => formatInTimeZone(l.performedAt, TZ, "yyyy-MM-dd")));
  const streak = calcStreak(allDates, todayStr);
  const lastPerformedAt = allLogs.length > 0 ? allLogs[allLogs.length - 1].performedAt : null;

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

  const periodLogs = periodStart ? allLogs.filter((l) => l.performedAt >= periodStart!) : allLogs;
  const totalCount = periodLogs.length;

  if (totalCount === 0) {
    return {
      activity: { id: activity.id, name: activity.name, emoji: activity.emoji, color: activity.color },
      period,
      streak,
      totalCount: 0,
      distinctDays: 0,
      weeklyAvg: 0,
      avgIntervalDays: null,
      maxPerDay: 0,
      lastPerformedAt,
      dailyData: [],
      fieldStats: [],
    };
  }

  const dateCounts = new Map<string, number>();
  for (const log of periodLogs) {
    const dateStr = formatInTimeZone(log.performedAt, TZ, "yyyy-MM-dd");
    dateCounts.set(dateStr, (dateCounts.get(dateStr) ?? 0) + 1);
  }

  const distinctDays = dateCounts.size;
  const maxPerDay = Math.max(...dateCounts.values());
  const periodDays = periodStart
    ? (now.getTime() - periodStart.getTime()) / (24 * 3600 * 1000)
    : (now.getTime() - periodLogs[0].performedAt.getTime()) / (24 * 3600 * 1000);
  const weeklyAvg = totalCount / Math.max(periodDays / 7, 1 / 7);

  let avgIntervalDays: number | null = null;
  if (periodLogs.length >= 2) {
    let totalMs = 0;
    for (let i = 1; i < periodLogs.length; i++) {
      totalMs += periodLogs[i].performedAt.getTime() - periodLogs[i - 1].performedAt.getTime();
    }
    avgIntervalDays = totalMs / (periodLogs.length - 1) / (1000 * 60 * 60 * 24);
  }

  const graphStartStr = periodStart
    ? formatInTimeZone(periodStart, TZ, "yyyy-MM-dd")
    : formatInTimeZone(periodLogs[0].performedAt, TZ, "yyyy-MM-dd");
  const maxStartStr = format(subDays(parseISO(todayStr), 364), "yyyy-MM-dd");
  const effectiveStartStr = graphStartStr > maxStartStr ? graphStartStr : maxStartStr;

  const dailyData = generateDailyRange(effectiveStartStr, todayStr, dateCounts);
  const fieldStats = calcFieldStats(activity.fields, periodLogs);

  return {
    activity: { id: activity.id, name: activity.name, emoji: activity.emoji, color: activity.color },
    period,
    streak,
    totalCount,
    distinctDays,
    weeklyAvg,
    avgIntervalDays,
    maxPerDay,
    lastPerformedAt,
    dailyData,
    fieldStats,
  };
}

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

