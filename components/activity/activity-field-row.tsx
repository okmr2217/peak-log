"use client";

import { ChevronDown } from "lucide-react";
import type { ActivityFieldDTO } from "@/server/queries/activity";

const TYPE_LABELS: Record<string, string> = {
  TEXT: "テキスト",
  TEXTAREA: "長文",
  SELECT: "選択",
  MULTI_SELECT: "複数選択",
};

interface Props {
  field: ActivityFieldDTO;
  onClick: () => void;
}

export function ActivityFieldRow({ field, onClick }: Props) {
  const hasOptions = (field.type === "SELECT" || field.type === "MULTI_SELECT") && field.options.length > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 bg-[#18181B] border border-[#27272A] rounded-xl p-3 text-left transition-colors hover:border-primary/30 active:scale-[0.99] ${field.isArchived ? "opacity-50" : ""}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-foreground text-sm font-medium">{field.name}</span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: "rgba(124,77,255,0.15)", color: "#B19EFF" }}
          >
            {TYPE_LABELS[field.type]}
          </span>
          {field.isArchived && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
              アーカイブ済
            </span>
          )}
        </div>
        {hasOptions && (
          <p className="text-muted-foreground/60 text-xs mt-0.5 truncate">{field.options.join(" ・ ")}</p>
        )}
      </div>
      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </button>
  );
}
