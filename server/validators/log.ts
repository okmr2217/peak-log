import { z } from "zod";

export const createLogSchema = z.object({
  activityId: z.string().min(1, "アクティビティを選択してください"),
  performedAt: z.coerce.date().optional(),
});

export const deleteLogSchema = z.object({
  id: z.string().min(1),
});

export const updateLogPerformedAtSchema = z.object({
  logId: z.string().min(1),
  performedAt: z.coerce.date(),
});

export type CreateLogInput = z.infer<typeof createLogSchema>;
export type UpdateLogPerformedAtInput = z.infer<typeof updateLogPerformedAtSchema>;
