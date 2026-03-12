"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { type ActionResult, ok, fail } from "@/lib/action-result";
import { toActionMessage } from "@/lib/app-error";
import {
  createActivitySchema,
  updateActivitySchema,
  archiveActivitySchema,
  reorderActivitiesSchema,
  type CreateActivityInput,
  type UpdateActivityInput,
  type ArchiveActivityInput,
  type ReorderActivitiesInput,
} from "@/server/validators/activity";

export async function createActivity(input: CreateActivityInput): Promise<ActionResult> {
  const parsed = createActivitySchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "入力内容を確認してください");
  }

  try {
    const userId = await requireUserId();
    const count = await prisma.activity.count({ where: { userId } });
    await prisma.activity.create({
      data: { ...parsed.data, userId, sortOrder: count },
    });
    revalidatePath("/");
    revalidatePath("/activities");
    return ok();
  } catch (e) {
    return fail(toActionMessage(e));
  }
}

export async function updateActivity(input: UpdateActivityInput): Promise<ActionResult> {
  const parsed = updateActivitySchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "入力内容を確認してください");
  }

  try {
    const userId = await requireUserId();
    const { activityId, ...data } = parsed.data;
    await prisma.activity.updateMany({
      where: { id: activityId, userId },
      data,
    });
    revalidatePath("/");
    revalidatePath("/activities");
    return ok();
  } catch (e) {
    return fail(toActionMessage(e, "更新できませんでした"));
  }
}

export async function archiveActivity(input: ArchiveActivityInput): Promise<ActionResult> {
  const parsed = archiveActivitySchema.safeParse(input);
  if (!parsed.success) {
    return fail("無効なIDです");
  }

  try {
    const userId = await requireUserId();
    await prisma.activity.updateMany({
      where: { id: parsed.data.activityId, userId },
      data: { isArchived: parsed.data.isArchived },
    });
    revalidatePath("/");
    revalidatePath("/activities");
    return ok();
  } catch (e) {
    return fail(toActionMessage(e, "更新できませんでした"));
  }
}

export async function reorderActivities(input: ReorderActivitiesInput): Promise<ActionResult> {
  const parsed = reorderActivitiesSchema.safeParse(input);
  if (!parsed.success) {
    return fail("無効なデータです");
  }

  try {
    const userId = await requireUserId();
    const owned = await prisma.activity.findMany({
      where: { id: { in: parsed.data.activityIds }, userId },
      select: { id: true },
    });
    if (owned.length !== parsed.data.activityIds.length) {
      return fail("権限がありません");
    }
    await prisma.$transaction(
      parsed.data.activityIds.map((id, index) =>
        prisma.activity.update({ where: { id }, data: { sortOrder: index } }),
      ),
    );
    revalidatePath("/");
    revalidatePath("/activities");
    return ok();
  } catch (e) {
    return fail(toActionMessage(e, "更新できませんでした"));
  }
}
