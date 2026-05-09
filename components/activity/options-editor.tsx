"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  options: string[];
  onChange: (options: string[]) => void;
  maxOptions?: number;
}

export function OptionsEditor({ options, onChange, maxOptions = 20 }: Props) {
  const [draft, setDraft] = useState("");

  function addOption() {
    const v = draft.trim();
    if (!v || options.includes(v) || options.length >= maxOptions) return;
    onChange([...options, v]);
    setDraft("");
  }

  function removeOption(idx: number) {
    onChange(options.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {options.map((opt, idx) => (
          <span
            key={`${opt}-${idx}`}
            className="inline-flex items-center gap-1.5 bg-muted rounded-full pl-3 pr-2 py-1 text-xs text-foreground"
          >
            {opt}
            <button
              type="button"
              onClick={() => removeOption(idx)}
              className="text-muted-foreground hover:text-foreground"
              aria-label={`${opt}を削除`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      {options.length < maxOptions ? (
        <div className="flex gap-1.5">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addOption();
              }
            }}
            placeholder="選択肢を入力"
            maxLength={20}
            className="bg-muted border-border rounded-xl text-xs h-9"
          />
          <Button type="button" onClick={addOption} variant="outline" size="sm">
            追加
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground/50 text-xs">最大{maxOptions}件まで</p>
      )}
    </div>
  );
}
