import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function getReflectionByLogId(logId: string) {
  const userId = await requireUserId();
  return prisma.reflection.findFirst({
    where: { logId, userId },
  });
}
