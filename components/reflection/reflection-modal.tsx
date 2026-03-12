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
          className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
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
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-[#1A1A1A] w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold">{isEdit ? "余韻を編集" : "余韻を追加"}</h2>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-xl leading-none">
            ✕
          </button>
        </div>

        <div className="space-y-5">
          {/* 興奮 */}
          <div>
            <label className="text-zinc-400 text-xs mb-2 block">興奮</label>
            <RatingButtons value={excitement} onChange={setExcitement} activeClass="bg-[#7C4DFF] text-white" />
          </div>

          {/* 達成感 */}
          <div>
            <label className="text-zinc-400 text-xs mb-2 block">達成感</label>
            <RatingButtons value={achievement} onChange={setAchievement} activeClass="bg-[#00E5FF]/80 text-black" />
          </div>

          {/* またやりたい */}
          <div>
            <label className="text-zinc-400 text-xs mb-2 block">またやりたい</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setWantAgain(wantAgain === true ? undefined : true)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                  wantAgain === true ? "bg-[#7C4DFF] text-white" : "bg-white/5 text-zinc-500 hover:bg-white/10"
                }`}
              >
                またやりたい
              </button>
              <button
                type="button"
                onClick={() => setWantAgain(wantAgain === false ? undefined : false)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                  wantAgain === false ? "bg-white/20 text-zinc-300" : "bg-white/5 text-zinc-500 hover:bg-white/10"
                }`}
              >
                今回は十分
              </button>
            </div>
          </div>

          {/* メモ */}
          <div>
            <label className="text-zinc-400 text-xs mb-2 block">メモ</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="体験の余韻を残しておこう..."
              className="w-full bg-white/5 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 resize-none focus:outline-none focus:ring-1 focus:ring-[#7C4DFF]/50"
            />
            <p className="text-zinc-600 text-xs text-right mt-1">{note.length}/200</p>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full bg-[#7C4DFF] hover:bg-[#9E70FF] disabled:opacity-50 text-white text-sm font-medium rounded-xl py-3 transition-colors"
          >
            {isPending ? "保存中..." : "保存する"}
          </button>
        </div>
      </div>
    </div>
  );
}
