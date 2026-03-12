"use client";

type AddReflectionButtonProps = {
  logId: string;
};

export function AddReflectionButton({ logId: _logId }: AddReflectionButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        // TODO: Phase 4 - open reflection modal with logId
      }}
      className="text-xs text-[#00E5FF]/60 hover:text-[#00E5FF] transition-colors"
    >
      余韻を追加
    </button>
  );
}
