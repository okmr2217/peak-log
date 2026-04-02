"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { createActivity } from "@/server/actions/activity";
import { Dialog, BottomSheetContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EmojiPickerField } from "@/components/activity/emoji-picker-field";

const PRESET_COLORS = [
  "#7C4DFF", "#00E5FF", "#FF4081", "#FF6D00", "#FFD740",
  "#69F0AE", "#40C4FF", "#E040FB", "#FF5252", "#CCFF90",
  "#84FFFF", "#F8BBD0",
];

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
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <BottomSheetContent>
        <DialogTitle className="sr-only">活動を追加</DialogTitle>
        <DialogDescription className="sr-only">新しい活動を作成します。名前、絵文字、カラーを設定してください。</DialogDescription>
        <div className="px-6 pt-4 pb-8 sm:pb-6 sm:pt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-foreground font-semibold text-base">活動を追加</h2>
            <Button type="button" variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activity-name" className="text-muted-foreground text-xs uppercase tracking-wide">
                名前 *
              </Label>
              <Input
                id="activity-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 筋トレ"
                maxLength={20}
                required
                autoFocus
                className="bg-muted border-border rounded-xl px-3.5 py-3 h-auto placeholder:text-muted-foreground/50 focus-visible:border-primary/60 focus-visible:ring-0"
              />
            </div>
            <EmojiPickerField value={emoji} onChange={setEmoji} />
            <div className="space-y-2">
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
            <div className="space-y-2">
              <Label htmlFor="activity-description" className="text-muted-foreground text-xs uppercase tracking-wide">
                説明
              </Label>
              <Textarea
                id="activity-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="活動の目的やルールなど（任意）"
                maxLength={200}
                rows={2}
                className="bg-muted border-border rounded-xl px-3.5 py-3 placeholder:text-muted-foreground/50 focus-visible:border-primary/60 focus-visible:ring-0 resize-none"
              />
              <p className="text-muted-foreground/50 text-xs text-right">{description.length}/200</p>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl h-auto py-3.5"
            >
              {isPending ? "追加中..." : "追加する"}
            </Button>
          </form>
        </div>
      </BottomSheetContent>
    </Dialog>
  );
}
