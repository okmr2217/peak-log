import { formatDayFull } from "@/lib/date-utils";
import { getDayType, getDateTextClassName } from "@/lib/day-type";

type Props = {
  date: string;
  children: React.ReactNode;
};

export function TimelineDayGroup({ date, children }: Props) {
  return (
    <div>
      <span className={`text-sm font-semibold tabular-nums block mb-1 px-1 ${getDateTextClassName(getDayType(date))}`}>
        {formatDayFull(date)}
      </span>
      {children}
    </div>
  );
}
