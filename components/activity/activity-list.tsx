"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ActivityItem } from "./activity-item";
import { ActivityCreateModal } from "./activity-create-modal";
import { Button } from "@/components/ui/button";

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

  const allActivityIds = activities.map((a) => a.id);

  function handleCreateSuccess() {
    setShowCreateModal(false);
    toast.success("活動を追加しました");
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-white">活動</h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          size="sm"
          className="gap-1.5 rounded-xl"
        >
          <Plus size={15} />
          追加
        </Button>
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
    </div>
  );
}
