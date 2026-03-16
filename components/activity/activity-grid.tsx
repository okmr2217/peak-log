"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ActivityButton } from "./activity-button";
import { CreateLogModal } from "@/components/log/create-log-modal";
import { ReflectionModal } from "@/components/reflection/reflection-modal";

type Activity = {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
};

type Toast =
  | { type: "success"; logId: string; hasReflection: boolean }
  | { type: "error"; message: string };

type ActivityGridProps = {
  activities: Activity[];
};

export function ActivityGrid({ activities }: ActivityGridProps) {
  const [pendingActivity, setPendingActivity] = useState<Activity | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [reflectionLogId, setReflectionLogId] = useState<string | null>(null);

  const handleActivityTap = useCallback(
    async (activityId: string) => {
      const activity = activities.find((a) => a.id === activityId);
      if (activity) setPendingActivity(activity);
    },
    [activities],
  );

  const handleLogCreated = useCallback((logId: string, hasReflection: boolean) => {
    setToast({ type: "success", logId, hasReflection });
    setTimeout(() => setToast(null), 4000);
  }, []);

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <p className="text-white font-semibold mb-1.5">まだ活動がありません</p>
        <p className="text-zinc-500 text-sm mb-5">最初の活動を追加して、ピークを記録しよう</p>
        <Link
          href="/activities"
          className="text-sm bg-[#7C4DFF] text-white px-4 py-2 rounded-xl hover:bg-[#6B3FE0] active:scale-95 transition-all"
        >
          活動を追加
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-2 gap-3">
        {activities.map((activity) => (
          <ActivityButton key={activity.id} activity={activity} onQuickLog={handleActivityTap} />
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-20 left-4 right-4 z-50 flex justify-center pointer-events-none">
          <div
            className={`
              pointer-events-auto rounded-2xl px-4 py-3.5 shadow-2xl
              flex items-center justify-between gap-4 max-w-sm w-full
              ${toast.type === "success" ? "bg-[#232323] border border-white/8" : "bg-red-950/90 border border-red-700/40"}
            `}
          >
            {toast.type === "success" ? (
              <>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C4DFF] flex-shrink-0" />
                  <span className="text-white text-sm font-medium">記録しました</span>
                </div>
                {!toast.hasReflection && (
                  <button
                    type="button"
                    onClick={() => {
                      setReflectionLogId(toast.logId);
                      setToast(null);
                    }}
                    className="text-[#00E5FF] text-xs font-medium hover:opacity-80 transition-opacity shrink-0 px-3 py-1.5 rounded-lg bg-[#00E5FF]/10"
                  >
                    余韻を追加
                  </button>
                )}
              </>
            ) : (
              <span className="text-red-300 text-sm">{toast.message}</span>
            )}
          </div>
        </div>
      )}

      {pendingActivity && (
        <CreateLogModal
          activity={pendingActivity}
          isOpen={true}
          onClose={() => setPendingActivity(null)}
          onSuccess={handleLogCreated}
        />
      )}

      {reflectionLogId && (
        <ReflectionModal logId={reflectionLogId} isOpen={true} onClose={() => setReflectionLogId(null)} />
      )}
    </div>
  );
}
