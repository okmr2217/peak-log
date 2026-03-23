import { type MonthlySummary } from "@/server/queries/log";

type Props = {
  summary: MonthlySummary;
};

export function MonthlySummarySection({ summary }: Props) {
  return (
    <section className="mb-2 space-y-3">
      <span className="text-sm text-zinc-400 uppercase tracking-wider font-medium">今月の概要</span>

      {summary.totalLogs === 0 ? (
        <div className="bg-[#1A1A1A] rounded-xl p-6 text-center border border-white/[0.05]">
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
            <div className="bg-[#1A1A1A] rounded-xl p-4 border border-white/[0.05]">
              <p className="text-sm text-zinc-400 mb-3">よく記録したこと</p>
              <ul className="space-y-2.5">
                {summary.topActivities.map((a) => (
                  <li key={a.activityId} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-zinc-200">
                      {a.emoji && <span>{a.emoji}</span>}
                      <span>{a.name}</span>
                    </span>
                    <span className="text-sm text-zinc-400">{a.count}件</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </>
      )}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#1A1A1A] rounded-xl p-4 text-center border border-white/[0.05]">
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-sm text-zinc-400 mt-1">{label}</div>
    </div>
  );
}
