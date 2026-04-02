"use client";

import Link from "next/link";
import type { PeriodPreset } from "@/server/queries/log";

type Props = {
  currentPeriod: PeriodPreset;
};

const PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: "thisMonth", label: "今月" },
  { value: "3months", label: "3ヶ月" },
  { value: "thisYear", label: "今年" },
  { value: "all", label: "全期間" },
];

export function PeriodFilter({ currentPeriod }: Props) {
  return (
    <div className="flex gap-1.5 mb-4">
      {PRESETS.map(({ value, label }) => (
        <Link
          key={value}
          href={`/stats?tab=category&period=${value}`}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            currentPeriod === value
              ? "bg-primary/20 text-primary border-primary/30"
              : "bg-muted text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground/30"
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
