"use client";

import { useState, useEffect } from "react";
import { HomeHeader } from "./home-header";
import { HomeFab } from "@/components/log/home-fab";
import { TimelineList } from "@/components/history/timeline-list";
import type { HistoryDayItem } from "@/server/queries/log";

type Activity = { id: string; name: string; emoji: string | null; color: string | null };

type Props = {
  activities: Activity[];
  dayItems: HistoryDayItem[];
  oldestDate: string;
  hasMore: boolean;
  selectedActivityId: string | null;
  noteKeyword: string;
};

export function HomeContent({ activities, dayItems, oldestDate, hasMore, selectedActivityId, noteKeyword }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [optimisticActivityId, setOptimisticActivityId] = useState(selectedActivityId);

  // サーバーが新しい props を返した = 検索完了
  useEffect(() => {
    setIsLoading(false);
    setOptimisticActivityId(selectedActivityId);
  }, [selectedActivityId, noteKeyword]);

  const hasFilters = !!(selectedActivityId || noteKeyword);
  const isEmpty = hasFilters && dayItems.length === 0;

  return (
    <>
      <HomeHeader
        activities={activities}
        selectedActivityId={selectedActivityId}
        noteKeyword={noteKeyword}
        onLoadingStart={() => setIsLoading(true)}
        onOpenChange={setIsPanelOpen}
        onActivityChange={setOptimisticActivityId}
      />
      {isEmpty && !isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-sm text-zinc-500">条件に一致するピークがありません</p>
        </div>
      ) : (
        <div className={`px-4 pb-6 max-w-lg mx-auto transition-opacity duration-150 ${isPanelOpen ? "pt-4" : ""} ${isLoading ? "opacity-40 pointer-events-none" : ""}`}>
          <TimelineList
            key={`${selectedActivityId ?? ""}-${noteKeyword}`}
            initialItems={dayItems}
            oldestDate={oldestDate}
            hasMore={hasMore}
          />
        </div>
      )}
      <HomeFab activities={activities} defaultActivityId={optimisticActivityId} />
    </>
  );
}
