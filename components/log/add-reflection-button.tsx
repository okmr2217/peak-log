"use client";

import { useState } from "react";
import { ReflectionModal } from "@/components/reflection/reflection-modal";

type ReflectionValues = {
  id: string;
  excitement: number | null;
  achievement: number | null;
  wantAgain: boolean | null;
  note: string | null;
};

type AddReflectionButtonProps = {
  logId: string;
  initialValues?: ReflectionValues;
  onSaved?: (reflection: ReflectionValues) => void;
};

export function AddReflectionButton({ logId, initialValues, onSaved }: AddReflectionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentValues, setCurrentValues] = useState<ReflectionValues | undefined>(initialValues);
  const hasReflection = !!currentValues;

  function handleSaved(reflection: ReflectionValues) {
    setCurrentValues(reflection);
    onSaved?.(reflection);
  }

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
      <ReflectionModal
        logId={logId}
        initialValues={currentValues ?? undefined}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSaved={handleSaved}
      />
    </>
  );
}
