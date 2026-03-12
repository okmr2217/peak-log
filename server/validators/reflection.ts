import { z } from "zod";

export const upsertReflectionSchema = z.object({
  logId: z.string().min(1),
  excitement: z.number().int().min(1).max(5).optional(),
  achievement: z.number().int().min(1).max(5).optional(),
  wantAgain: z.boolean().optional(),
  note: z.string().max(500).optional(),
});

export type UpsertReflectionInput = z.infer<typeof upsertReflectionSchema>;
