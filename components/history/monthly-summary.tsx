import { type MonthlySummary } from "@/server/queries/log";

type Props = {
  summary: MonthlySummary;
};

export function MonthlySummarySection({ summary }: Props) {
  return (
    <section className="mb-2 space-y-3">
      <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">今月の概要</span>

      {summary.totalLogs === 0 ? (
        <div className="bg-card rounded-xl p-6 text-center border border-border">
          <p className="text-muted-foreground text-sm mb-1">この月の記録はまだありません</p>
          <p className="text-muted-foreground/60 text-xs">記録すると、ここに月のまとめが表示されます</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="記録" value={summary.totalLogs} />
            <StatCard label="余韻あり" value={summary.reflectionCount} />
            <StatCard label="活動" value={summary.activityCount} />
          </div>

          {summary.topActivities.length > 0 && (
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-3">よく記録したこと</p>
              <ul className="space-y-2.5">
                {summary.topActivities.map((a) => (
                  <li key={a.activityId} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-foreground">
                      {a.emoji && <span>{a.emoji}</span>}
                      <span>{a.name}</span>
                    </span>
                    <span className="text-sm text-muted-foreground">{a.count}件</span>
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
    <div className="bg-card rounded-xl p-4 text-center border border-border">
      <div className="text-3xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
