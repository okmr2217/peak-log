import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  month: string; // "YYYY-MM"
  baseParams: string; // query string without 'month'
  basePath?: string; // default "/history"
};

function shiftMonth(month: string, delta: number): string {
  const [yearStr, monthStr] = month.split("-");
  const d = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(month: string): string {
  const [yearStr, monthStr] = month.split("-");
  return `${yearStr}年${parseInt(monthStr, 10)}月`;
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function MonthNav({ month, baseParams, basePath = "/history" }: Props) {
  const prevMonth = shiftMonth(month, -1);
  const nextMonth = shiftMonth(month, 1);
  const isCurrentMonth = month === getCurrentMonth();
  const label = formatMonthLabel(month);

  const buildHref = (m: string) => {
    const params = new URLSearchParams(baseParams || "");
    params.set("month", m);
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="flex items-center gap-0.5">
      <Link
        href={buildHref(prevMonth)}
        className="h-8 w-8 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-colors"
        aria-label="前の月"
      >
        <ChevronLeft size={15} />
      </Link>
      <span className="text-foreground font-medium text-sm min-w-[80px] text-center">{label}</span>
      {isCurrentMonth ? (
        <span className="h-8 w-8 flex items-center justify-center text-muted-foreground/30" aria-disabled="true">
          <ChevronRight size={15} />
        </span>
      ) : (
        <Link
          href={buildHref(nextMonth)}
          className="h-8 w-8 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-colors"
          aria-label="次の月"
        >
          <ChevronRight size={15} />
        </Link>
      )}
    </div>
  );
}
