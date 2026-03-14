"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, Archive, ArchiveRestore, ArrowUp, ArrowDown, BarChart2 } from "lucide-react";
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
        className={`flex flex-col px-4 py-4 bg-[#1A1A1A] rounded-2xl border border-white/[0.06] transition-opacity ${activity.isArchived ? "opacity-50" : ""}`}
      >
        {/* 情報エリア */}
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ backgroundColor: activity.color ? `${activity.color}1A` : "#7C4DFF1A" }}
          >
            {activity.emoji ?? "⚡"}
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-white text-sm font-semibold block truncate">{activity.name}</span>
            <div className="flex items-center gap-2 mt-1">
              {activity.isArchived && <span className="text-[11px] text-zinc-600">アーカイブ済み</span>}
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

          {/* 並び替えボタン */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={handleMoveUp}
              disabled={isReorderPending || currentIndex === 0}
              className="p-1.5 text-zinc-700 hover:text-zinc-400 disabled:opacity-20 transition-colors"
              aria-label="上に移動"
            >
              <ArrowUp size={13} />
            </button>
            <button
              onClick={handleMoveDown}
              disabled={isReorderPending || currentIndex === allActivityIds.length - 1}
              className="p-1.5 text-zinc-700 hover:text-zinc-400 disabled:opacity-20 transition-colors"
              aria-label="下に移動"
            >
              <ArrowDown size={13} />
            </button>
          </div>
        </div>

        {/* アクションボタン行 */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/[0.06]">
          <Link
            href={`/activities/${activity.id}`}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <BarChart2 size={12} />
            <span>統計</span>
          </Link>
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <Pencil size={12} />
            <span>編集</span>
          </button>
          <button
            onClick={handleArchive}
            disabled={isArchivePending}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 disabled:opacity-50 transition-colors ml-auto"
          >
            {activity.isArchived ? <ArchiveRestore size={12} /> : <Archive size={12} />}
            <span>{activity.isArchived ? "解除" : "アーカイブ"}</span>
          </button>
        </div>
      </div>

      {showEditModal && <ActivityEditModal activity={activity} onClose={() => setShowEditModal(false)} />}
    </>
  );
}
