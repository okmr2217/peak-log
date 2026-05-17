"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Archive, ArchiveRestore, ExternalLink, Trash2 } from "lucide-react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { ConfirmAlertDialog } from "@/components/ui/confirm-alert-dialog";
import { archiveActivity, deleteActivity } from "@/server/actions/activity";
import { getActivityFieldsForEdit, getActivityLogCount } from "@/server/queries/activity-field";
import { formatFullDateTime } from "@/lib/date-utils";
import type { ActivityWithStats, ActivityFieldDTO } from "@/server/queries/activity";

const FIELD_TYPE_LABEL: Record<string, string> = {
  TEXT: "テキスト",
  TEXTAREA: "テキストエリア",
  SELECT: "選択",
  MULTI_SELECT: "複数選択",
};

type Props = {
  activity: ActivityWithStats;
  isOpen: boolean;
  onClose: () => void;
  onArchiveChange: (updated: ActivityWithStats) => void;
  onDelete?: () => void;
};

export function ActivityDetailModal({ activity, isOpen, onClose, onArchiveChange, onDelete }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fields, setFields] = useState<ActivityFieldDTO[]>([]);
  const [logCount, setLogCount] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const color = activity.isArchived ? null : activity.color;

  useEffect(() => {
    if (isOpen) {
      getActivityFieldsForEdit(activity.id).then(setFields);
      getActivityLogCount(activity.id).then(setLogCount);
    }
  }, [isOpen, activity.id]);

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveActivity({ activityId: activity.id, isArchived: !activity.isArchived });
      if (result.ok) {
        onArchiveChange({ ...activity, isArchived: !activity.isArchived });
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteActivity({ activityId: activity.id });
      if (result.ok) {
        setIsDeleteDialogOpen(false);
        onClose();
        onDelete?.();
      } else {
        toast.error(result.message ?? "削除できませんでした");
      }
    });
  }

  const activeFields = fields.filter((f) => !f.isArchived);

  return (
    <>
    <ResponsiveDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <div className="flex items-start gap-3 pr-6">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl leading-none shrink-0 mt-0.5"
              style={{ backgroundColor: color ? `${color}28` : "hsl(var(--primary) / 0.13)" }}
            >
              {activity.emoji ?? "⚡"}
            </span>
            <div className="flex-1 min-w-0">
              <ResponsiveDialogTitle className="text-[15px] font-medium leading-snug">
                {activity.name}
              </ResponsiveDialogTitle>
              {activity.isArchived && (
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                  アーカイブ済み
                </span>
              )}
            </div>
          </div>
          <ResponsiveDialogDescription className="sr-only">活動の詳細情報を表示します。</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="space-y-3 overflow-y-auto">
          {activity.description && (
            <div className="rounded-xl p-3 bg-muted">
              <p className="text-[13px] text-muted-foreground mb-1">説明</p>
              <p className="text-sm leading-relaxed">{activity.description}</p>
            </div>
          )}

          {activeFields.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {activeFields.map((field) => (
                <div key={field.id} className="rounded-xl p-3 bg-muted min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5 truncate">{field.name}</p>
                  <p className="text-sm font-medium truncate">{FIELD_TYPE_LABEL[field.type] ?? field.type}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">作成 {formatFullDateTime(activity.createdAt)}</p>
            <Link
              href={`/activities/${activity.id}`}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={onClose}
            >
              <ExternalLink size={11} />
              統計を見る
            </Link>
          </div>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push(`/activities/${activity.id}/edit`);
              }}
              className="flex-1 h-10 rounded-xl flex items-center justify-center gap-1.5 text-sm font-medium border border-border hover:bg-muted transition-colors"
            >
              <Pencil size={14} />
              編集
            </button>
            <button
              type="button"
              onClick={handleArchive}
              disabled={isPending}
              className="h-10 px-4 rounded-xl flex items-center justify-center gap-1.5 text-sm font-medium border border-border hover:bg-muted transition-colors shrink-0 disabled:opacity-50"
            >
              {activity.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
              {activity.isArchived ? "解除" : "アーカイブ"}
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isPending}
              className="h-10 w-10 rounded-xl flex items-center justify-center border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors shrink-0 disabled:opacity-50"
              aria-label="削除"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>

    <ConfirmAlertDialog
      open={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
      onConfirm={handleDelete}
      isPending={isPending}
      title={`「${activity.name}」を削除しますか？`}
      description={
        logCount === null
          ? "この操作は取り消せません。"
          : logCount > 0
            ? `紐づくログが ${logCount} 件あります。活動とすべてのログが完全に削除されます。この操作は取り消せません。`
            : "この操作は取り消せません。"
      }
      actionLabel="完全に削除する"
      pendingLabel="削除中..."
    />
    </>
  );
}
