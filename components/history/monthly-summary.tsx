import { type MonthlySummary } from "@/server/queries/log";
import { MonthNav } from "./month-nav";
import { formatPerformedAt } from "@/lib/date-utils";
import { Sparkles } from "lucide-react";

type Props = {
  summary: MonthlySummary;
  month: string;
  baseParams: string;
};

export function MonthlySummarySection({ summary, month, baseParams }: Props) {
  return (
    <section className="mb-2 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-600 uppercase tracking-wider font-medium">今月の概要</span>
        <MonthNav month={month} baseParams={baseParams} />
      </div>

      {summary.totalLogs === 0 ? (
        <div className="bg-[#1A1A1A] rounded-xl p-6 text-center">
          <p className="text-zinc-400 text-sm mb-1">この月の記録はまだありません</p>
          <p className="text-zinc-600 text-xs">記録すると、ここに月のまとめが表示されます</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="記録" value={summary.totalLogs} />
            <StatCard label="余韻あり" value={summary.reflectionCount} />
            <StatCard label="活動" value={summary.activityCount} />
          </div>

          {summary.topActivities.length > 0 && (
            <div className="bg-[#1A1A1A] rounded-xl p-4">
              <p className="text-xs text-zinc-500 mb-3">よく記録したこと</p>
              <ul className="space-y-2">
                {summary.topActivities.map((a) => (
                  <li key={a.activityId} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-zinc-200">
                      {a.emoji && <span>{a.emoji}</span>}
                      <span>{a.name}</span>
                    </span>
                    <span className="text-xs text-zinc-600">{a.count}件</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.peakLogs.length > 0 && (
            <div className="bg-[#1A1A1A] rounded-xl p-4">
              <p className="text-xs text-zinc-500 mb-3">今月のピーク</p>
              <div className="space-y-3">
                {summary.peakLogs.map((log, i) => (
                  <div key={log.id}>
                    {i > 0 && <div className="border-t border-zinc-800 mb-3" />}
                    <PeakLogItem log={log} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#1A1A1A] rounded-xl p-3 text-center">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-zinc-600 mt-0.5">{label}</div>
    </div>
  );
}

function PeakLogItem({ log }: { log: MonthlySummary["peakLogs"][number] }) {
  const r = log.reflection;
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm text-zinc-200 flex-1 min-w-0">
          {log.activity.emoji && <span className="shrink-0">{log.activity.emoji}</span>}
          <span className="truncate">{log.activity.name}</span>
          {r && <Sparkles size={11} className="text-[#7C4DFF] shrink-0" />}
        </span>
        <span className="text-xs text-zinc-600 shrink-0">{formatPerformedAt(log.performedAt)}</span>
      </div>
      {r?.excitement != null && (
        <div className="flex gap-1 mt-1.5">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < r.excitement! ? "bg-[#7C4DFF]" : "bg-zinc-800"}`} />
          ))}
        </div>
      )}
      {r?.note && <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed">{r.note}</p>}
    </div>
  );
}
