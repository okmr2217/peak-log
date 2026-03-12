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
): Promise<ActionResult<{ logId: string; reflectionId: string }>> {
  const parsed = upsertReflectionSchema.safeParse(input);
  if (!parsed.success) {
    return fail("入力内容を確認してください", parsed.error.flatten().fieldErrors);
  }

  try {
    const userId = await requireUserId();
    const { logId, ...data } = parsed.data;

    // Log が自分のものか確認
    const log = await prisma.log.findFirst({ where: { id: logId, userId } });
    if (!log) {
      return fail("ログが見つかりません");
    }

    const reflection = await prisma.reflection.upsert({
      where: { logId },
      create: { logId, userId, ...data },
      update: data,
    });

    revalidatePath("/");
    revalidatePath("/history");
    return ok({ logId, reflectionId: reflection.id });
  } catch (e) {
    return fail(toActionMessage(e));
  }
}
