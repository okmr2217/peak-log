"use client";

import { useState } from "react";
import { EditPerformedAtModal } from "./edit-performed-at-modal";
import { formatTime, formatPerformedAt } from "@/lib/date-utils";

type Props = {
  logId: string;
  performedAt: Date;
  timeOnly?: boolean;
  onSaved?: (newDate: Date) => void;
};

export function EditPerformedAtButton({ logId, performedAt, timeOnly = false, onSaved }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(performedAt);
  const label = timeOnly ? formatTime(currentDate) : formatPerformedAt(currentDate);

  function handleSaved(newDate: Date) {
    setCurrentDate(newDate);
    onSaved?.(newDate);
  }

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
        onSaved={handleSaved}
      />
    </>
  );
}
