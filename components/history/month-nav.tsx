import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  month: string; // "YYYY-MM"
  baseParams: string; // query string without 'month'
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

export function MonthNav({ month, baseParams }: Props) {
  const prevMonth = shiftMonth(month, -1);
  const nextMonth = shiftMonth(month, 1);
  const isCurrentMonth = month === getCurrentMonth();
  const label = formatMonthLabel(month);

  const buildHref = (m: string) => {
    const params = new URLSearchParams(baseParams || "");
    params.set("month", m);
    return `/history?${params.toString()}`;
  };

  return (
    <div className="flex items-center gap-1">
      <Link
        href={buildHref(prevMonth)}
        className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-white"
        aria-label="前の月"
      >
        <ChevronLeft size={14} />
      </Link>
      <span className="text-white font-medium text-sm min-w-[88px] text-center">{label}</span>
      {isCurrentMonth ? (
        <span className="p-1.5 text-zinc-800" aria-disabled="true">
          <ChevronRight size={14} />
        </span>
      ) : (
        <Link
          href={buildHref(nextMonth)}
          className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-white"
          aria-label="次の月"
        >
          <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}
