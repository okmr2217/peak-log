"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, subDays, parse } from "date-fns";
import { HomeHeader } from "./home-header";
import { FilterFab } from "./filter-fab";
import { HomeFab } from "@/components/log/home-fab";
import { TimelineDayGroup } from "./timeline-day-group";
import { LogDayCards } from "./log-day-cards";
import { LogChip } from "./log-chip";
import type { HistoryDayItem, LogEditedPayload, LogItem } from "@/server/queries/log";

type Activity = {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  fields: { id: string; name: string; type: import("@prisma/client").FieldType; options: string[]; isArchived: boolean }[];
};
type Tab = "card" | "list";

type Props = {
  activities: Activity[];
  dayItems: HistoryDayItem[];
  hasMore: boolean;
  fromDate: string;
  toDate: string;
  defaultFromDate: string;
  defaultToDate: string;
  selectedActivityId: string | null;
  noteKeyword: string;
  currentTab: Tab;
};

export function HomeContent({
  activities,
  dayItems,
  hasMore,
  fromDate,
  toDate,
  defaultFromDate,
  defaultToDate,
  selectedActivityId,
  noteKeyword,
  currentTab,
}: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [optimisticActivityId, setOptimisticActivityId] = useState(selectedActivityId);
  const [activeTab, setActiveTab] = useState<Tab>(currentTab);
  const [localDayItems, setLocalDayItems] = useState<HistoryDayItem[]>(dayItems);

  useEffect(() => {
    setIsLoading(false);
    setIsLoadingMore(false);
    setOptimisticActivityId(selectedActivityId);
    setActiveTab(currentTab);
  }, [selectedActivityId, noteKeyword, fromDate, toDate, currentTab]);

  useEffect(() => {
    setLocalDayItems(dayItems);
  }, [dayItems]);

  function handleLogEdited(logId: string, data: LogEditedPayload) {
    setLocalDayItems((prev) =>
      prev.map((day) => ({
        ...day,
        logs: day.logs.map((log): LogItem => {
          if (log.id !== logId) return log;
          return { ...log, performedAt: data.newDate, stars: data.stars, note: data.note, fieldValues: data.fieldValues };
        }),
      })),
    );
  }

  const daysWithLogs = localDayItems.filter((d) => d.logs.length > 0);
  const hasNonDefaultDates = fromDate !== defaultFromDate || toDate !== defaultToDate;
  const hasActiveFilters = !!(selectedActivityId || noteKeyword || hasNonDefaultDates);
  const isEmpty = hasActiveFilters && daysWithLogs.length === 0;

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    const params = new URLSearchParams();
    if (selectedActivityId) params.set("activityId", selectedActivityId);
    if (noteKeyword) params.set("note", noteKeyword);
    if (tab !== "card") params.set("tab", tab);
    params.set("from", fromDate);
    params.set("to", toDate);
    window.history.replaceState(null, "", `/?${params.toString()}`);
  }

  function handleLoadMore() {
    setIsLoadingMore(true);
    const newFrom = format(subDays(parse(fromDate, "yyyy-MM-dd", new Date()), 30), "yyyy-MM-dd");
    const params = new URLSearchParams();
    if (selectedActivityId) params.set("activityId", selectedActivityId);
    if (noteKeyword) params.set("note", noteKeyword);
    if (activeTab !== "card") params.set("tab", activeTab);
    params.set("from", newFrom);
    params.set("to", toDate);
    router.push(`/?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      <HomeHeader
        selectedActivityId={selectedActivityId}
        noteKeyword={noteKeyword}
        fromDate={fromDate}
        toDate={toDate}
        currentTab={activeTab}
        onTabChange={handleTabChange}
      />
      {isEmpty && !isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-sm text-muted-foreground">条件に一致するピークがありません</p>
        </div>
      ) : (
        <div className={`px-4 pb-6 max-w-lg mx-auto transition-opacity duration-150 ${isLoading ? "opacity-40 pointer-events-none" : ""}`}>
          <div className="space-y-1.5">
            {daysWithLogs.map(({ date, logs }) => (
              <TimelineDayGroup key={date} date={date}>
                {activeTab === "list" ? (
                  <span className="flex flex-wrap gap-x-1.5 gap-y-2">
                    {logs.map((log) => (
                      <LogChip key={log.id} log={log} />
                    ))}
                  </span>
                ) : (
                  <LogDayCards logs={logs} onLogEdited={handleLogEdited} />
                )}
              </TimelineDayGroup>
            ))}
          </div>
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-5 py-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors border border-border hover:border-muted-foreground/30 rounded-full"
              >
                {isLoadingMore ? "読み込み中..." : "さらに前を見る"}
              </button>
            </div>
          )}
        </div>
      )}
      <FilterFab
        activities={activities}
        selectedActivityId={selectedActivityId}
        noteKeyword={noteKeyword}
        fromDate={fromDate}
        toDate={toDate}
        defaultFromDate={defaultFromDate}
        defaultToDate={defaultToDate}
        currentTab={activeTab}
        onLoadingStart={() => setIsLoading(true)}
        onActivityChange={setOptimisticActivityId}
      />
      <HomeFab activities={activities} defaultActivityId={optimisticActivityId} />
    </>
  );
}
