"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ActivityButton } from "./activity-button";
import { CreateLogModal } from "@/components/log/create-log-modal";

type Activity = {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
};

type Toast = { type: "success" } | { type: "error"; message: string };

type ActivityGridProps = {
  activities: Activity[];
};

export function ActivityGrid({ activities }: ActivityGridProps) {
  const [pendingActivity, setPendingActivity] = useState<Activity | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const handleActivityTap = useCallback(
    async (activityId: string) => {
      const activity = activities.find((a) => a.id === activityId);
      if (activity) setPendingActivity(activity);
    },
    [activities],
  );

  const handleLogCreated = useCallback(() => {
    setToast({ type: "success" });
    setTimeout(() => setToast(null), 4000);
  }, []);

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <p className="text-foreground font-semibold mb-1.5">まだ活動がありません</p>
        <p className="text-muted-foreground text-sm mb-5">最初の活動を追加して、ピークを記録しよう</p>
        <Link
          href="/activities"
          className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 active:scale-95 transition-all"
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
              ${toast.type === "success" ? "bg-card border border-border" : "bg-red-950/90 border border-red-700/40"}
            `}
          >
            {toast.type === "success" ? (
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-foreground text-sm font-medium">記録しました</span>
              </div>
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

    </div>
  );
}
