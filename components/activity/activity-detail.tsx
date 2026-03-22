import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { differenceInCalendarDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import type { ActivityDetail, RecentLog } from "@/server/queries/activity";
import { formatPerformedAt, formatDayFull, formatTime } from "@/lib/date-utils";
import { getDayType, getDateTextClassName } from "@/lib/day-type";

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

function groupByDate(logs: RecentLog[]): Array<{ date: string; logs: RecentLog[] }> {
  const map = new Map<string, RecentLog[]>();
  for (const log of logs) {
    const date = formatInTimeZone(log.performedAt, TZ, "yyyy-MM-dd");
    const existing = map.get(date);
    if (existing) existing.push(log);
    else map.set(date, [log]);
  }
  return Array.from(map.entries()).map(([date, groupLogs]) => ({ date, logs: groupLogs }));
}

function RecentLogItem({ log, emoji, color }: { log: RecentLog; emoji: string | null; color: string | null }) {
  const { reflection } = log;

  return (
    <div className="flex items-start gap-3 pl-4 border-l-2 border-zinc-800 py-2">
      <span className="text-xs tabular-nums text-zinc-500 shrink-0 mt-0.5 w-10">{formatTime(log.performedAt)}</span>
      <span
        className="w-6 h-6 rounded-md flex items-center justify-center text-sm leading-none shrink-0"
        style={{ backgroundColor: color ? `${color}28` : "rgba(255,255,255,0.07)" }}
      >
        {emoji ?? "·"}
      </span>
      {reflection?.note && <p className="text-xs text-zinc-500 truncate mt-0.5">{reflection.note}</p>}
    </div>
  );
}

interface Props {
  detail: ActivityDetail;
}

export function ActivityDetailView({ detail }: Props) {
  const { stats, recentLogs } = detail;
  const accentColor = detail.color;
  const groupedLogs = groupByDate(recentLogs);

  return (
    <div className="px-4 pt-4 pb-6 max-w-lg mx-auto">
      {/* 戻るボタン */}
      <Link
        href="/activities"
        className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors text-sm mb-6"
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
          <h1 className="text-xl font-bold text-white">{detail.name}</h1>
          {detail.isArchived ? (
            <span className="text-xs text-zinc-600 mt-1.5 block">アーカイブ済み</span>
          ) : (
            <span className="text-xs text-zinc-600 mt-1.5 block">この Activity の記録と統計を確認できます</span>
          )}
        </div>
      </div>

      {/* 統計カード */}
      <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 p-4 mb-6">
        {stats.totalCount === 0 ? (
          <p className="text-zinc-600 text-sm text-center py-2">まだ記録がありません</p>
        ) : (
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <div>
              <p className="text-zinc-600 text-[11px] mb-0.5">累計</p>
              <p className="text-white font-semibold text-lg tabular-nums">{stats.totalCount}<span className="text-zinc-500 text-sm font-normal ml-0.5">回</span></p>
            </div>
            {stats.lastPerformedAt && (
              <div>
                <p className="text-zinc-600 text-[11px] mb-0.5">最後の記録</p>
                <p className="text-white font-semibold text-lg">
                  {formatLastPerformedAt(stats.lastPerformedAt)}
                  <span className="text-zinc-600 text-xs font-normal ml-1.5">
                    {formatPerformedAt(stats.lastPerformedAt)}
                  </span>
                </p>
              </div>
            )}
            {stats.avgIntervalDays != null && (
              <div>
                <p className="text-zinc-600 text-[11px] mb-0.5">だいたいの間隔</p>
                <p className="text-white font-semibold text-lg">{formatAvgInterval(stats.avgIntervalDays)}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 最近の記録 */}
      {recentLogs.length > 0 && (
        <div>
          <h2 className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-4">最近の記録</h2>
          <div className="space-y-6">
            {groupedLogs.map(({ date, logs }) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-medium tabular-nums shrink-0 ${getDateTextClassName(getDayType(date))}`}>
                    {formatDayFull(date)}
                  </span>
                  <div className="flex-1 h-px bg-white/[0.04]" />
                </div>
                <div className="space-y-0.5">
                  {logs.map((log) => (
                    <RecentLogItem key={log.id} log={log} emoji={detail.emoji} color={accentColor} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
