"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { Pencil, Archive, ArchiveRestore, ArrowUp, ArrowDown, BarChart2, MoreVertical } from "lucide-react";
import { differenceInCalendarDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { archiveActivity, reorderActivities } from "@/server/actions/activity";
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
  allActivityIds: string[];
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

export function ActivityItem({ activity, allActivityIds }: Props) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isArchivePending, startArchiveTransition] = useTransition();
  const [isReorderPending, startReorderTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  const currentIndex = allActivityIds.indexOf(activity.id);

  useEffect(() => {
    if (!isMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

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
        className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl border transition-opacity ${activity.isArchived ? "opacity-50" : ""}`}
        style={cardStyle}
      >
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

        {/* 並び替え + 統計 + 3点メニュー */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={handleMoveUp}
            disabled={isReorderPending || currentIndex === 0}
            className="p-2 text-zinc-700 hover:text-zinc-400 disabled:opacity-20 transition-colors"
            aria-label="上に移動"
          >
            <ArrowUp size={15} />
          </button>
          <button
            onClick={handleMoveDown}
            disabled={isReorderPending || currentIndex === allActivityIds.length - 1}
            className="p-2 text-zinc-700 hover:text-zinc-400 disabled:opacity-20 transition-colors"
            aria-label="下に移動"
          >
            <ArrowDown size={15} />
          </button>
          <Link
            href={`/activities/${activity.id}`}
            className="p-2 text-zinc-600 hover:text-zinc-400 hover:bg-white/5 rounded-lg transition-colors"
            aria-label="統計を見る"
          >
            <BarChart2 size={16} />
          </Link>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="p-2 text-zinc-600 hover:text-zinc-400 hover:bg-white/5 rounded-lg transition-colors"
              aria-label="操作メニュー"
            >
              <MoreVertical size={16} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-[#1F1F1F] border border-white/10 rounded-xl shadow-xl z-50 min-w-[148px] overflow-hidden">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowEditModal(true);
                  }}
                  className="flex items-center gap-2 w-full px-3.5 py-2.5 text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <Pencil size={12} className="text-zinc-500 shrink-0" />
                  編集
                </button>
                <div className="border-t border-white/[0.06] mx-2" />
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleArchive();
                  }}
                  disabled={isArchivePending}
                  className="flex items-center gap-2 w-full px-3.5 py-2.5 text-xs text-zinc-300 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-colors text-left"
                >
                  {activity.isArchived ? (
                    <ArchiveRestore size={12} className="text-zinc-500 shrink-0" />
                  ) : (
                    <Archive size={12} className="text-zinc-500 shrink-0" />
                  )}
                  {activity.isArchived ? "アーカイブを解除" : "アーカイブ"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditModal && <ActivityEditModal activity={activity} onClose={() => setShowEditModal(false)} />}
    </>
  );
}
