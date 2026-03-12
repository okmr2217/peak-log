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
