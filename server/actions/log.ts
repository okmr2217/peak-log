"use server";

import { revalidatePath } from "next/cache";
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

export async function createLog(input: CreateLogInput): Promise<ActionResult<{ logId: string }>> {
  const parsed = createLogSchema.safeParse(input);
  if (!parsed.success) {
    return fail("入力内容を確認してください", parsed.error.flatten().fieldErrors);
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
    revalidatePath("/history");
    return ok({ logId: log.id });
  } catch (e) {
    return fail(toActionMessage(e));
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
    revalidatePath("/history");
    return ok();
  } catch (e) {
    return fail(toActionMessage(e));
  }
}

// TODO: Phase 6 - ログの実行日時を編集する
export async function updateLogPerformedAt(_input: UpdateLogPerformedAtInput): Promise<ActionResult> {
  // TODO: Implement
  // 1. Validate with updateLogPerformedAtSchema
  // 2. requireUserId()
  // 3. Check log ownership
  // 4. prisma.log.update({ where: { id, userId }, data: { performedAt } })
  // 5. revalidatePath("/history")
  return fail("未実装です");
}
