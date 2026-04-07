"use client";

import { Star, Pencil } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dialog, BottomSheetContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, formatFullDateTime } from "@/lib/date-utils";

type Props = {
  activity: { name: string; emoji: string | null; color: string | null };
  performedAt: Date;
  stars: number | null | undefined;
  note: string | null | undefined;
  createdAt: Date;
  updatedAt: Date;
  isOpen: boolean;
  onClose: () => void;
  onEditRequest: () => void;
};

export function LogDetailModal({ activity, performedAt, stars, note, createdAt, updatedAt, isOpen, onClose, onEditRequest }: Props) {
  const color = activity.color;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <BottomSheetContent>
        <VisuallyHidden>
          <DialogTitle>記録の詳細</DialogTitle>
          <DialogDescription>記録の詳細情報を表示します。</DialogDescription>
        </VisuallyHidden>
        <div className="px-6 pt-4 pb-8 sm:pt-5">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-5">
            {activity.emoji && (
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base leading-none shrink-0"
                style={{ backgroundColor: color ? `${color}28` : "var(--surface-overlay)" }}
              >
                {activity.emoji}
              </span>
            )}
            <h2 className="text-foreground font-semibold text-base flex-1 min-w-0 truncate">{activity.name}</h2>
          </div>

          <div className="space-y-4">
            {/* performedAt */}
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">記録日時</p>
              <p className="text-foreground text-sm">{formatRelativeTime(performedAt)}</p>
            </div>

            {/* Stars */}
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1.5">スター</p>
              {stars != null ? (
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Star
                      key={v}
                      className="w-4 h-4"
                      style={
                        v <= stars
                          ? { fill: "#FBBF24", color: "#FBBF24" }
                          : { fill: "transparent", color: "hsl(var(--muted-foreground))" }
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">なし</p>
              )}
            </div>

            {/* Note */}
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">メモ</p>
              {note ? (
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">{note}</p>
              ) : (
                <p className="text-muted-foreground text-sm">なし</p>
              )}
            </div>

            {/* Metadata */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">作成日時</span>
                <span className="text-muted-foreground text-xs tabular-nums">{formatFullDateTime(createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">更新日時</span>
                <span className="text-muted-foreground text-xs tabular-nums">{formatFullDateTime(updatedAt)}</span>
              </div>
            </div>

            {/* Edit button */}
            <Button
              type="button"
              variant="outline"
              onClick={onEditRequest}
              className="w-full rounded-xl h-auto py-3 border-border gap-2"
            >
              <Pencil size={14} />
              編集する
            </Button>
          </div>
        </div>
      </BottomSheetContent>
    </Dialog>
  );
}
