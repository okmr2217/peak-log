"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateActivity } from "@/server/actions/activity";
import { getActivityFieldsForEdit } from "@/server/actions/activity-field-queries";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EmojiPickerField } from "@/components/activity/emoji-picker-field";
import { ActivityFieldRow } from "@/components/activity/activity-field-row";
import { ActivityFieldEditor } from "@/components/activity/activity-field-editor";
import type { ActivityFieldDTO } from "@/server/queries/activity";

const PRESET_COLORS = [
  "#7C4DFF", "#00E5FF", "#FF4081", "#FF6D00", "#FFD740",
  "#69F0AE", "#40C4FF", "#E040FB", "#FF5252", "#CCFF90",
  "#84FFFF", "#F8BBD0",
];

interface Activity {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  description: string | null;
}

interface UpdatedActivity {
  name: string;
  emoji: string | null;
  color: string | null;
  description: string | null;
}

interface Props {
  activity: Activity;
  onClose: () => void;
  onSuccess: (updated: UpdatedActivity) => void;
}

export function ActivityEditModal({ activity, onClose, onSuccess }: Props) {
  const router = useRouter();
  const [name, setName] = useState(activity.name);
  const [emoji, setEmoji] = useState(activity.emoji ?? "");
  const [color, setColor] = useState(activity.color ?? "");
  const [description, setDescription] = useState(activity.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [fields, setFields] = useState<ActivityFieldDTO[]>([]);
  const [expandedFieldId, setExpandedFieldId] = useState<string | "new" | null>(null);

  useEffect(() => {
    getActivityFieldsForEdit(activity.id).then(setFields);
  }, [activity.id]);

  function handleFieldChange() {
    setExpandedFieldId(null);
    getActivityFieldsForEdit(activity.id).then(setFields);
    router.refresh();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateActivity({
        activityId: activity.id,
        name,
        emoji: emoji || undefined,
        color: color || undefined,
        description: description || undefined,
      });
      if (result.ok) {
        onSuccess({ name, emoji: emoji || null, color: color || null, description: description || null });
        onClose();
      } else {
        setError(result.message);
      }
    });
  }

  const activeFieldsCount = fields.filter((f) => !f.isArchived).length;

  return (
    <ResponsiveDialog open={true} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>活動を編集</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>活動の名前、絵文字、カラー、カスタムフィールドを編集します。</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <ResponsiveDialogBody className="flex-1 overflow-y-auto space-y-3 pb-3">
            <div className="space-y-1">
              <Label htmlFor="edit-activity-name" className="text-muted-foreground text-xs uppercase tracking-wide">
                名前 *
              </Label>
              <Input
                id="edit-activity-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 筋トレ"
                maxLength={20}
                required
                autoFocus
                className="bg-muted border-border rounded-xl px-3.5 py-2 h-auto placeholder:text-muted-foreground/50 focus-visible:border-primary/60 focus-visible:ring-0"
              />
            </div>
            <EmojiPickerField value={emoji} onChange={setEmoji} />
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">カラー</Label>
              <div className="flex flex-wrap gap-2.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(color === c ? "" : c)}
                    className="w-8 h-8 rounded-full transition-transform focus:outline-none"
                    style={{
                      backgroundColor: c,
                      boxShadow: color === c ? `0 0 0 2px #0A0A0A, 0 0 0 4px ${c}` : "none",
                      transform: color === c ? "scale(1.15)" : "scale(1)",
                    }}
                    aria-label={c}
                    aria-pressed={color === c}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-activity-description" className="text-muted-foreground text-xs uppercase tracking-wide">
                説明
              </Label>
              <Textarea
                id="edit-activity-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="活動の目的やルールなど（任意）"
                maxLength={200}
                rows={2}
                className="bg-muted border-border rounded-xl px-3.5 py-2 placeholder:text-muted-foreground/50 focus-visible:border-primary/60 focus-visible:ring-0 resize-none"
              />
              <p className="text-muted-foreground/50 text-xs text-right">{description.length}/200</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                  カスタムフィールド
                </Label>
                <span className="text-muted-foreground/50 text-xs">{activeFieldsCount} / 8</span>
              </div>

              <div className="space-y-2">
                {fields
                  .filter((f) => !f.isArchived)
                  .map((field) =>
                    expandedFieldId === field.id ? (
                      <ActivityFieldEditor
                        key={field.id}
                        activityId={activity.id}
                        field={field}
                        onSave={handleFieldChange}
                        onCancel={() => setExpandedFieldId(null)}
                        onArchive={handleFieldChange}
                      />
                    ) : (
                      <ActivityFieldRow
                        key={field.id}
                        field={field}
                        onClick={() => setExpandedFieldId(field.id)}
                      />
                    ),
                  )}

                {expandedFieldId === "new" ? (
                  <ActivityFieldEditor
                    activityId={activity.id}
                    field={null}
                    onSave={handleFieldChange}
                    onCancel={() => setExpandedFieldId(null)}
                  />
                ) : (
                  activeFieldsCount < 8 && (
                    <button
                      type="button"
                      onClick={() => setExpandedFieldId("new")}
                      className="w-full rounded-xl py-2.5 text-sm border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors active:scale-[0.99]"
                    >
                      + フィールドを追加
                    </button>
                  )
                )}
              </div>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
          </ResponsiveDialogBody>

          <ResponsiveDialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "保存中..." : "保存する"}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
