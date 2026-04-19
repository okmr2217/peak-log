"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";

type Tab = "detail" | "compact";

type Props = {
  selectedActivityId: string | null;
  noteKeyword: string;
  currentTab: Tab;
};

export function HomeHeader({ selectedActivityId, noteKeyword, currentTab }: Props) {
  const router = useRouter();

  const handleTabChange = (tab: Tab) => {
    const params = new URLSearchParams();
    if (selectedActivityId) params.set("activityId", selectedActivityId);
    if (noteKeyword) params.set("note", noteKeyword);
    if (tab !== "detail") params.set("tab", tab);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  };

  return (
    <div className="px-4 pt-4 max-w-lg mx-auto">
      <PageHeader title="記録" description="ピーク体験を時系列で振り返れます" />
      <div className="flex gap-1 p-0.5 bg-muted rounded-lg border border-border mb-4 mt-0.5">
        {(["detail", "compact"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTabChange(t)}
            className={`flex-1 text-xs py-1.5 rounded-md transition-all font-medium ${
              currentTab === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "detail" ? "カード" : "リスト"}
          </button>
        ))}
      </div>
    </div>
  );
}
