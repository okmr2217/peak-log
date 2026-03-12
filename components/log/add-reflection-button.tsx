"use client";

import { useState } from "react";
import { ReflectionModal } from "@/components/reflection/reflection-modal";

type ReflectionValues = {
  excitement: number | null;
  achievement: number | null;
  wantAgain: boolean | null;
  note: string | null;
};

type AddReflectionButtonProps = {
  logId: string;
  initialValues?: ReflectionValues;
};

export function AddReflectionButton({ logId, initialValues }: AddReflectionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasReflection = !!initialValues;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          hasReflection
            ? "text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
            : "text-[11px] text-[#00E5FF]/50 hover:text-[#00E5FF]/80 transition-colors"
        }
      >
        {hasReflection ? "余韻を編集" : "+ 余韻を追加"}
      </button>
      <ReflectionModal logId={logId} initialValues={initialValues ?? undefined} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
