"use client";

import { useState, useEffect, useTransition } from "react";
import { subDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { fetchMoreDays } from "@/server/actions/log";
import type { HistoryDayItem, LogItem } from "@/server/queries/log";
import { buildDayRange, formatDayFull, formatTime } from "@/lib/date-utils";
import { getDayType, getDateTextClassName } from "@/lib/day-type";
import { LogDetailModal } from "@/components/log/log-detail-modal";
import { EditLogModal } from "@/components/log/edit-log-modal";

const TZ = "Asia/Tokyo";

type Props = {
  initialItems: HistoryDayItem[];
  oldestDate: string;
  hasMore: boolean;
};

type ChipProps = {
  log: LogItem;
};

function CompactLogChip({ log }: ChipProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [performedAt, setPerformedAt] = useState(log.performedAt);
  const [stars, setStars] = useState(log.reflection?.stars ?? null);
  const [note, setNote] = useState(log.reflection?.note ?? null);

  const color = log.activity.color;

  function handleLogEdited(data: { newDate: Date; stars: number | null; note: string | null }) {
    setPerformedAt(data.newDate);
    setStars(data.stars);
    setNote(data.note);
  }

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => setIsDetailOpen(true)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-sm shrink-0 hover:brightness-110 transition-all"
        style={{
          background: color ? `${color}22` : "var(--surface-overlay)",
          borderColor: color ? `${color}44` : "hsl(var(--border))",
        }}
      >
        <span className="text-sm leading-none">{log.activity.emoji ?? "·"}</span>
        <span className="tabular-nums text-sm leading-none font-semibold">{formatTime(performedAt)}</span>
      </button>

      {note && (
        <div className="absolute bottom-full left-0 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
          <div className="bg-card border border-border rounded-lg px-2.5 py-1.5 shadow-lg max-w-[200px] text-xs text-foreground leading-relaxed whitespace-pre-wrap break-words">
            {note}
          </div>
        </div>
      )}

      <LogDetailModal
        activity={log.activity}
        performedAt={performedAt}
        stars={stars}
        note={note}
        createdAt={log.createdAt}
        updatedAt={log.updatedAt}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEditRequest={() => {
          setIsDetailOpen(false);
          setIsEditOpen(true);
        }}
      />

      <EditLogModal
        logId={log.id}
        performedAt={performedAt}
        initialStars={stars}
        initialNote={note}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSaved={handleLogEdited}
      />
    </div>
  );
}

export function CompactTimelineList({ initialItems, oldestDate, hasMore: initialHasMore }: Props) {
  const [dayItems, setDayItems] = useState<HistoryDayItem[]>(initialItems);
  const [oldest, setOldest] = useState(oldestDate);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setDayItems(initialItems);
    setOldest(oldestDate);
    setHasMore(initialHasMore);
  }, [initialItems, oldestDate, initialHasMore]);

  function loadMore() {
    startTransition(async () => {
      const { logs, hasMore: nextHasMore } = await fetchMoreDays({ before: oldest });
      const to = fromZonedTime(oldest, TZ);
      const from = subDays(to, 30);
      const newItems = buildDayRange(logs as LogItem[], from, to);
      setDayItems((prev) => [...prev, ...newItems]);
      setOldest(formatInTimeZone(from, TZ, "yyyy-MM-dd"));
      setHasMore(nextHasMore);
    });
  }

  const daysWithLogs = dayItems.filter((d) => d.logs.length > 0);

  if (daysWithLogs.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">この期間のピークはありません</p>
      </div>
    );
  }

  return (
    <>
      <div>
        {daysWithLogs.map(({ date, logs }) => (
          <div key={date} className="flex flex-col gap-1 py-1.5 px-1">
            <span className={`text-sm font-semibold tabular-nums ${getDateTextClassName(getDayType(date))}`}>
              {formatDayFull(date)}
            </span>
            <span className="flex flex-wrap gap-x-1.5 gap-y-2">
              {logs.map((log) => (
                <CompactLogChip key={log.id} log={log} />
              ))}
            </span>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isPending}
            className="px-5 py-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors border border-border hover:border-muted-foreground/30 rounded-full"
          >
            {isPending ? "読み込み中..." : "さらに前を見る"}
          </button>
        </div>
      )}
    </>
  );
}
