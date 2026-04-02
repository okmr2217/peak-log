"use client";

import { useState, useTransition } from "react";
import { Pencil, Archive, ArchiveRestore, GripVertical } from "lucide-react";
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

  const color = activity.isArchived ? null : activity.color;
  const cardStyle = activity.isArchived
    ? {
        background: "hsl(var(--card))",
        borderColor: "hsl(var(--border))",
        borderStyle: "dashed" as const,
      }
    : {
        background: color
          ? `radial-gradient(ellipse at 0% 20%, ${color}15 0%, transparent 55%), hsl(var(--card))`
          : "hsl(var(--card))",
        borderColor: color ? `${color}38` : "hsl(var(--border))",
        boxShadow: color ? `0 4px 18px -8px ${color}38` : undefined,
      };

  return (
    <>
      <div
        ref={setNodeRef}
        style={{ ...cardStyle, ...style }}
        className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl border transition-opacity ${activity.isArchived ? "opacity-50 grayscale" : ""}`}
      >
        <button
          {...attributes}
          {...listeners}
          className="touch-none cursor-grab active:cursor-grabbing p-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors flex-shrink-0"
          aria-label="ドラッグして並び替え"
        >
          <GripVertical size={16} />
        </button>

        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: color ? `${color}28` : "hsl(var(--primary) / 0.13)" }}
        >
          {activity.emoji ?? "⚡"}
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-foreground text-sm font-semibold block truncate">{activity.name}</span>
          <div className="flex items-center gap-2 mt-1">
            {activity.isArchived && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                アーカイブ済み
              </span>
            )}
            {activity.stats.totalCount > 0 ? (
              <>
                <span className="text-[11px] text-muted-foreground tabular-nums">{activity.stats.totalCount}回</span>
                {activity.stats.lastPerformedAt && (
                  <>
                    <span className="text-muted-foreground/40 text-[11px]">·</span>
                    <span className="text-[11px] text-muted-foreground/60">
                      {formatLastPerformedShort(activity.stats.lastPerformedAt)}
                    </span>
                  </>
                )}
              </>
            ) : (
              <span className="text-[11px] text-muted-foreground/40">まだ記録なし</span>
            )}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={() => setShowEditModal(true)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            aria-label="編集"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={handleArchive}
            disabled={isArchivePending}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg disabled:opacity-50 transition-colors"
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
