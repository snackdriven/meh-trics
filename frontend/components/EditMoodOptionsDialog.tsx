import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmojiPicker } from "@/components/EmojiPicker";
import { Label } from "@/components/ui/label";
import { useMoodOptions, MoodOption, MoodTier } from "../hooks/useMoodOptions";

interface EditMoodOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMoodOptionsDialog({ open, onOpenChange }: EditMoodOptionsDialogProps) {
  const { moodOptions, setMoodOptions, tierInfo, setTierInfo } = useMoodOptions();
  const [localOptions, setLocalOptions] = useState(moodOptions);
  const [localTierInfo, setLocalTierInfo] = useState(tierInfo);

  useEffect(() => {
    setLocalOptions(moodOptions);
    setLocalTierInfo(tierInfo);
  }, [moodOptions, tierInfo]);

  const handleOptionChange = (tier: MoodTier, index: number, field: keyof MoodOption, value: string) => {
    setLocalOptions(prev => {
      const updated = { ...prev };
      updated[tier] = [...updated[tier]];
      updated[tier][index] = { ...updated[tier][index], [field]: value };
      return updated;
    });
  };

  const handleColorChange = (tier: MoodTier, value: string) => {
    setLocalTierInfo(prev => ({
      ...prev,
      [tier]: { ...prev[tier], color: value },
    }));
  };

  const addMood = (tier: MoodTier) => {
    setLocalOptions(prev => ({
      ...prev,
      [tier]: [...prev[tier], { emoji: "😊", label: "New" }],
    }));
  };

  const saveChanges = () => {
    setMoodOptions(localOptions);
    setTierInfo(localTierInfo);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Mood Options</DialogTitle>
        </DialogHeader>
        {Object.keys(localOptions).map((tier) => (
          <div key={tier} className="space-y-4 mb-6">
            <h3 className="font-medium capitalize">{tier}</h3>
            <div className="mb-2">
              <Label>Color</Label>
              <Input
                type="color"
                value={localTierInfo[tier as MoodTier].color}
                onChange={(e) => handleColorChange(tier as MoodTier, e.target.value)}
                className="w-16 h-8 p-0 border-none"
              />
            </div>
            {localOptions[tier as MoodTier].map((opt, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-2 items-center">
                <EmojiPicker
                  value={opt.emoji}
                  onChange={(v) => handleOptionChange(tier as MoodTier, idx, "emoji", v)}
                />
                <Input
                  value={opt.label}
                  onChange={(e) => handleOptionChange(tier as MoodTier, idx, "label", e.target.value)}
                />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addMood(tier as MoodTier)}>
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
