"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FieldType } from "@prisma/client";

interface Props {
  field: {
    id: string;
    name: string;
    type: FieldType;
    options: string[];
  };
  value: string | string[] | undefined;
  onChange: (value: string | string[] | undefined) => void;
  activityColor: string | null;
}

export function FieldValueInput({ field, value, onChange, activityColor }: Props) {
  const accent = activityColor ?? "#7C4DFF";

  if (field.type === "TEXT") {
    return (
      <Input
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder={field.name}
        maxLength={100}
        className="bg-muted border-border rounded-xl px-3.5 py-2.5 placeholder:text-muted-foreground/50 focus-visible:ring-primary/50"
      />
    );
  }

  if (field.type === "TEXTAREA") {
    return (
      <Textarea
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder={field.name}
        rows={2}
        maxLength={200}
        className="bg-muted border-border rounded-xl px-3.5 py-2.5 placeholder:text-muted-foreground/50 resize-none focus-visible:ring-primary/50"
      />
    );
  }

  if (field.type === "SELECT") {
    const selected = typeof value === "string" ? value : null;
    return (
      <div className="flex flex-wrap gap-1.5">
        {field.options.map((opt) => {
          const isSelected = selected === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(isSelected ? undefined : opt)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 active:scale-95 border"
              style={
                isSelected
                  ? { background: `${accent}28`, borderColor: `${accent}66`, color: "var(--foreground)" }
                  : { background: "var(--muted)", borderColor: "transparent", color: "var(--muted-foreground)" }
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  if (field.type === "MULTI_SELECT") {
    const selected = Array.isArray(value) ? value : [];
    function toggle(opt: string) {
      if (selected.includes(opt)) {
        const next = selected.filter((v) => v !== opt);
        onChange(next.length > 0 ? next : undefined);
      } else {
        onChange([...selected, opt]);
      }
    }
    return (
      <div className="flex flex-wrap gap-1.5">
        {field.options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 active:scale-95 border"
              style={
                isSelected
                  ? { background: `${accent}28`, borderColor: `${accent}66`, color: "var(--foreground)" }
                  : { background: "var(--muted)", borderColor: "transparent", color: "var(--muted-foreground)" }
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  return null;
}
