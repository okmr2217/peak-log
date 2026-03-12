import { z } from "zod";

export const createActivitySchema = z.object({
  name: z.string().min(1, "名前を入力してください").max(20, "20文字以内で入力してください"),
  emoji: z.string().max(10).optional(),
  color: z.string().max(20).optional(),
});

export const updateActivitySchema = z.object({
  activityId: z.string().min(1),
  name: z.string().min(1, "名前を入力してください").max(20, "20文字以内で入力してください"),
  emoji: z.string().max(10).optional(),
  color: z.string().max(20).optional(),
});

export const archiveActivitySchema = z.object({
  activityId: z.string().min(1),
  isArchived: z.boolean(),
});

export const reorderActivitiesSchema = z.object({
  activityIds: z.array(z.string().min(1)).min(1),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type ArchiveActivityInput = z.infer<typeof archiveActivitySchema>;
export type ReorderActivitiesInput = z.infer<typeof reorderActivitiesSchema>;
