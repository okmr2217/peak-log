import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";
import { differenceInCalendarDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import type { ActivityDetail, RecentLog } from "@/server/queries/activity";
import { formatPerformedAt } from "@/lib/date-utils";

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

function RatingDots({ value, activeClass }: { value: number; activeClass: string }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`inline-block w-1.5 h-1.5 rounded-full ${i < value ? activeClass : "bg-white/8"}`} />
      ))}
    </div>
  );
}

function RecentLogItem({ log }: { log: RecentLog }) {
  const { reflection } = log;
  const hasReflection = !!reflection;

  return (
    <div className="py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-zinc-300 text-sm tabular-nums">{formatPerformedAt(log.performedAt)}</span>
        {hasReflection && <Sparkles size={10} className="text-[#00E5FF]/50" aria-label="余韻あり" />}
      </div>

      {reflection && (
        <div className="space-y-1.5 mt-1.5">
          {(reflection.excitement != null || reflection.achievement != null || reflection.wantAgain != null) && (
            <div className="flex items-center gap-3 flex-wrap">
              {reflection.excitement != null && (
                <div className="flex items-center gap-1.5">
                  <RatingDots value={reflection.excitement} activeClass="bg-[#7C4DFF]" />
                  <span className="text-zinc-600 text-[11px]">興奮</span>
                </div>
              )}
              {reflection.achievement != null && (
                <div className="flex items-center gap-1.5">
                  <RatingDots value={reflection.achievement} activeClass="bg-[#00E5FF]/70" />
                  <span className="text-zinc-600 text-[11px]">達成感</span>
                </div>
              )}
              {reflection.wantAgain != null && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    reflection.wantAgain ? "bg-[#7C4DFF]/15 text-[#7C4DFF]/80" : "bg-white/5 text-zinc-600"
                  }`}
                >
                  {reflection.wantAgain ? "またやりたい" : "今回は十分"}
                </span>
              )}
            </div>
          )}
          {reflection.note && (
            <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 whitespace-pre-wrap">{reflection.note}</p>
          )}
        </div>
      )}
    </div>
  );
}

interface Props {
  detail: ActivityDetail;
}

export function ActivityDetailView({ detail }: Props) {
  const { stats, recentLogs } = detail;
  const accentColor = detail.color;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
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
            <span className="text-xs text-zinc-600">アーカイブ済み</span>
          ) : (
            <span className="text-xs text-zinc-600">この Activity の記録と統計を確認できます</span>
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
          <h2 className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">最近の記録</h2>
          <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 px-4">
            {recentLogs.map((log) => (
              <RecentLogItem key={log.id} log={log} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
