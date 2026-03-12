"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { upsertReflection } from "@/server/actions/reflection";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dialog, BottomSheetContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type InitialValues = {
  excitement?: number | null;
  achievement?: number | null;
  wantAgain?: boolean | null;
  note?: string | null;
};

type ReflectionModalProps = {
  logId: string;
  initialValues?: InitialValues;
  isOpen: boolean;
  onClose: () => void;
};

function RatingButtons({
  value,
  onChange,
  activeClass,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  activeClass: string;
}) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(value === v ? undefined : v)}
          className={`w-10 h-10 rounded-full text-sm font-semibold transition-all active:scale-95 ${
            value != null && value >= v ? activeClass : "bg-white/5 text-zinc-500 hover:bg-white/10"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

export function ReflectionModal({ logId, initialValues, isOpen, onClose }: ReflectionModalProps) {
  const isEdit = !!initialValues;

  const [excitement, setExcitement] = useState<number | undefined>(initialValues?.excitement ?? undefined);
  const [achievement, setAchievement] = useState<number | undefined>(initialValues?.achievement ?? undefined);
  const [wantAgain, setWantAgain] = useState<boolean | undefined>(initialValues?.wantAgain ?? undefined);
  const [note, setNote] = useState(initialValues?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await upsertReflection({
        logId,
        excitement,
        achievement,
        wantAgain,
        note: note.trim() || undefined,
      });
      if (result.ok) {
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
          <DialogTitle>{isEdit ? "余韻を編集" : "余韻を追加"}</DialogTitle>
          <DialogDescription>興奮・達成感・またやりたいかどうかを記録します。</DialogDescription>
        </VisuallyHidden>
        <div className="px-6 pt-4 pb-8 sm:pb-6 sm:pt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold text-base">{isEdit ? "余韻を編集" : "余韻を追加"}</h2>
            <Button type="button" variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-500 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-5">
            <div>
              <Label className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">興奮</Label>
              <RatingButtons value={excitement} onChange={setExcitement} activeClass="bg-[#7C4DFF] text-white" />
            </div>

            <div>
              <Label className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">達成感</Label>
              <RatingButtons value={achievement} onChange={setAchievement} activeClass="bg-[#00E5FF]/80 text-black" />
            </div>

            <div>
              <Label className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">またやりたい</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWantAgain(wantAgain === true ? undefined : true)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                    wantAgain === true ? "bg-[#7C4DFF] text-white" : "bg-white/5 text-zinc-500 hover:bg-white/10"
                  }`}
                >
                  またやりたい
                </button>
                <button
                  type="button"
                  onClick={() => setWantAgain(wantAgain === false ? undefined : false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                    wantAgain === false ? "bg-white/15 text-zinc-300" : "bg-white/5 text-zinc-500 hover:bg-white/10"
                  }`}
                >
                  今回は十分
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="reflection-note" className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">
                メモ
              </Label>
              <Textarea
                id="reflection-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="体験の余韻を残しておこう..."
                className="bg-white/5 border-0 rounded-xl px-3.5 py-3 placeholder:text-zinc-600 resize-none focus-visible:ring-[#7C4DFF]/50 leading-relaxed"
              />
              <p className="text-zinc-700 text-xs text-right mt-1">{note.length}/200</p>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full rounded-xl h-auto py-3.5"
            >
              {isPending ? "保存中..." : "保存する"}
            </Button>
          </div>
        </div>
      </BottomSheetContent>
    </Dialog>
  );
}
