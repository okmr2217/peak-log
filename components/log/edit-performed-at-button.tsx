"use client";

import { useState } from "react";
import { EditPerformedAtModal } from "./edit-performed-at-modal";

type Props = {
  logId: string;
  performedAt: Date;
  label: string;
};

export function EditPerformedAtButton({ logId, performedAt, label }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(performedAt);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="日時を編集"
        className="text-zinc-600 text-xs shrink-0 tabular-nums hover:text-zinc-400 transition-colors"
      >
        {label}
      </button>
      <EditPerformedAtModal
        logId={logId}
        performedAt={currentDate}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSaved={(newDate) => setCurrentDate(newDate)}
      />
    </>
  );
}
