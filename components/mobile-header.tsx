"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  showBack?: boolean;
  className?: string;
  rightAction?: React.ReactNode;
};

export function MobileHeader({ title, showBack = false, className, rightAction }: Props) {
  const router = useRouter();

  return (
    <header className={cn("sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm", className)}>
      <div className="flex h-[52px] items-center gap-1 px-4 max-w-lg mx-auto">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted -ml-2 shrink-0 translate-y-[1px]"
            aria-label="戻る"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <span className="text-base font-semibold text-foreground translate-y-[1px]">{title}</span>
        {rightAction && <div className="ml-auto">{rightAction}</div>}
      </div>
    </header>
  );
}
