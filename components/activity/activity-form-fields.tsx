import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmojiPickerField } from "@/components/activity/emoji-picker-field";

export const PRESET_COLORS = [
  "#7C4DFF",
  "#00E5FF",
  "#FF4081",
  "#FF6D00",
  "#FFD740",
  "#69F0AE",
  "#40C4FF",
  "#E040FB",
  "#FF5252",
  "#CCFF90",
  "#84FFFF",
  "#F8BBD0",
];

type ActivityFormFieldsProps = {
  name: string;
  onNameChange: (v: string) => void;
  emoji: string;
  onEmojiChange: (v: string) => void;
  color: string;
  onColorChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  nameInputId: string;
  descriptionInputId: string;
};

export function ActivityFormFields({
  name,
  onNameChange,
  emoji,
  onEmojiChange,
  color,
  onColorChange,
  description,
  onDescriptionChange,
  nameInputId,
  descriptionInputId,
}: ActivityFormFieldsProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor={nameInputId} className="text-muted-foreground text-xs uppercase tracking-wide">
          名前 *
        </Label>
        <Input
          id={nameInputId}
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="例: 筋トレ"
          maxLength={20}
          required
          autoFocus
          className="bg-muted border-border rounded-xl px-3.5 py-2 h-auto placeholder:text-muted-foreground/50 focus-visible:border-primary/60 focus-visible:ring-0"
        />
      </div>
      <EmojiPickerField value={emoji} onChange={onEmojiChange} />
      <div className="space-y-1.5">
        <Label className="text-muted-foreground text-xs uppercase tracking-wide">カラー</Label>
        <div className="flex flex-wrap gap-2.5">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onColorChange(color === c ? "" : c)}
              className="w-8 h-8 rounded-full transition-transform focus:outline-none"
              style={{
                backgroundColor: c,
                boxShadow: color === c ? `0 0 0 2px #0A0A0A, 0 0 0 4px ${c}` : "none",
                transform: color === c ? "scale(1.15)" : "scale(1)",
              }}
              aria-label={c}
              aria-pressed={color === c}
            />
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={descriptionInputId} className="text-muted-foreground text-xs uppercase tracking-wide">
          説明
        </Label>
        <Textarea
          id={descriptionInputId}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="活動の目的やルールなど（任意）"
          maxLength={200}
          rows={2}
          className="bg-muted border-border rounded-xl px-3.5 py-2 placeholder:text-muted-foreground/50 focus-visible:border-primary/60 focus-visible:ring-0 resize-none"
        />
        <p className="text-muted-foreground/50 text-xs text-right">{description.length}/200</p>
      </div>
    </>
  );
}
