"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { type ActionResult, ok, fail } from "@/lib/action-result";
import { toActionMessage } from "@/lib/app-error";
import { normalizeFieldValues } from "@/lib/normalize-field-values";
import {
  createLogSchema,
  deleteLogSchema,
  updateLogSchema,
  type CreateLogInput,
  type UpdateLogInput,
} from "@/server/validators/log";

const ACTIVITY_FIELDS_SELECT = {
  id: true,
  type: true,
  options: true,
  isArchived: true,
} as const;

export async function createLog(input: CreateLogInput): Promise<ActionResult<{ logId: string }>> {
  const parsed = createLogSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "入力内容を確認してください");
  }

  try {
    const userId = await requireUserId();
    const { activityId, performedAt, stars, note, fieldValues: rawFieldValues } = parsed.data;

    const activity = await prisma.activity.findFirst({
      where: { id: activityId, userId },
      select: {
        id: true,
        fields: { select: ACTIVITY_FIELDS_SELECT },
      },
    });
    if (!activity) {
      return fail("アクティビティが見つかりません");
    }

    const fieldValues = normalizeFieldValues(rawFieldValues, activity.fields);
    const noteTrimmed = (note ?? "").trim();

    const log = await prisma.log.create({
      data: {
        userId,
        activityId,
        performedAt: performedAt ?? new Date(),
        stars: stars ?? null,
        note: noteTrimmed || null,
        ...(fieldValues !== null && { fieldValues }),
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

export async function updateLog(input: UpdateLogInput): Promise<ActionResult> {
  const parsed = updateLogSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "正しい日時を入力してください");
  }

  try {
    const userId = await requireUserId();
    const { logId, performedAt, stars, note, fieldValues: rawFieldValues } = parsed.data;

    const existing = await prisma.log.findFirst({
      where: { id: logId, userId },
      select: {
        id: true,
        activity: {
          select: {
            fields: { select: ACTIVITY_FIELDS_SELECT },
          },
        },
      },
    });
    if (!existing) {
      return fail("記録が見つかりません");
    }

    const noteTrimmed = (note ?? "").trim();
    const fieldValuesData =
      rawFieldValues !== undefined ? normalizeFieldValues(rawFieldValues, existing.activity.fields) : undefined;

    await prisma.log.update({
      where: { id: logId },
      data: {
        performedAt,
        stars: stars ?? null,
        note: noteTrimmed || null,
        ...(fieldValuesData !== undefined && { fieldValues: fieldValuesData ?? Prisma.DbNull }),
      },
    });

    revalidatePath("/");

    return ok();
  } catch (e) {
    return fail(toActionMessage(e, "更新できませんでした"));
  }
}
