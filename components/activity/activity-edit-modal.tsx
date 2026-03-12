"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { updateActivity } from "@/server/actions/activity";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dialog, BottomSheetContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EmojiPickerField } from "@/components/activity/emoji-picker-field";

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
}

interface Props {
  activity: Activity;
  onClose: () => void;
}

export function ActivityEditModal({ activity, onClose }: Props) {
  const [name, setName] = useState(activity.name);
  const [emoji, setEmoji] = useState(activity.emoji ?? "");
  const [color, setColor] = useState(activity.color ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateActivity({
        activityId: activity.id,
        name,
        emoji: emoji || undefined,
        color: color || undefined,
      });
      if (result.ok) {
        onClose();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <BottomSheetContent>
        <VisuallyHidden>
          <DialogTitle>活動を編集</DialogTitle>
          <DialogDescription>活動の名前、絵文字、カラーを編集します。</DialogDescription>
        </VisuallyHidden>
        <div className="px-6 pt-4 pb-8 sm:pb-6 sm:pt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold text-base">活動を編集</h2>
            <Button type="button" variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-500 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-activity-name" className="text-zinc-500 text-xs uppercase tracking-wide">
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
                className="bg-white/5 border-white/8 rounded-xl px-3.5 py-3 h-auto placeholder:text-zinc-600 focus-visible:border-[#7C4DFF]/60 focus-visible:ring-0"
              />
            </div>
            <EmojiPickerField value={emoji} onChange={setEmoji} />
            <div className="space-y-2">
              <Label className="text-zinc-500 text-xs uppercase tracking-wide">カラー</Label>
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
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl h-auto py-3.5"
            >
              {isPending ? "保存中..." : "保存する"}
            </Button>
          </form>
        </div>
      </BottomSheetContent>
    </Dialog>
  );
}
