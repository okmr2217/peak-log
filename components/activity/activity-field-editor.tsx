"use client";

import { useState, useTransition } from "react";
import { ChevronUp, Trash2 } from "lucide-react";
import type { FieldType } from "@prisma/client";
import type { ActivityFieldDTO } from "@/server/queries/activity";
import { createActivityField, updateActivityField, archiveActivityField } from "@/server/actions/activity-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ConfirmAlertDialog } from "@/components/ui/confirm-alert-dialog";
import { OptionsEditor } from "./options-editor";

const TYPE_LABELS: Record<FieldType, string> = {
  TEXT: "テキスト",
  TEXTAREA: "長文",
  SELECT: "選択",
  MULTI_SELECT: "複数選択",
};

const TYPES: FieldType[] = ["TEXT", "TEXTAREA", "SELECT", "MULTI_SELECT"];

interface Props {
  activityId: string;
  field: ActivityFieldDTO | null;
  onSave: () => void;
  onCancel: () => void;
  onArchive?: () => void;
}

export function ActivityFieldEditor({ activityId, field, onSave, onCancel, onArchive }: Props) {
  const [name, setName] = useState(field?.name ?? "");
  const [type, setType] = useState<FieldType>(field?.type ?? "TEXT");
  const [options, setOptions] = useState<string[]>(field?.options ?? []);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  function handleTypeChange(next: FieldType) {
    setType(next);
    if (next === "TEXT" || next === "TEXTAREA") {
      setOptions([]);
    }
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const resolvedOptions = type === "SELECT" || type === "MULTI_SELECT" ? options : [];
      const result = field
        ? await updateActivityField({ fieldId: field.id, name, type, options: resolvedOptions })
        : await createActivityField({ activityId, name, type, options: resolvedOptions });
      if (result.ok) {
        onSave();
      } else {
        setError(result.message);
      }
    });
  }

  function handleArchive() {
    if (!field || !onArchive) return;
    setIsArchiveDialogOpen(true);
  }

  function handleArchiveConfirm() {
    if (!field || !onArchive) return;
    setError(null);
    startTransition(async () => {
      const result = await archiveActivityField({ fieldId: field.id });
      if (result.ok) {
        onArchive();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <>
      <div
        className="rounded-xl p-3.5 space-y-3"
        style={{ background: "rgba(124,77,255,0.06)", border: "1px solid rgba(124,77,255,0.3)" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-foreground text-sm font-medium">{field ? field.name : "新規フィールド"}</span>
          <div className="flex items-center gap-1">
            {field && onArchive && (
              <button
                type="button"
                onClick={handleArchive}
                disabled={isPending}
                className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50"
                aria-label="アーカイブ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="閉じる"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">フィールド名</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 場所"
            maxLength={12}
            className="bg-muted border-border rounded-xl text-sm h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">タイプ</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 ${
                  type === t ? "text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
                style={
                  type === t
                    ? {
                        background: "linear-gradient(135deg, #7C4DFF, #5533cc)",
                        boxShadow: "0 0 14px 0 rgba(124,77,255,0.35)",
                      }
                    : undefined
                }
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {(type === "SELECT" || type === "MULTI_SELECT") && (
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">選択肢</Label>
            <OptionsEditor options={options} onChange={setOptions} />
          </div>
        )}

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <Button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="w-full rounded-xl h-auto py-2.5 text-sm"
        >
          {isPending ? "保存中..." : "保存する"}
        </Button>
      </div>

      <ConfirmAlertDialog
        open={isArchiveDialogOpen}
        onOpenChange={setIsArchiveDialogOpen}
        onConfirm={handleArchiveConfirm}
        isPending={isPending}
        title="フィールドをアーカイブしますか？"
        description="過去のログに残された値はそのまま保持されます。"
        actionLabel="アーカイブする"
        pendingLabel="処理中..."
      />
    </>
  );
}
