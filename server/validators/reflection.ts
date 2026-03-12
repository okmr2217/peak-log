import { z } from "zod";

export const upsertReflectionSchema = z.object({
  logId: z.string().min(1),
  excitement: z.number().int().min(1, "1〜5で選んでください").max(5, "1〜5で選んでください").optional(),
  achievement: z.number().int().min(1, "1〜5で選んでください").max(5, "1〜5で選んでください").optional(),
  wantAgain: z.boolean().optional(),
  note: z.string().max(200, "メモは200文字以内で入力してください").optional(),
});

export type UpsertReflectionInput = z.infer<typeof upsertReflectionSchema>;
