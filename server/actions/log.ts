"use server";

import { revalidatePath } from "next/cache";
import { subDays } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { type ActionResult, ok, fail } from "@/lib/action-result";
import { toActionMessage } from "@/lib/app-error";
import {
  createLogSchema,
  deleteLogSchema,
  updateLogPerformedAtSchema,
  type CreateLogInput,
  type UpdateLogPerformedAtInput,
} from "@/server/validators/log";
import { getLogsRangePageForCurrentUser, type LogItem } from "@/server/queries/log";

export async function createLog(input: CreateLogInput): Promise<ActionResult<{ logId: string }>> {
  const parsed = createLogSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "入力内容を確認してください");
  }

  try {
    const userId = await requireUserId();

    const activity = await prisma.activity.findFirst({
      where: { id: parsed.data.activityId, userId },
    });
    if (!activity) {
      return fail("アクティビティが見つかりません");
    }

    const log = await prisma.log.create({
      data: {
        userId,
        activityId: parsed.data.activityId,
        performedAt: parsed.data.performedAt ?? new Date(),
      },
    });
    revalidatePath("/");

    return ok({ logId: log.id });
  } catch (e) {
    return fail(toActionMessage(e, "記録できませんでした"));
  }
}

export async function deleteLog(id: string): Promise<ActionResult> {
  const parsed = deleteLogSchema.safeParse({ id });
  if (!parsed.success) {
    return fail("無効なIDです");
  }

  try {
    const userId = await requireUserId();
    await prisma.log.deleteMany({
      where: { id: parsed.data.id, userId },
    });
    revalidatePath("/");

    return ok();
  } catch (e) {
    return fail(toActionMessage(e, "削除できませんでした"));
  }
}

export async function fetchMoreDays({ before }: { before: string }): Promise<{ logs: LogItem[]; hasMore: boolean }> {
  const TZ = "Asia/Tokyo";
  const to = fromZonedTime(before, TZ);
  const from = subDays(to, 30);
  return getLogsRangePageForCurrentUser({ from, to });
}

export async function updateLogPerformedAt(input: UpdateLogPerformedAtInput): Promise<ActionResult> {
  const parsed = updateLogPerformedAtSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "正しい日時を入力してください");
  }

  try {
    const userId = await requireUserId();

    const existing = await prisma.log.findFirst({
      where: { id: parsed.data.logId, userId },
      select: { id: true },
    });
    if (!existing) {
      return fail("記録が見つかりません");
    }

    await prisma.log.update({
      where: { id: parsed.data.logId },
      data: { performedAt: parsed.data.performedAt },
    });

    revalidatePath("/");

    return ok();
  } catch (e) {
    return fail(toActionMessage(e, "更新できませんでした"));
  }
}
