import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function getLogsForCurrentUser(limit = 20) {
  const userId = await requireUserId();
  return prisma.log.findMany({
    where: { userId },
    include: { activity: true, reflection: true },
    orderBy: { performedAt: "desc" },
    take: limit,
  });
}

export async function getLogById(id: string) {
  const userId = await requireUserId();
  return prisma.log.findFirst({
    where: { id, userId },
    include: { activity: true, reflection: true },
  });
}
