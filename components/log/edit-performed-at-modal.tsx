"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { updateLogPerformedAt } from "@/server/actions/log";
import { toDatetimeLocalString } from "@/lib/date-utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dialog, BottomSheetContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Props = {
  logId: string;
  performedAt: Date;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (newDate: Date) => void;
};

export function EditPerformedAtModal({ logId, performedAt, isOpen, onClose, onSaved }: Props) {
  const [value, setValue] = useState(() => toDatetimeLocalString(performedAt));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!value) {
      setError("日時を入力してください");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateLogPerformedAt({ logId, performedAt: new Date(value) });
      if (result.ok) {
        onSaved?.(new Date(value));
        onClose();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <BottomSheetContent>
        <VisuallyHidden>
          <DialogTitle>日時を編集</DialogTitle>
          <DialogDescription>記録の実施日時を編集します。</DialogDescription>
        </VisuallyHidden>
        <div className="px-6 pt-4 pb-8 sm:pb-6 sm:pt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold text-base">日時を編集</h2>
            <Button type="button" variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-500 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="performed-at" className="text-zinc-500 text-xs uppercase tracking-wide">
                実施日時
              </Label>
              <Input
                id="performed-at"
                type="datetime-local"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="bg-white/5 border-0 rounded-xl px-3.5 py-3 h-auto focus-visible:ring-[#7C4DFF]/50 [color-scheme:dark]"
              />
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
                className="flex-1 rounded-xl h-auto py-3.5 border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white"
              >
                キャンセル
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-1 rounded-xl h-auto py-3.5"
              >
                {isPending ? "保存中..." : "保存する"}
              </Button>
            </div>
          </div>
        </div>
      </BottomSheetContent>
    </Dialog>
  );
}
