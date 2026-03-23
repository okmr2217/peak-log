"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, Archive, ArchiveRestore, BarChart2, GripVertical } from "lucide-react";
import { differenceInCalendarDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { archiveActivity } from "@/server/actions/activity";
import { ActivityEditModal } from "./activity-edit-modal";

interface Activity {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  description: string | null;
  sortOrder: number;
  isArchived: boolean;
  stats: {
    totalCount: number;
    lastPerformedAt: Date | null;
  };
}

interface Props {
  activity: Activity;
}

const TZ = "Asia/Tokyo";

function formatLastPerformedShort(date: Date): string {
  const todayJST = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
  const dateJST = formatInTimeZone(date, TZ, "yyyy-MM-dd");
  const diffDays = differenceInCalendarDays(new Date(todayJST), new Date(dateJST));

  if (diffDays === 0) return "今日";
  if (diffDays === 1) return "昨日";
  if (diffDays < 7) return `${diffDays}日前`;
  return formatInTimeZone(date, TZ, "M/d");
}

export function ActivityItem({ activity }: Props) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isArchivePending, startArchiveTransition] = useTransition();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  function handleArchive() {
    startArchiveTransition(async () => {
      await archiveActivity({ activityId: activity.id, isArchived: !activity.isArchived });
    });
  }

  const color = activity.color;
  const cardStyle = {
    background: color
      ? `radial-gradient(ellipse at 0% 20%, ${color}15 0%, transparent 55%), #1A1A1A`
      : "#1A1A1A",
    borderColor: color ? `${color}38` : "rgba(255,255,255,0.08)",
    boxShadow: color
      ? `0 4px 18px -8px ${color}38, inset 0 1px 0 rgba(255,255,255,0.06)`
      : `0 2px 10px -4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={{ ...cardStyle, ...style }}
        className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl border transition-opacity ${activity.isArchived ? "opacity-50" : ""}`}
      >
        <button
          {...attributes}
          {...listeners}
          className="touch-none cursor-grab active:cursor-grabbing p-1 text-zinc-700 hover:text-zinc-400 transition-colors flex-shrink-0"
          aria-label="ドラッグして並び替え"
        >
          <GripVertical size={16} />
        </button>

        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: color ? `${color}28` : "#7C4DFF22" }}
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

        {/* アクションボタン */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Link
            href={`/activities/${activity.id}`}
            className="p-2 text-zinc-600 hover:text-zinc-400 hover:bg-white/5 rounded-lg transition-colors"
            aria-label="統計を見る"
          >
            <BarChart2 size={16} />
          </Link>
          <button
            onClick={() => setShowEditModal(true)}
            className="p-2 text-zinc-600 hover:text-zinc-400 hover:bg-white/5 rounded-lg transition-colors"
            aria-label="編集"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={handleArchive}
            disabled={isArchivePending}
            className="p-2 text-zinc-600 hover:text-zinc-400 hover:bg-white/5 rounded-lg disabled:opacity-50 transition-colors"
            aria-label={activity.isArchived ? "アーカイブを解除" : "アーカイブ"}
          >
            {activity.isArchived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
          </button>
        </div>
      </div>

      {showEditModal && <ActivityEditModal activity={activity} onClose={() => setShowEditModal(false)} />}
    </>
  );
}
