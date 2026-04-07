"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { differenceInCalendarDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import type { ActivityDetail, RecentLog } from "@/server/queries/activity";
import type { LogItem } from "@/server/queries/log";
import { formatPerformedAt } from "@/lib/date-utils";
import { TimelineItem } from "@/components/history/timeline-item";

const TZ = "Asia/Tokyo";

function formatLastPerformedAt(date: Date): string {
  const todayJST = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
  const dateJST = formatInTimeZone(date, TZ, "yyyy-MM-dd");
  const diffDays = differenceInCalendarDays(new Date(todayJST), new Date(dateJST));

  if (diffDays === 0) return "今日";
  if (diffDays === 1) return "昨日";
  if (diffDays < 7) return `${diffDays}日前`;
  return formatInTimeZone(date, TZ, "M/d");
}

function formatAvgInterval(days: number): string {
  const rounded = Math.round(days * 10) / 10;
  return rounded % 1 === 0 ? `${rounded}日ごと` : `${rounded.toFixed(1)}日ごと`;
}

type LogEditedPayload = {
  newDate: Date;
  stars: number | null;
  note: string | null;
};

interface Props {
  detail: ActivityDetail;
}

export function ActivityDetailView({ detail }: Props) {
  const { stats } = detail;
  const accentColor = detail.color;

  const [recentLogs, setRecentLogs] = useState<RecentLog[]>(detail.recentLogs);

  function handleLogEdited(logId: string, data: LogEditedPayload) {
    setRecentLogs((prev) =>
      prev.map((log) => {
        if (log.id !== logId) return log;
        const reflection =
          data.stars != null || data.note != null
            ? { id: log.reflection?.id ?? "", stars: data.stars, note: data.note }
            : null;
        return { ...log, performedAt: data.newDate, reflection };
      }),
    );
  }

  function toLogItem(log: RecentLog): LogItem {
    return {
      id: log.id,
      performedAt: log.performedAt,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
      activity: {
        id: detail.id,
        name: detail.name,
        emoji: detail.emoji,
        color: detail.color,
      },
      reflection: log.reflection,
    };
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* 戻るボタン */}
      <Link
        href="/activities"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm mb-6"
      >
        <ChevronLeft size={16} />
        活動一覧
      </Link>

      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: accentColor ? `${accentColor}18` : "#7C4DFF18" }}
        >
          {detail.emoji ?? "⚡"}
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{detail.name}</h1>
          {detail.isArchived ? (
            <span className="text-xs text-muted-foreground/60 mt-1.5 block">アーカイブ済み</span>
          ) : (
            <span className="text-xs text-muted-foreground mt-1.5 block">この Activity の記録と統計を確認できます</span>
          )}
        </div>
      </div>

      {/* 統計カード */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-6">
        {stats.totalCount === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-2">まだ記録がありません</p>
        ) : (
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <div>
              <p className="text-muted-foreground/60 text-[11px] mb-0.5">累計</p>
              <p className="text-foreground font-semibold text-lg tabular-nums">
                {stats.totalCount}
                <span className="text-muted-foreground text-sm font-normal ml-0.5">回</span>
              </p>
            </div>
            {stats.lastPerformedAt && (
              <div>
                <p className="text-muted-foreground/60 text-[11px] mb-0.5">最後の記録</p>
                <p className="text-foreground font-semibold text-lg">
                  {formatLastPerformedAt(stats.lastPerformedAt)}
                  <span className="text-muted-foreground text-xs font-normal ml-1.5">{formatPerformedAt(stats.lastPerformedAt)}</span>
                </p>
              </div>
            )}
            {stats.avgIntervalDays != null && (
              <div>
                <p className="text-muted-foreground/60 text-[11px] mb-0.5">だいたいの間隔</p>
                <p className="text-foreground font-semibold text-lg">{formatAvgInterval(stats.avgIntervalDays)}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 最近の記録 */}
      {recentLogs.length > 0 && (
        <div>
          <h2 className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-4">最近の記録</h2>
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <TimelineItem
                key={log.id}
                log={toLogItem(log)}
                onLogEdited={handleLogEdited}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
