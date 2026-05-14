"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MobileHeader } from "@/components/mobile-header";
import { updateActivity } from "@/server/actions/activity";
import { getActivityFieldsForEdit } from "@/server/queries/activity-field";
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

interface Props {
  activity: Activity;
}

export function ActivityEditView({ activity }: Props) {
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
        router.push("/activities");
      } else {
        setError(result.message);
      }
    });
  }

  const activeFieldsCount = fields.filter((f) => !f.isArchived).length;

  return (
    <>
      <MobileHeader title="活動を編集" showBack />
      <div className="p-4 max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">カスタムフィールド</Label>
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
                  <ActivityFieldRow key={field.id} field={field} onClick={() => setExpandedFieldId(field.id)} />
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

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => router.push("/activities")} disabled={isPending} className="flex-1">
            キャンセル
          </Button>
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? "保存中..." : "保存する"}
          </Button>
        </div>
      </form>
    </div>
    </>
  );
}
