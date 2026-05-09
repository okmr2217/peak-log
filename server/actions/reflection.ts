"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { type ActionResult, ok, fail } from "@/lib/action-result";
import { toActionMessage } from "@/lib/app-error";
import {
  upsertReflectionSchema,
  type UpsertReflectionInput,
} from "@/server/validators/reflection";

export async function upsertReflection(
  input: UpsertReflectionInput,
): Promise<ActionResult<{ logId: string }>> {
  const parsed = upsertReflectionSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "入力内容を確認してください");
  }

  try {
    const userId = await requireUserId();
    const { logId, stars, note } = parsed.data;

    const log = await prisma.log.findFirst({ where: { id: logId, userId } });
    if (!log) {
      return fail("ログが見つかりません");
    }

    await prisma.log.update({
      where: { id: logId },
      data: { stars: stars ?? null, note: note ?? null },
    });

    revalidatePath("/");
    revalidatePath("/history");
    return ok({ logId });
  } catch (e) {
    return fail(toActionMessage(e));
  }
}
