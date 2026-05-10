import type { FieldDistribution } from "@/server/queries/log";

type Props = {
  fieldStats: FieldDistribution[];
  color: string | null;
};

export function FieldDistributionSection({ fieldStats, color }: Props) {
  if (fieldStats.length === 0) return null;

  const barColor = color ?? "#7C4DFF";

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">フィールド統計</h2>
      <div className="space-y-5">
        {fieldStats.map((stat) => {
          const total = stat.distribution.reduce((sum, d) => sum + d.count, 0);
          return (
            <div key={stat.fieldId}>
              <p className="text-xs text-muted-foreground mb-2">{stat.fieldName}</p>
              <div className="space-y-1.5">
                {stat.distribution.map((d) => {
                  const pct = total > 0 ? (d.count / total) * 100 : 0;
                  return (
                    <div key={d.label} className="flex items-center gap-2">
                      <span className="text-xs text-foreground w-28 truncate shrink-0" title={d.label}>{d.label}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor, opacity: 0.7 }} />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground w-8 text-right shrink-0">{d.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
