import { z } from "zod";

export const createLogSchema = z.object({
  activityId: z.string().min(1, "アクティビティを選択してください"),
  performedAt: z.coerce.date().optional(),
});

export const deleteLogSchema = z.object({
  id: z.string().min(1),
});

export type CreateLogInput = z.infer<typeof createLogSchema>;
