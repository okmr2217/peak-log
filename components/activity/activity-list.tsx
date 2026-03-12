"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { ActivityItem } from "./activity-item";
import { ActivityCreateModal } from "./activity-create-modal";

interface Activity {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  sortOrder: number;
  isArchived: boolean;
}

interface Props {
  activities: Activity[];
}

export function ActivityList({ activities }: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const allActivityIds = activities.map((a) => a.id);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  function handleCreateSuccess() {
    setShowCreateModal(false);
    setToast("活動を追加しました");
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-white">活動</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 bg-[#7C4DFF] text-white px-3.5 py-2 rounded-xl text-sm font-medium hover:bg-[#6B3FE0] active:scale-95 transition-all"
        >
          <Plus size={15} />
          追加
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-zinc-300 text-sm font-medium mb-1.5">活動を作成しよう</p>
          <p className="text-zinc-600 text-xs">筋トレ、勉強、デートなど、記録したいことを追加できます</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} allActivityIds={allActivityIds} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <ActivityCreateModal onClose={() => setShowCreateModal(false)} onSuccess={handleCreateSuccess} />
      )}

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#232323] border border-white/8 text-white text-sm px-4 py-2.5 rounded-full shadow-lg z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
}
