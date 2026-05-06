"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { type ActionResult, ok, fail } from "@/lib/action-result";
import { verifyPassword } from "better-auth/crypto";
import { deleteAccountSchema, type DeleteAccountInput } from "@/server/validators/settings";

export async function deleteAccount(input: DeleteAccountInput): Promise<ActionResult> {
  const parsed = deleteAccountSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "入力内容を確認してください");
  }

  const userId = await requireUserId();

  const account = await prisma.account.findFirst({
    where: { userId, providerId: "credential" },
  });

  if (!account?.password) {
    return fail("アカウント情報が見つかりませんでした");
  }

  const isValid = await verifyPassword({ hash: account.password, password: parsed.data.password });
  if (!isValid) {
    return fail("パスワードが正しくありません");
  }

  await prisma.user.delete({ where: { id: userId } });

  return ok();
}
