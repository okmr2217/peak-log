"use client";

import { useState, useTransition } from "react";
import { Pencil, Archive, ArchiveRestore, ArrowUp, ArrowDown } from "lucide-react";
import { archiveActivity, reorderActivities } from "@/server/actions/activity";
import { ActivityEditModal } from "./activity-edit-modal";

interface Activity {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  sortOrder: number;
  isArchived: boolean;
}

interface Props {
  activity: Activity;
  allActivityIds: string[];
}

export function ActivityItem({ activity, allActivityIds }: Props) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isArchivePending, startArchiveTransition] = useTransition();
  const [isReorderPending, startReorderTransition] = useTransition();

  const currentIndex = allActivityIds.indexOf(activity.id);

  function handleArchive() {
    startArchiveTransition(async () => {
      await archiveActivity({ activityId: activity.id, isArchived: !activity.isArchived });
    });
  }

  function handleMoveUp() {
    if (currentIndex <= 0) return;
    const newIds = [...allActivityIds];
    [newIds[currentIndex - 1], newIds[currentIndex]] = [newIds[currentIndex], newIds[currentIndex - 1]];
    startReorderTransition(async () => {
      await reorderActivities({ activityIds: newIds });
    });
  }

  function handleMoveDown() {
    if (currentIndex >= allActivityIds.length - 1) return;
    const newIds = [...allActivityIds];
    [newIds[currentIndex + 1], newIds[currentIndex]] = [newIds[currentIndex], newIds[currentIndex + 1]];
    startReorderTransition(async () => {
      await reorderActivities({ activityIds: newIds });
    });
  }

  return (
    <>
      <div
        className={`flex items-center gap-3 px-4 py-3 bg-[#1A1A1A] rounded-xl transition-opacity ${activity.isArchived ? "opacity-50" : ""}`}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: activity.color ? `${activity.color}20` : "#7C4DFF20" }}
        >
          {activity.emoji ?? "⚡"}
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-white text-sm font-medium block truncate">{activity.name}</span>
          {activity.isArchived && <span className="text-xs text-zinc-500">アーカイブ済み</span>}
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={handleMoveUp}
            disabled={isReorderPending || currentIndex === 0}
            className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"
            aria-label="上に移動"
          >
            <ArrowUp size={14} />
          </button>
          <button
            onClick={handleMoveDown}
            disabled={isReorderPending || currentIndex === allActivityIds.length - 1}
            className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"
            aria-label="下に移動"
          >
            <ArrowDown size={14} />
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="p-1.5 text-zinc-500 hover:text-white transition-colors"
            aria-label="編集"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={handleArchive}
            disabled={isArchivePending}
            className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-50 transition-colors"
            aria-label={activity.isArchived ? "アーカイブ解除" : "アーカイブ"}
          >
            {activity.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
          </button>
        </div>
      </div>

      {showEditModal && <ActivityEditModal activity={activity} onClose={() => setShowEditModal(false)} />}
    </>
  );
}
