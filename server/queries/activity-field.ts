"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import type { ActivityFieldDTO } from "@/server/queries/activity";
import { ACTIVITY_FIELD_SELECT } from "@/server/queries/activity";

export async function getActivityLogCount(activityId: string): Promise<number> {
  const userId = await requireUserId();
  return prisma.log.count({ where: { activityId, userId } });
}

export async function getActivityFieldsForEdit(activityId: string): Promise<ActivityFieldDTO[]> {
  const userId = await requireUserId();
  const activity = await prisma.activity.findFirst({
    where: { id: activityId, userId },
    select: {
      fields: {
        orderBy: { sortOrder: "asc" },
        select: ACTIVITY_FIELD_SELECT,
      },
    },
  });
  return activity?.fields ?? [];
}
