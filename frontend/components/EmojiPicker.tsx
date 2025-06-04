import { useState } from "react";
import { Input } from "@/components/ui/input";

const EMOJIS = [
  "🥅","🎯","😄","🙏","🎈","💖","🥰","📘","🌞","⚡","🤓","🧃","🌿","✨","🔗",
  "😟","😰","😔","😲","🌀","😳","💤","😵","🤨","😵‍💫","🔍","😞","😠","💔",
  "😡","❌","🙇‍♀️","🤢","🔥","😒","👍","🚀","🏆","🎉"
];

interface EmojiPickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
}

export function EmojiPicker({ value, onChange, id, className }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative ${className ?? ""}`}>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        maxLength={2}
        className="pr-8"
      />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
      >
        {value || "😊"}
      </button>
      {open && (
        <div className="absolute z-10 mt-1 grid grid-cols-8 gap-1 rounded-md border bg-popover p-2 shadow-md">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(emoji);
                setOpen(false);
              }}
              className="text-lg rounded-xs p-1 hover:bg-accent"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

