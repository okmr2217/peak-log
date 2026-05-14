"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateActivity } from "@/server/actions/activity";
import { getActivityFieldsForEdit } from "@/server/queries/activity-field";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ActivityFieldRow } from "@/components/activity/activity-field-row";
import { ActivityFieldEditor } from "@/components/activity/activity-field-editor";
import { ActivityFormFields } from "@/components/activity/activity-form-fields";
import type { ActivityFieldDTO } from "@/server/queries/activity";

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
          <ResponsiveDialogBody className="flex-1 overflow-y-auto space-y-3">
            <ActivityFormFields
              name={name}
              onNameChange={setName}
              emoji={emoji}
              onEmojiChange={setEmoji}
              color={color}
              onColorChange={setColor}
              description={description}
              onDescriptionChange={setDescription}
              nameInputId="edit-activity-name"
              descriptionInputId="edit-activity-description"
            />

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
