"use client";

import { useState, useTransition } from "react";
import { upsertReflection } from "@/server/actions/reflection";

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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-[#1C1C1C] w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-white/8 shadow-2xl">
        {/* Drag handle (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        <div className="px-6 pt-4 pb-8 sm:pb-6 sm:pt-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold text-base">{isEdit ? "余韻を編集" : "余韻を追加"}</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors text-sm"
            >
              ✕
            </button>
          </div>

          <div className="space-y-5">
            {/* 興奮 */}
            <div>
              <label className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">興奮</label>
              <RatingButtons value={excitement} onChange={setExcitement} activeClass="bg-[#7C4DFF] text-white" />
            </div>

            {/* 達成感 */}
            <div>
              <label className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">達成感</label>
              <RatingButtons value={achievement} onChange={setAchievement} activeClass="bg-[#00E5FF]/80 text-black" />
            </div>

            {/* またやりたい */}
            <div>
              <label className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">またやりたい</label>
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

            {/* メモ */}
            <div>
              <label className="text-zinc-500 text-xs mb-2.5 block tracking-wide uppercase">メモ</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="体験の余韻を残しておこう..."
                className="w-full bg-white/5 rounded-xl px-3.5 py-3 text-white text-sm placeholder:text-zinc-600 resize-none focus:outline-none focus:ring-1 focus:ring-[#7C4DFF]/50 leading-relaxed"
              />
              <p className="text-zinc-700 text-xs text-right mt-1">{note.length}/200</p>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full bg-[#7C4DFF] hover:bg-[#8D5FFF] disabled:opacity-50 text-white text-sm font-semibold rounded-xl py-3.5 transition-all active:scale-[0.98]"
            >
              {isPending ? "保存中..." : "保存する"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
