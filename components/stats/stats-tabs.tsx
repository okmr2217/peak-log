"use client";

import Link from "next/link";

type StatsTab = "monthly" | "category";

type Props = {
  currentTab: StatsTab;
  month: string;
  period: string;
};

export function StatsTabs({ currentTab, month, period }: Props) {
  const tabs: { value: StatsTab; label: string; href: string }[] = [
    { value: "category", label: "カテゴリ統計", href: `/stats?tab=category&period=${period}` },
    { value: "monthly", label: "月次統計", href: `/stats?tab=monthly&month=${month}` },
  ];

  return (
    <div className="flex gap-1 p-0.5 bg-muted rounded-lg border border-border mb-4">
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={tab.href}
          className={`flex-1 text-xs py-1.5 rounded-md transition-all font-medium text-center ${
            currentTab === tab.value ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
