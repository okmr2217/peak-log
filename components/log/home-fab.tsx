"use client";

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { CreateLogModal } from "@/components/log/create-log-modal";
import { ReflectionModal } from "@/components/reflection/reflection-modal";

type Activity = {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
};

type Toast =
  | { type: "success"; logId: string; hasReflection: boolean }
  | { type: "error"; message: string };

export function HomeFab({ activities }: { activities: Activity[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [reflectionLogId, setReflectionLogId] = useState<string | null>(null);

  const handleSuccess = useCallback((logId: string, hasReflection: boolean) => {
    setToast({ type: "success", logId, hasReflection });
    setTimeout(() => setToast(null), 4000);
  }, []);

  return (
    <>
      {/* FAB */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-150 active:scale-90"
        style={{
          background: "linear-gradient(135deg, #7C4DFF 0%, #5533cc 100%)",
          boxShadow: "0 4px 24px -4px rgba(124,77,255,0.6), 0 0 0 1px rgba(124,77,255,0.3)",
        }}
        aria-label="ピークを記録"
      >
        <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
      </button>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-4 right-4 z-50 flex justify-center pointer-events-none">
          <div
            className={`
              pointer-events-auto rounded-2xl px-4 py-3.5 shadow-2xl
              flex items-center justify-between gap-4 max-w-sm w-full
              ${toast.type === "success" ? "bg-[#232323] border border-white/8" : "bg-red-950/90 border border-red-700/40"}
            `}
          >
            {toast.type === "success" ? (
              <>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C4DFF] flex-shrink-0" />
                  <span className="text-white text-sm font-medium">記録しました</span>
                </div>
                {!toast.hasReflection && (
                  <button
                    type="button"
                    onClick={() => {
                      setReflectionLogId(toast.logId);
                      setToast(null);
                    }}
                    className="text-[#00E5FF] text-xs font-medium hover:opacity-80 transition-opacity shrink-0 px-3 py-1.5 rounded-lg bg-[#00E5FF]/10"
                  >
                    余韻を追加
                  </button>
                )}
              </>
            ) : (
              <span className="text-red-300 text-sm">{toast.message}</span>
            )}
          </div>
        </div>
      )}

      <CreateLogModal
        activities={activities}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={handleSuccess}
      />

      {reflectionLogId && (
        <ReflectionModal logId={reflectionLogId} isOpen={true} onClose={() => setReflectionLogId(null)} />
      )}
    </>
  );
}
