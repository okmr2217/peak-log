"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Label } from "@/components/ui/label";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const PRESET_EMOJIS = ["💪", "📚", "🎮", "🏃", "🎵", "🍺", "❤️", "⭐", "🏋️", "🧘", "🎯", "🔥"];

interface Props {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPickerField({ value, onChange }: Props) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="space-y-2">
      <Label className="text-zinc-500 text-xs uppercase tracking-wide">絵文字</Label>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/8 text-2xl select-none">
          {value || "🏷️"}
        </div>
        <span className="text-zinc-600 text-xs">現在の選択</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESET_EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onChange(e)}
            className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-colors ${
              value === e ? "bg-[#7C4DFF]/30 ring-1 ring-[#7C4DFF]" : "bg-white/5 hover:bg-white/10"
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
        className="text-xs text-zinc-400 hover:text-white transition-colors"
      >
        {showPicker ? "閉じる" : "もっと選ぶ"}
      </button>

      {showPicker && (
        <div className="mt-1 [&_.EmojiPickerReact]:!bg-[#1C1C1C] [&_.EmojiPickerReact]:!border-white/8">
          <EmojiPicker
            onEmojiClick={(data) => {
              onChange(data.emoji);
              setShowPicker(false);
            }}
            // @ts-expect-error theme string is valid
            theme="dark"
            width="100%"
            height={320}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}
    </div>
  );
}
