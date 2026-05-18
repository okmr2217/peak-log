"use client";

import { useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { ActivityDetailModal } from "./activity-detail-modal";
import { formatFullDateTime } from "@/lib/date-utils";
import type { ActivityWithStats } from "@/server/queries/activity";

interface Props {
  activity: ActivityWithStats;
  onUpdate: (updated: ActivityWithStats) => void;
  onDelete: (id: string) => void;
}

export function ActivityCard({ activity, onUpdate, onDelete }: Props) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const color = activity.isArchived ? null : activity.color;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card cursor-pointer animate-in fade-in-0 duration-300 ${activity.isArchived ? "opacity-50 grayscale" : ""}`}
        onClick={() => setIsDetailOpen(true)}
      >
        <button
          {...attributes}
          {...listeners}
          className="touch-none cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors flex-shrink-0"
          aria-label="ドラッグして並び替え"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </button>

        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
          style={{ backgroundColor: color ? `${color}28` : "hsl(var(--primary) / 0.13)" }}
        >
          {activity.emoji ?? "⚡"}
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-foreground text-sm font-semibold block truncate">{activity.name}</span>
          <span className="text-[11px] text-muted-foreground/60 tabular-nums">
            {formatFullDateTime(activity.createdAt)} 作成
          </span>
        </div>

        {activity.isArchived && (
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border flex-shrink-0">
            アーカイブ済み
          </span>
        )}
      </div>

      <ActivityDetailModal
        activity={activity}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onArchiveChange={(updated) => {
          onUpdate(updated);
          setIsDetailOpen(false);
        }}
        onDelete={() => onDelete(activity.id)}
      />
    </>
  );
}
