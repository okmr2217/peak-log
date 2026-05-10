import type { LogItem, LogEditedPayload } from "@/server/queries/log";
import { LogCard } from "@/components/log/log-card";

type Props = {
  logs: LogItem[];
  onLogEdited: (logId: string, data: LogEditedPayload) => void;
};

export function LogDayCards({ logs, onLogEdited }: Props) {
  return (
    <div className="space-y-1.5">
      {[...logs].reverse().map((log) => (
        <LogCard key={log.id} log={log} onLogEdited={onLogEdited} />
      ))}
    </div>
  );
}
