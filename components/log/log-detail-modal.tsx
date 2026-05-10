"use client";

import { Pencil, Trash2 } from "lucide-react";
import { NoteText } from "./note-text";
import { StarRating } from "@/components/ui/star-rating";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { formatRelativeTime, formatFullDateTime } from "@/lib/date-utils";
import type { FieldType } from "@prisma/client";

type ActivityField = {
  id: string;
  name: string;
  type: FieldType;
  options: string[];
};

type Props = {
  activity: {
    name: string;
    emoji: string | null;
    color: string | null;
    fields?: ActivityField[];
  };
  performedAt: Date;
  stars: number | null | undefined;
  note: string | null | undefined;
  fieldValues?: Record<string, string | string[]> | null;
  createdAt: Date;
  updatedAt: Date;
  isOpen: boolean;
  onClose: () => void;
  onEditRequest: () => void;
  onDelete: () => void;
};

export function LogDetailModal({
  activity,
  performedAt,
  stars,
  note,
  fieldValues,
  createdAt,
  updatedAt,
  isOpen,
  onClose,
  onEditRequest,
  onDelete,
}: Props) {
  const color = activity.color;

  const visibleFields = (activity.fields ?? [])
    .filter((field) => {
      const val = fieldValues?.[field.id];
      if (val === undefined || val === null) return false;
      if (Array.isArray(val)) return val.length > 0;
      return (val as string).trim() !== "";
    })
    .map((field) => {
      const val = fieldValues![field.id];
      return {
        id: field.id,
        name: field.name,
        displayValue: Array.isArray(val) ? val.join(", ") : val,
      };
    });

  const isUpdated = updatedAt.getTime() !== createdAt.getTime();

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <div className="flex items-start gap-3 pr-6">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl leading-none shrink-0 mt-0.5"
              style={{ backgroundColor: color ? `${color}28` : "var(--surface-overlay)" }}
            >
              {activity.emoji ?? "·"}
            </span>
            <div className="flex-1 min-w-0">
              <ResponsiveDialogTitle className="text-[15px] font-medium leading-snug">
                {activity.name}
              </ResponsiveDialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(performedAt)}</p>
            </div>
          </div>
          <ResponsiveDialogDescription className="sr-only">記録の詳細情報を表示します。</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="space-y-3 overflow-y-auto pb-4">
          {/* Stars */}
          {stars != null && (
            <div className="flex items-center gap-2">
              <StarRating value={stars} size="sm" />
              <span className="text-xs text-muted-foreground">{stars}/5</span>
            </div>
          )}

          {/* Note */}
          {note && (
            <div className="rounded-xl p-3 bg-muted">
              <p className="text-[13px] text-muted-foreground mb-1">メモ</p>
              <NoteText text={note} className="text-sm leading-relaxed" />
            </div>
          )}

          {/* Field values */}
          {visibleFields.length > 0 && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {visibleFields.map((entry) => (
                <div key={entry.id} className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5 truncate">{entry.name}</p>
                  <p className="text-sm font-medium truncate">{entry.displayValue}</p>
                </div>
              ))}
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t border-border pt-3 space-y-1">
            <p className="text-xs text-muted-foreground">作成 {formatFullDateTime(createdAt)}</p>
            {isUpdated && <p className="text-xs text-muted-foreground">更新 {formatFullDateTime(updatedAt)}</p>}
          </div>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={onEditRequest}
              className="flex-1 h-10 rounded-xl flex items-center justify-center gap-1.5 text-sm font-medium border border-border hover:bg-muted transition-colors"
            >
              <Pencil size={14} />
              編集
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="h-10 px-4 rounded-xl flex items-center justify-center gap-1.5 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors shrink-0"
            >
              <Trash2 size={14} />
              削除
            </button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
