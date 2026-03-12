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

export async function getLogsPageForCurrentUser({
  limit = HISTORY_PAGE_SIZE,
  cursor,
}: { limit?: number; cursor?: string } = {}): Promise<LogsPage> {
  const userId = await requireUserId();

  const rows = await prisma.log.findMany({
    where: { userId },
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

export async function getLogById(id: string) {
  const userId = await requireUserId();
  return prisma.log.findFirst({
    where: { id, userId },
    include: { activity: true, reflection: true },
  });
}
