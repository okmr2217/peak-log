"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { type ActionResult, ok, fail } from "@/lib/action-result";
import { toActionMessage } from "@/lib/app-error";
import {
  createActivityFieldSchema,
  updateActivityFieldSchema,
  fieldIdSchema,
  reorderActivityFieldsSchema,
  type CreateActivityFieldInput,
  type UpdateActivityFieldInput,
  type FieldIdInput,
  type ReorderActivityFieldsInput,
} from "@/server/validators/activity-field";

const MAX_FIELDS = 8;

async function assertActivityOwnership(activityId: string, userId: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { userId: true },
  });
  if (!activity || activity.userId !== userId) {
    throw new Error("権限がありません");
  }
}

async function assertFieldOwnership(fieldId: string, userId: string) {
  const field = await prisma.activityField.findUnique({
    where: { id: fieldId },
    select: { activityId: true, activity: { select: { userId: true } } },
  });
  if (!field || field.activity.userId !== userId) {
    throw new Error("権限がありません");
  }
  return field;
}

function revalidateActivityPaths() {
  revalidatePath("/");
  revalidatePath("/activities");
}

export async function createActivityField(input: CreateActivityFieldInput): Promise<ActionResult<{ fieldId: string }>> {
  const parsed = createActivityFieldSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "入力内容を確認してください");
  }

  try {
    const userId = await requireUserId();
    await assertActivityOwnership(parsed.data.activityId, userId);

    const activeCount = await prisma.activityField.count({
      where: { activityId: parsed.data.activityId, isArchived: false },
    });
    if (activeCount >= MAX_FIELDS) {
      return fail(`フィールドは最大${MAX_FIELDS}個までです`);
    }

    const maxOrder = await prisma.activityField.aggregate({
      where: { activityId: parsed.data.activityId },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const field = await prisma.activityField.create({
      data: { ...parsed.data, sortOrder },
      select: { id: true },
    });

    revalidateActivityPaths();
    return ok({ fieldId: field.id });
  } catch (e) {
    return fail(toActionMessage(e, "保存に失敗しました"));
  }
}

export async function updateActivityField(input: UpdateActivityFieldInput): Promise<ActionResult> {
  const parsed = updateActivityFieldSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "入力内容を確認してください");
  }

  try {
    const userId = await requireUserId();
    const { fieldId, type, options, ...rest } = parsed.data;
    await assertFieldOwnership(fieldId, userId);

    const current = await prisma.activityField.findUnique({
      where: { id: fieldId },
      select: { type: true },
    });
    const newType = type ?? current!.type;

    let resolvedOptions = options;
    if (type !== undefined) {
      if (newType === "TEXT" || newType === "TEXTAREA") {
        resolvedOptions = [];
      }
    }

    await prisma.activityField.update({
      where: { id: fieldId },
      data: {
        ...rest,
        ...(type !== undefined ? { type } : {}),
        ...(resolvedOptions !== undefined ? { options: resolvedOptions } : {}),
      },
    });

    revalidateActivityPaths();
    return ok();
  } catch (e) {
    return fail(toActionMessage(e, "更新できませんでした"));
  }
}

export async function archiveActivityField(input: FieldIdInput): Promise<ActionResult> {
  const parsed = fieldIdSchema.safeParse(input);
  if (!parsed.success) {
    return fail("無効なIDです");
  }

  try {
    const userId = await requireUserId();
    await assertFieldOwnership(parsed.data.fieldId, userId);
    await prisma.activityField.update({
      where: { id: parsed.data.fieldId },
      data: { isArchived: true },
    });
    revalidateActivityPaths();
    return ok();
  } catch (e) {
    return fail(toActionMessage(e, "更新できませんでした"));
  }
}

export async function unarchiveActivityField(input: FieldIdInput): Promise<ActionResult> {
  const parsed = fieldIdSchema.safeParse(input);
  if (!parsed.success) {
    return fail("無効なIDです");
  }

  try {
    const userId = await requireUserId();
    const field = await assertFieldOwnership(parsed.data.fieldId, userId);

    const activeCount = await prisma.activityField.count({
      where: { activityId: field.activityId, isArchived: false },
    });
    if (activeCount >= MAX_FIELDS) {
      return fail(`フィールドは最大${MAX_FIELDS}個までです`);
    }

    await prisma.activityField.update({
      where: { id: parsed.data.fieldId },
      data: { isArchived: false },
    });
    revalidateActivityPaths();
    return ok();
  } catch (e) {
    return fail(toActionMessage(e, "更新できませんでした"));
  }
}

export async function deleteActivityField(input: FieldIdInput): Promise<ActionResult> {
  const parsed = fieldIdSchema.safeParse(input);
  if (!parsed.success) {
    return fail("無効なIDです");
  }

  try {
    const userId = await requireUserId();
    await assertFieldOwnership(parsed.data.fieldId, userId);
    await prisma.activityField.delete({ where: { id: parsed.data.fieldId } });
    revalidateActivityPaths();
    return ok();
  } catch (e) {
    return fail(toActionMessage(e, "削除できませんでした"));
  }
}

export async function reorderActivityFields(input: ReorderActivityFieldsInput): Promise<ActionResult> {
  const parsed = reorderActivityFieldsSchema.safeParse(input);
  if (!parsed.success) {
    return fail("無効なデータです");
  }

  try {
    const userId = await requireUserId();
    await assertActivityOwnership(parsed.data.activityId, userId);

    const owned = await prisma.activityField.findMany({
      where: { id: { in: parsed.data.orderedFieldIds }, activityId: parsed.data.activityId },
      select: { id: true },
    });
    if (owned.length !== parsed.data.orderedFieldIds.length) {
      return fail("権限がありません");
    }

    await prisma.$transaction(
      parsed.data.orderedFieldIds.map((id, index) =>
        prisma.activityField.update({ where: { id }, data: { sortOrder: index } }),
      ),
    );

    revalidateActivityPaths();
    return ok();
  } catch (e) {
    return fail(toActionMessage(e, "更新できませんでした"));
  }
}
