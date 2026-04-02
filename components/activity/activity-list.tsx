"use client";

import { useState } from "react";
import { Plus, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  DragOverlay,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ActivityItem } from "./activity-item";
import { ActivityCreateModal } from "./activity-create-modal";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { reorderActivities } from "@/server/actions/activity";
import type { ActivityWithStats } from "@/server/queries/activity";

interface Props {
  activities: ActivityWithStats[];
}

export function ActivityList({ activities: initialActivities }: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activities, setActivities] = useState(initialActivities);
  const [draggingActivity, setDraggingActivity] = useState<ActivityWithStats | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  function handleCreateSuccess() {
    setShowCreateModal(false);
    toast.success("活動を追加しました");
  }

  function handleDragStart(event: DragStartEvent) {
    const found = activities.find((a) => a.id === event.active.id);
    setDraggingActivity(found ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setDraggingActivity(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activities.findIndex((a) => a.id === active.id);
    const newIndex = activities.findIndex((a) => a.id === over.id);
    const reordered = arrayMove(activities, oldIndex, newIndex);

    setActivities(reordered);
    await reorderActivities({ activityIds: reordered.map((a) => a.id) });
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <PageHeader
        title="活動"
        description="活動の追加・編集・並び替え・アーカイブができます"
        action={
          <Button onClick={() => setShowCreateModal(true)} size="sm" className="gap-1.5 rounded-xl">
            <Plus size={15} />
            追加
          </Button>
        }
      />

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-foreground text-sm font-medium mb-1.5">活動を作成しよう</p>
          <p className="text-muted-foreground text-xs">筋トレ、勉強、デートなど、記録したいことを追加できます</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <SortableContext items={activities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {draggingActivity && (
              <div
                className="flex items-center gap-3 px-3.5 py-3 rounded-2xl border shadow-2xl"
                style={{
                  background: draggingActivity.color
                    ? `radial-gradient(ellipse at 0% 20%, ${draggingActivity.color}15 0%, transparent 55%), hsl(var(--card))`
                    : "hsl(var(--card))",
                  borderColor: draggingActivity.color ? `${draggingActivity.color}38` : "hsl(var(--border))",
                }}
              >
                <GripVertical size={16} className="text-muted-foreground flex-shrink-0" />
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: draggingActivity.color ? `${draggingActivity.color}28` : "hsl(var(--primary) / 0.13)" }}
                >
                  {draggingActivity.emoji ?? "⚡"}
                </div>
                <span className="text-foreground text-sm font-semibold truncate">{draggingActivity.name}</span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {showCreateModal && (
        <ActivityCreateModal onClose={() => setShowCreateModal(false)} onSuccess={handleCreateSuccess} />
      )}
    </div>
  );
}
