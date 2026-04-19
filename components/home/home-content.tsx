"use client";

import { useState, useEffect } from "react";
import { HomeHeader } from "./home-header";
import { FilterFab } from "./filter-fab";
import { HomeFab } from "@/components/log/home-fab";
import { TimelineList } from "@/components/history/timeline-list";
import { CompactTimelineList } from "./compact-timeline";
import type { HistoryDayItem } from "@/server/queries/log";

type Activity = { id: string; name: string; emoji: string | null; color: string | null };
type Tab = "detail" | "compact";

type Props = {
  activities: Activity[];
  dayItems: HistoryDayItem[];
  oldestDate: string;
  hasMore: boolean;
  selectedActivityId: string | null;
  noteKeyword: string;
  currentTab: Tab;
};

export function HomeContent({ activities, dayItems, oldestDate, hasMore, selectedActivityId, noteKeyword, currentTab }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticActivityId, setOptimisticActivityId] = useState(selectedActivityId);

  useEffect(() => {
    setIsLoading(false);
    setOptimisticActivityId(selectedActivityId);
  }, [selectedActivityId, noteKeyword]);

  const hasFilters = !!(selectedActivityId || noteKeyword);
  const isEmpty = hasFilters && dayItems.length === 0;

  return (
    <>
      <HomeHeader selectedActivityId={selectedActivityId} noteKeyword={noteKeyword} currentTab={currentTab} />
      {isEmpty && !isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-sm text-muted-foreground">条件に一致するピークがありません</p>
        </div>
      ) : (
        <div className={`px-4 pb-6 max-w-lg mx-auto transition-opacity duration-150 ${isLoading ? "opacity-40 pointer-events-none" : ""}`}>
          {currentTab === "compact" ? (
            <CompactTimelineList
              key={`compact-${selectedActivityId ?? ""}-${noteKeyword}`}
              initialItems={dayItems}
              oldestDate={oldestDate}
              hasMore={hasMore}
            />
          ) : (
            <TimelineList
              key={`detail-${selectedActivityId ?? ""}-${noteKeyword}`}
              initialItems={dayItems}
              oldestDate={oldestDate}
              hasMore={hasMore}
            />
          )}
        </div>
      )}
      <FilterFab
        activities={activities}
        selectedActivityId={selectedActivityId}
        noteKeyword={noteKeyword}
        currentTab={currentTab}
        onLoadingStart={() => setIsLoading(true)}
        onActivityChange={setOptimisticActivityId}
      />
      <HomeFab activities={activities} defaultActivityId={optimisticActivityId} />
    </>
  );
}
