"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, Archive, ArchiveRestore, ArrowUp, ArrowDown } from "lucide-react";
import { archiveActivity, reorderActivities } from "@/server/actions/activity";
import { ActivityEditModal } from "./activity-edit-modal";
import dayjs from "dayjs";

interface Activity {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  sortOrder: number;
  isArchived: boolean;
  stats: {
    totalCount: number;
    lastPerformedAt: Date | null;
  };
}

interface Props {
  activity: Activity;
  allActivityIds: string[];
}

function formatLastPerformedShort(date: Date): string {
  const d = dayjs(date);
  const today = dayjs().startOf("day");
  const diffDays = today.diff(d.startOf("day"), "day");

  if (diffDays === 0) return "今日";
  if (diffDays === 1) return "昨日";
  if (diffDays < 7) return `${diffDays}日前`;
  return d.format("M/D");
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
        className={`flex items-center gap-3 px-4 py-3.5 bg-[#1A1A1A] rounded-2xl border border-white/5 transition-opacity ${activity.isArchived ? "opacity-40" : ""}`}
      >
        {/* 情報エリア: タップで詳細へ */}
        <Link
          href={`/activities/${activity.id}`}
          className="flex items-center gap-3 flex-1 min-w-0 group"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: activity.color ? `${activity.color}18` : "#7C4DFF18" }}
          >
            {activity.emoji ?? "⚡"}
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-white text-sm font-medium block truncate group-hover:text-zinc-200 transition-colors">
              {activity.name}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              {activity.isArchived && (
                <span className="text-[11px] text-zinc-600">アーカイブ済み</span>
              )}
              {activity.stats.totalCount > 0 ? (
                <>
                  <span className="text-[11px] text-zinc-500 tabular-nums">{activity.stats.totalCount}回</span>
                  {activity.stats.lastPerformedAt && (
                    <>
                      <span className="text-zinc-700 text-[11px]">·</span>
                      <span className="text-[11px] text-zinc-600">
                        {formatLastPerformedShort(activity.stats.lastPerformedAt)}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-[11px] text-zinc-700">まだ記録なし</span>
              )}
            </div>
          </div>
        </Link>

        {/* アクションボタン */}
        <div className="flex items-center flex-shrink-0">
          <button
            onClick={handleMoveUp}
            disabled={isReorderPending || currentIndex === 0}
            className="p-2 text-zinc-600 hover:text-zinc-300 disabled:opacity-20 transition-colors"
            aria-label="上に移動"
          >
            <ArrowUp size={14} />
          </button>
          <button
            onClick={handleMoveDown}
            disabled={isReorderPending || currentIndex === allActivityIds.length - 1}
            className="p-2 text-zinc-600 hover:text-zinc-300 disabled:opacity-20 transition-colors"
            aria-label="下に移動"
          >
            <ArrowDown size={14} />
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="p-2 text-zinc-600 hover:text-zinc-300 transition-colors"
            aria-label="編集"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={handleArchive}
            disabled={isArchivePending}
            className="p-2 text-zinc-600 hover:text-zinc-300 disabled:opacity-50 transition-colors"
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
