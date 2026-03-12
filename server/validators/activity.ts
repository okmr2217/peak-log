import { z } from "zod";

export const createActivitySchema = z.object({
  name: z.string().min(1, "名前を入力してください").max(50),
  emoji: z.string().max(10).optional(),
  color: z.string().max(20).optional(),
});

export const updateActivitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "名前を入力してください").max(50).optional(),
  emoji: z.string().max(10).optional(),
  color: z.string().max(20).optional(),
  sortOrder: z.number().int().optional(),
  isArchived: z.boolean().optional(),
});

export const deleteActivitySchema = z.object({
  id: z.string().min(1),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
