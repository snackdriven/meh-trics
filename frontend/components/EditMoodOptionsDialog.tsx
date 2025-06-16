import { EmojiPicker } from "@/components/EmojiPicker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MoodOption, MoodTier } from "@/constants/moods";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useMoodOptions } from "../hooks/useMoodOptions";

interface EditMoodOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMoodOptionsDialog({ open, onOpenChange }: EditMoodOptionsDialogProps) {
  const { moodOptions, setMoodOptions } = useMoodOptions();
  const [localOptions, setLocalOptions] = useState(moodOptions);

  useEffect(() => {
    setLocalOptions(moodOptions);
  }, [moodOptions]);

  const handleOptionChange = (
    tier: MoodTier,
    index: number,
    field: keyof MoodOption,
    value: string | boolean
  ) => {
    setLocalOptions((prev) => {
      const updated = { ...prev };
      updated[tier] = [...updated[tier]];
      updated[tier][index] = { ...updated[tier][index], [field]: value };
      return updated;
    });
  };

  const addMood = (tier: MoodTier) => {
    setLocalOptions((prev) => ({
      ...prev,
      [tier]: [...prev[tier], { emoji: "😊", label: "New", hidden: false }],
    }));
  };

  const moveMood = (tier: MoodTier, index: number, dir: -1 | 1) => {
    setLocalOptions((prev) => {
      const list = [...prev[tier]];
      const newIndex = index + dir;
      if (newIndex < 0 || newIndex >= list.length) return prev;
      const [item] = list.splice(index, 1);
      list.splice(newIndex, 0, item);
      return { ...prev, [tier]: list } as typeof prev;
    });
  };

  const saveChanges = () => {
    setMoodOptions(localOptions);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby="edit-mood-options-desc"
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>Edit Mood Options</DialogTitle>
        </DialogHeader>
        <DialogDescription id="edit-mood-options-desc" className="sr-only">
          Update the available mood options.
        </DialogDescription>
        {Object.keys(localOptions).map((tier) => (
          <div key={tier} className="space-y-4 mb-6">
            <h3 className="font-medium capitalize">{tier}</h3>
            {localOptions[tier as MoodTier].map((opt, idx) => (
              <div key={opt.label} className="grid grid-cols-6 gap-2 items-center">
                <div className="flex flex-col items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => moveMood(tier as MoodTier, idx, -1)}
                    disabled={idx === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => moveMood(tier as MoodTier, idx, 1)}
                    disabled={idx === localOptions[tier as MoodTier].length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <EmojiPicker
                  value={opt.emoji}
                  onChange={(v) => handleOptionChange(tier as MoodTier, idx, "emoji", v)}
                />
                <Input
                  value={opt.label}
                  onChange={(e) =>
                    handleOptionChange(tier as MoodTier, idx, "label", e.target.value)
                  }
                />
                <Input
                  value={opt.description || ""}
                  placeholder="Tooltip"
                  onChange={(e) =>
                    handleOptionChange(tier as MoodTier, idx, "description", e.target.value)
                  }
                />
                <div className="flex items-center gap-1">
                  <Checkbox
                    id={`hide-${tier}-${idx}`}
                    checked={opt.hidden ?? false}
                    onCheckedChange={(checked) =>
                      handleOptionChange(tier as MoodTier, idx, "hidden", checked === true)
                    }
                  />
                  <Label htmlFor={`hide-${tier}-${idx}`} className="text-xs">
                    Hide
                  </Label>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addMood(tier as MoodTier)}
            >
              Add Mood
            </Button>
          </div>
        ))}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={saveChanges}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
