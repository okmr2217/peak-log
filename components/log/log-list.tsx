import { LogCard } from "./log-card";

type Log = {
  id: string;
  performedAt: Date;
  activity: {
    id: string;
    name: string;
    emoji: string | null;
    color: string | null;
  };
  reflection: {
    id: string;
    excitement: number | null;
    achievement: number | null;
    wantAgain: boolean | null;
    note: string | null;
  } | null;
};

type LogListProps = {
  logs: Log[];
};

export function LogList({ logs }: LogListProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-zinc-300 text-sm font-medium mb-1">まだ記録がありません</p>
        <p className="text-zinc-600 text-xs">今日のピークをひとつ残してみよう</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {logs.map((log) => (
        <LogCard key={log.id} log={log} />
      ))}
    </div>
  );
}
