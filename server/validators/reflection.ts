import { z } from "zod";

export const upsertReflectionSchema = z.object({
  logId: z.string().min(1),
  stars: z.number().int().min(1, "1〜5で選んでください").max(5, "1〜5で選んでください").optional(),
  note: z.string().max(200, "メモは200文字以内で入力してください").optional(),
});

export type UpsertReflectionInput = z.infer<typeof upsertReflectionSchema>;
