import { z } from "zod";

const FIELD_NAME_MAX = 12;
const OPTION_MAX_LENGTH = 20;
const OPTIONS_MAX_COUNT = 20;

export const fieldTypeSchema = z.enum(["TEXT", "TEXTAREA", "SELECT", "MULTI_SELECT"]);

export const createActivityFieldSchema = z
  .object({
    activityId: z.string().min(1),
    name: z
      .string()
      .trim()
      .min(1, "名前を入力してください")
      .max(FIELD_NAME_MAX, `名前は${FIELD_NAME_MAX}文字以内で入力してください`),
    type: fieldTypeSchema,
    options: z
      .array(z.string().trim().min(1).max(OPTION_MAX_LENGTH, `選択肢は${OPTION_MAX_LENGTH}文字以内で入力してください`))
      .max(OPTIONS_MAX_COUNT)
      .default([]),
  })
  .refine((data) => (data.type === "SELECT" || data.type === "MULTI_SELECT" ? data.options.length > 0 : true), {
    message: "選択肢を1つ以上追加してください",
    path: ["options"],
  })
  .refine((data) => (data.type === "TEXT" || data.type === "TEXTAREA" ? data.options.length === 0 : true), {
    message: "テキスト型に選択肢は設定できません",
    path: ["options"],
  })
  .refine((data) => new Set(data.options).size === data.options.length, {
    message: "選択肢に重複があります",
    path: ["options"],
  });

export const updateActivityFieldSchema = z.object({
  fieldId: z.string().min(1),
  name: z
    .string()
    .trim()
    .min(1, "名前を入力してください")
    .max(FIELD_NAME_MAX, `名前は${FIELD_NAME_MAX}文字以内で入力してください`)
    .optional(),
  type: fieldTypeSchema.optional(),
  options: z
    .array(z.string().trim().min(1).max(OPTION_MAX_LENGTH, `選択肢は${OPTION_MAX_LENGTH}文字以内で入力してください`))
    .max(OPTIONS_MAX_COUNT)
    .optional(),
});

export const fieldIdSchema = z.object({
  fieldId: z.string().min(1),
});

export const reorderActivityFieldsSchema = z.object({
  activityId: z.string().min(1),
  orderedFieldIds: z.array(z.string().min(1)).min(1),
});

export type CreateActivityFieldInput = z.infer<typeof createActivityFieldSchema>;
export type UpdateActivityFieldInput = z.infer<typeof updateActivityFieldSchema>;
export type FieldIdInput = z.infer<typeof fieldIdSchema>;
export type ReorderActivityFieldsInput = z.infer<typeof reorderActivityFieldsSchema>;
