"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const PRESET_EMOJIS = ["💪", "📚", "🎮", "🏃", "🎵", "🍺", "❤️", "⭐", "🏋️", "🧘", "🎯", "🔥"];

interface Props {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPickerField({ value, onChange }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const { resolvedTheme } = useTheme();

  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground text-xs uppercase tracking-wide">絵文字</Label>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted border border-border text-2xl select-none">
          {value || "🏷️"}
        </div>
        <span className="text-muted-foreground/60 text-xs">現在の選択</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESET_EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onChange(e)}
            className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-colors ${
              value === e ? "bg-primary/30 ring-1 ring-primary" : "bg-muted hover:bg-muted/80"
            }`}
            aria-label={e}
            aria-pressed={value === e}
          >
            {e}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowPicker((v) => !v)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {showPicker ? "閉じる" : "もっと選ぶ"}
      </button>

      {showPicker && (
        <div className="mt-1">
          <EmojiPicker
            onEmojiClick={(data) => {
              onChange(data.emoji);
              setShowPicker(false);
            }}
            // @ts-expect-error theme string is valid
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            width="100%"
            height={320}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}
    </div>
  );
}
