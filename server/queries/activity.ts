import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function getActivitiesForCurrentUser() {
  const userId = await requireUserId();
  return prisma.activity.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      emoji: true,
      color: true,
      sortOrder: true,
      isArchived: true,
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getActiveActivitiesForCurrentUser() {
  const userId = await requireUserId();
  return prisma.activity.findMany({
    where: { userId, isArchived: false },
    select: {
      id: true,
      name: true,
      emoji: true,
      color: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getActivityById(id: string) {
  const userId = await requireUserId();
  return prisma.activity.findFirst({
    where: { id, userId },
  });
}

export type ActivityStats = {
  totalCount: number;
  lastPerformedAt: Date | null;
};

export type ActivityWithStats = {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  description: string | null;
  sortOrder: number;
  isArchived: boolean;
  stats: ActivityStats;
};

export async function getActivitiesWithStatsForCurrentUser(): Promise<ActivityWithStats[]> {
  const userId = await requireUserId();
  const now = new Date();

  const [activities, logStats] = await Promise.all([
    prisma.activity.findMany({
      where: { userId },
      select: { id: true, name: true, emoji: true, color: true, description: true, sortOrder: true, isArchived: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.log.groupBy({
      by: ["activityId"],
      where: { userId, performedAt: { lte: now } },
      _count: { id: true },
      _max: { performedAt: true },
    }),
  ]);

  const statsMap = new Map(
    logStats.map((s) => [
      s.activityId,
      { totalCount: s._count.id, lastPerformedAt: s._max.performedAt },
    ]),
  );

  return activities.map((a) => ({
    ...a,
    stats: statsMap.get(a.id) ?? { totalCount: 0, lastPerformedAt: null },
  }));
}

export type RecentLog = {
  id: string;
  performedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  reflection: {
    id: string;
    stars: number | null;
    note: string | null;
  } | null;
};

export type ActivityDetail = {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  isArchived: boolean;
  stats: {
    totalCount: number;
    lastPerformedAt: Date | null;
    avgIntervalDays: number | null;
  };
  recentLogs: RecentLog[];
};

export async function getActivityDetailForCurrentUser(activityId: string): Promise<ActivityDetail | null> {
  const userId = await requireUserId();
  const now = new Date();

  const [activity, logs] = await Promise.all([
    prisma.activity.findFirst({
      where: { id: activityId, userId },
    }),
    prisma.log.findMany({
      where: { userId, activityId, performedAt: { lte: now } },
      select: {
        id: true,
        performedAt: true,
        createdAt: true,
        updatedAt: true,
        reflection: { select: { id: true, stars: true, note: true } },
      },
      orderBy: { performedAt: "asc" },
    }),
  ]);

  if (!activity) return null;

  const totalCount = logs.length;
  const lastPerformedAt = totalCount > 0 ? logs[logs.length - 1].performedAt : null;

  let avgIntervalDays: number | null = null;
  if (totalCount >= 2) {
    let totalMs = 0;
    for (let i = 1; i < logs.length; i++) {
      totalMs += logs[i].performedAt.getTime() - logs[i - 1].performedAt.getTime();
    }
    avgIntervalDays = totalMs / (logs.length - 1) / (1000 * 60 * 60 * 24);
  }

  // 最新30件（新しい順）
  const recentLogs = logs.slice(-30).reverse();

  return {
    id: activity.id,
    name: activity.name,
    emoji: activity.emoji,
    color: activity.color,
    isArchived: activity.isArchived,
    stats: { totalCount, lastPerformedAt, avgIntervalDays },
    recentLogs,
  };
}
