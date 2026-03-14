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

type SavedReflection = {
  id: string;
  excitement: number | null;
  achievement: number | null;
  wantAgain: boolean | null;
  note: string | null;
};

type ReflectionModalProps = {
  logId: string;
  initialValues?: InitialValues;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (reflection: SavedReflection) => void;
};

function RatingButtons({
  value,
  onChange,
  color,
  shadowColor,
  textClass,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  color: string;
  shadowColor: string;
  textClass: string;
}) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((v) => {
        const isActive = value != null && value >= v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(value === v ? undefined : v)}
            className={`w-10 h-10 rounded-full text-sm font-semibold transition-all duration-200 active:scale-90 ${
              isActive ? `${textClass}` : "bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
            }`}
            style={
              isActive
                ? {
                    background: color,
                    boxShadow: `0 0 18px 0 ${shadowColor}`,
                    transform: "scale(1.08)",
                  }
                : undefined
            }
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}

export function ReflectionModal({ logId, initialValues, isOpen, onClose, onSaved }: ReflectionModalProps) {
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
        onSaved?.({
          id: result.data.reflectionId,
          excitement: excitement ?? null,
          achievement: achievement ?? null,
          wantAgain: wantAgain ?? null,
          note: note.trim() || null,
        });
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

        {/* Gradient accent line */}
        <div
          className="h-[2px] mx-8 rounded-full opacity-70 mb-1"
          style={{ background: "linear-gradient(90deg, #7C4DFF, #00E5FF, #7C4DFF)" }}
        />

        <div className="px-6 pt-4 pb-8 sm:pb-6 sm:pt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-semibold text-base">{isEdit ? "余韻を編集" : "余韻を追加"}</h2>
              <p className="text-zinc-600 text-[11px] mt-0.5">この瞬間の余韻を残しておこう</p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-500 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-5">
            <div>
              <Label className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">興奮</Label>
              <RatingButtons
                value={excitement}
                onChange={setExcitement}
                color="#7C4DFF"
                shadowColor="rgba(124,77,255,0.55)"
                textClass="text-white"
              />
            </div>

            <div>
              <Label className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">達成感</Label>
              <RatingButtons
                value={achievement}
                onChange={setAchievement}
                color="rgba(0,229,255,0.75)"
                shadowColor="rgba(0,229,255,0.4)"
                textClass="text-[#0A0A0A] font-bold"
              />
            </div>

            <div>
              <Label className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">またやりたい</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWantAgain(wantAgain === true ? undefined : true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95"
                  style={
                    wantAgain === true
                      ? {
                          background: "linear-gradient(135deg, #7C4DFF, #9c6fff)",
                          color: "#fff",
                          boxShadow: "0 0 14px 0 rgba(124,77,255,0.45)",
                        }
                      : { background: "rgba(255,255,255,0.05)", color: "rgb(113,113,122)" }
                  }
                >
                  またやりたい
                </button>
                <button
                  type="button"
                  onClick={() => setWantAgain(wantAgain === false ? undefined : false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 ${
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

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              style={{
                background: isPending ? "rgba(124,77,255,0.5)" : "linear-gradient(135deg, #7C4DFF 0%, #5533cc 100%)",
                boxShadow: isPending ? "none" : "0 4px 24px -4px rgba(124,77,255,0.5)",
              }}
            >
              {isPending ? "保存中..." : "保存する"}
            </button>
          </div>
        </div>
      </BottomSheetContent>
    </Dialog>
  );
}
