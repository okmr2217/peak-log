import type { ActivityField } from "@prisma/client";

type RawFieldValues = Record<string, string | string[]>;

export function normalizeFieldValues(
  raw: RawFieldValues | undefined,
  fields: Pick<ActivityField, "id" | "type" | "options" | "isArchived">[],
): Record<string, string | string[]> | null {
  if (!raw) return null;

  const fieldMap = new Map(fields.map((f) => [f.id, f]));
  const normalized: Record<string, string | string[]> = {};

  for (const [fieldId, value] of Object.entries(raw)) {
    const field = fieldMap.get(fieldId);
    if (!field || field.isArchived) continue;

    if (field.type === "TEXT" || field.type === "TEXTAREA") {
      if (typeof value !== "string") continue;
      const trimmed = value.trim();
      if (!trimmed) continue;
      normalized[fieldId] = trimmed;
    } else if (field.type === "SELECT") {
      if (typeof value !== "string" || !field.options.includes(value)) continue;
      normalized[fieldId] = value;
    } else if (field.type === "MULTI_SELECT") {
      if (!Array.isArray(value)) continue;
      const valid = value.filter((v): v is string => typeof v === "string" && field.options.includes(v));
      if (valid.length === 0) continue;
      normalized[fieldId] = valid;
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
}
