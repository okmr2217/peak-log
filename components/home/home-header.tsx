"use client";

type Tab = "card" | "list";

type Props = {
  selectedActivityId: string | null;
  noteKeyword: string;
  fromDate: string;
  toDate: string;
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export function HomeHeader({ currentTab, onTabChange }: Props) {
  return (
    <div className="px-4 pt-4 max-w-lg mx-auto">
      <p className="text-xs text-muted-foreground mb-3">ピーク体験を時系列で振り返れます</p>
      <div className="flex gap-1 p-0.5 bg-muted rounded-lg border border-border mb-4 mt-0.5">
        {(["card", "list"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onTabChange(t)}
            className={`flex-1 text-xs py-1.5 rounded-md transition-all font-medium ${
              currentTab === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "card" ? "カード" : "リスト"}
          </button>
        ))}
      </div>
    </div>
  );
}
