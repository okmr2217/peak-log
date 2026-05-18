import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import type { FieldType } from "@prisma/client";

export type ActivityFieldDTO = {
  id: string;
  name: string;
  type: FieldType;
  options: string[];
  sortOrder: number;
  isArchived: boolean;
};

export type ActivityFieldForLog = {
  id: string;
  name: string;
  type: FieldType;
  options: string[];
};

export type ActivityForLog = {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  fields: ActivityFieldForLog[];
};

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
      fields: {
        where: { isArchived: false },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          type: true,
          options: true,
          isArchived: true,
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export const ACTIVITY_FIELD_SELECT = {
  id: true,
  name: true,
  type: true,
  options: true,
  sortOrder: true,
  isArchived: true,
} as const;

export type ActivityWithStats = {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  description: string | null;
  sortOrder: number;
  isArchived: boolean;
  createdAt: Date;
};

export async function getActivitiesWithStatsForCurrentUser(): Promise<ActivityWithStats[]> {
  const userId = await requireUserId();

  return prisma.activity.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      emoji: true,
      color: true,
      description: true,
      sortOrder: true,
      isArchived: true,
      createdAt: true,
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getActivityForEdit(activityId: string) {
  const userId = await requireUserId();
  return prisma.activity.findFirst({
    where: { id: activityId, userId },
    select: { id: true, name: true, emoji: true, color: true, description: true },
  });
}

export type RecentLog = {
  id: string;
  performedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  stars: number | null;
  note: string | null;
  fieldValues: Record<string, string | string[]> | null;
};

export type ActivityDetail = {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  isArchived: boolean;
  fields: ActivityFieldDTO[];
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
      include: {
        fields: {
          orderBy: { sortOrder: "asc" },
          select: ACTIVITY_FIELD_SELECT,
        },
      },
    }),
    prisma.log.findMany({
      where: { userId, activityId, performedAt: { lte: now } },
      select: {
        id: true,
        performedAt: true,
        createdAt: true,
        updatedAt: true,
        stars: true,
        note: true,
        fieldValues: true,
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
  const recentLogs = logs
    .slice(-30)
    .reverse()
    .map((log) => ({
      ...log,
      fieldValues: log.fieldValues as Record<string, string | string[]> | null,
    }));

  return {
    id: activity.id,
    name: activity.name,
    emoji: activity.emoji,
    color: activity.color,
    isArchived: activity.isArchived,
    fields: activity.fields,
    stats: { totalCount, lastPerformedAt, avgIntervalDays },
    recentLogs,
  };
}
