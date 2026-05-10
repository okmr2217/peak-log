"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import type { ActivityFieldDTO } from "@/server/queries/activity";

const FIELD_SELECT = {
  id: true,
  name: true,
  type: true,
  options: true,
  sortOrder: true,
  isArchived: true,
} as const;

export async function getActivityFieldsForEdit(activityId: string): Promise<ActivityFieldDTO[]> {
  const userId = await requireUserId();
  const activity = await prisma.activity.findFirst({
    where: { id: activityId, userId },
    select: {
      fields: {
        orderBy: { sortOrder: "asc" },
        select: FIELD_SELECT,
      },
    },
  });
  return activity?.fields ?? [];
}
