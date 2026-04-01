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
    { value: "monthly", label: "月次統計", href: `/stats?tab=monthly&month=${month}` },
    { value: "category", label: "カテゴリ統計", href: `/stats?tab=category&period=${period}` },
  ];

  return (
    <div className="flex gap-1 p-0.5 bg-white/[0.04] rounded-lg border border-white/[0.06] mb-4">
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={tab.href}
          className={`flex-1 text-xs py-1.5 rounded-md transition-colors font-medium text-center ${
            currentTab === tab.value ? "bg-white/[0.08] text-white" : "text-zinc-600 hover:text-zinc-400"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
