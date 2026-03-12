"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { type ActionResult, ok, fail } from "@/lib/action-result";
import { toActionMessage } from "@/lib/app-error";
import {
  createActivitySchema,
  updateActivitySchema,
  deleteActivitySchema,
  type CreateActivityInput,
  type UpdateActivityInput,
} from "@/server/validators/activity";

export async function createActivity(input: CreateActivityInput): Promise<ActionResult> {
  const parsed = createActivitySchema.safeParse(input);
  if (!parsed.success) {
    return fail("入力内容を確認してください", parsed.error.flatten().fieldErrors);
  }

  try {
    const userId = await requireUserId();
    const count = await prisma.activity.count({ where: { userId } });
    await prisma.activity.create({
      data: { ...parsed.data, userId, sortOrder: count },
    });
    revalidatePath("/activities");
    return ok();
  } catch (e) {
    return fail(toActionMessage(e));
  }
}

export async function updateActivity(input: UpdateActivityInput): Promise<ActionResult> {
  const parsed = updateActivitySchema.safeParse(input);
  if (!parsed.success) {
    return fail("入力内容を確認してください", parsed.error.flatten().fieldErrors);
  }

  try {
    const userId = await requireUserId();
    const { id, ...data } = parsed.data;
    await prisma.activity.updateMany({
      where: { id, userId },
      data,
    });
    revalidatePath("/activities");
    return ok();
  } catch (e) {
    return fail(toActionMessage(e));
  }
}

export async function deleteActivity(id: string): Promise<ActionResult> {
  const parsed = deleteActivitySchema.safeParse({ id });
  if (!parsed.success) {
    return fail("無効なIDです");
  }

  try {
    const userId = await requireUserId();
    await prisma.activity.deleteMany({
      where: { id: parsed.data.id, userId },
    });
    revalidatePath("/activities");
    return ok();
  } catch (e) {
    return fail(toActionMessage(e));
  }
}
