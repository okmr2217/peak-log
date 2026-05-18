"use client";

import { useState, useTransition } from "react";
import { createActivity } from "@/server/actions/activity";
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
import { ActivityFormFields } from "@/components/activity/activity-form-fields";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function ActivityCreateModal({ onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createActivity({
        name,
        emoji: emoji || undefined,
        color: color || undefined,
        description: description || undefined,
      });
      if (result.ok) {
        onSuccess();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <ResponsiveDialog open={true} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>活動を追加</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            新しい活動を作成します。名前、絵文字、カラーを設定してください。
          </ResponsiveDialogDescription>
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
              nameInputId="activity-name"
              descriptionInputId="activity-description"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
          </ResponsiveDialogBody>

          <ResponsiveDialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "追加中..." : "追加する"}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
