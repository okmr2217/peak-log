import type { FieldType } from "@prisma/client";

type ActivityField = {
  id: string;
  name: string;
  type: FieldType;
  options: string[];
};

interface Props {
  fieldValues: Record<string, string | string[]> | null;
  fields: ActivityField[];
}

export function LogFieldValuesPreview({ fieldValues, fields }: Props) {
  if (!fieldValues) return null;

  const entries: { fieldId: string; name: string; displayValue: string }[] = [];

  for (const field of fields) {
    const raw = fieldValues[field.id];
    if (raw === undefined) continue;

    let displayValue: string;
    if (Array.isArray(raw)) {
      if (raw.length === 0) continue;
      displayValue = raw.join(" ・ ");
    } else if (typeof raw === "string") {
      if (raw.trim() === "") continue;
      displayValue = raw;
    } else {
      continue;
    }

    entries.push({ fieldId: field.id, name: field.name, displayValue });
  }

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 pl-[46px] pr-3">
      {entries.map((entry) => (
        <div key={entry.fieldId} className="text-xs text-muted-foreground/80 flex items-baseline gap-1 min-w-0">
          <span className="text-muted-foreground/50 flex-shrink-0">{entry.name}:</span>
          <span className="text-foreground/70 truncate">{entry.displayValue}</span>
        </div>
      ))}
    </div>
  );
}
