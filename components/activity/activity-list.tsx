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
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">活動一覧</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 bg-[#7C4DFF] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#6B3FE0] transition-colors"
        >
          <Plus size={16} />
          追加
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-sm">最初の活動を作ろう</p>
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-zinc-700 text-white text-sm px-4 py-2.5 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
