"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { CreateLogModal } from "@/components/log/create-log-modal";

type Activity = {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
};

type Toast = { type: "success" } | { type: "error"; message: string };

export function HomeFab({ activities, defaultActivityId }: { activities: Activity[]; defaultActivityId?: string | null }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "n" && e.key !== "N") return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable) return;
      if (isOpen) return;
      setIsOpen(true);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSuccess = useCallback(() => {
    router.refresh();
    setToast({ type: "success" });
    setTimeout(() => setToast(null), 4000);
  }, [router]);

  return (
    <>
      {/* FAB */}
      <div className="fixed bottom-20 right-4 z-40 group">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-150 active:scale-90"
          style={{
            background: "linear-gradient(135deg, #7C4DFF 0%, #5533cc 100%)",
            boxShadow: "0 4px 24px -4px rgba(124,77,255,0.6), 0 0 0 1px rgba(124,77,255,0.3)",
          }}
          aria-label="ピークを記録"
        >
          <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
        </button>
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap">
            <span className="text-muted-foreground text-xs">記録を追加</span>
            <kbd className="text-xs font-mono bg-muted text-muted-foreground rounded px-1.5 py-0.5 leading-none">N</kbd>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-4 right-4 z-50 flex justify-center pointer-events-none">
          <div
            className={`
              pointer-events-auto rounded-2xl px-4 py-3.5 shadow-2xl
              flex items-center justify-between gap-4 max-w-sm w-full
              ${toast.type === "success" ? "bg-card border border-border" : "bg-red-950/90 border border-red-700/40"}
            `}
          >
            {toast.type === "success" ? (
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-foreground text-sm font-medium">記録しました</span>
              </div>
            ) : (
              <span className="text-red-300 text-sm">{toast.message}</span>
            )}
          </div>
        </div>
      )}

      <CreateLogModal
        key={isOpen ? `open-${defaultActivityId ?? ""}` : "closed"}
        activities={activities}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={handleSuccess}
        defaultActivityId={defaultActivityId}
      />
    </>
  );
}
