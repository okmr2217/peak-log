import { z } from "zod";

export const createLogSchema = z.object({
  activityId: z.string().min(1, "アクティビティを選択してください"),
  performedAt: z.coerce.date().optional(),
});

export const deleteLogSchema = z.object({
  id: z.string().min(1),
});

export const updateLogPerformedAtSchema = z.object({
  logId: z.string().min(1, "ログIDが不正です"),
  performedAt: z.coerce
    .date({ error: "正しい日時を入力してください" })
    .refine((d) => !isNaN(d.getTime()), { message: "正しい日時を入力してください" }),
});

export const updateLogSchema = z.object({
  logId: z.string().min(1, "ログIDが不正です"),
  performedAt: z.coerce
    .date({ error: "正しい日時を入力してください" })
    .refine((d) => !isNaN(d.getTime()), { message: "正しい日時を入力してください" }),
  stars: z.number().int().min(1).max(5).optional(),
  note: z.string().max(200, "メモは200文字以内で入力してください").optional(),
});

export type CreateLogInput = z.infer<typeof createLogSchema>;
export type UpdateLogPerformedAtInput = z.infer<typeof updateLogPerformedAtSchema>;
export type UpdateLogInput = z.infer<typeof updateLogSchema>;
