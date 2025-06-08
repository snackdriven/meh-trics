import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import backend from "~backend/client";
import { MoodEntry, MoodTier } from "~backend/task/types";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useMoodOptions } from "../hooks/useMoodOptions";
import { useToast } from "../hooks/useToast";

interface MoodEditorDialogProps {
  date: Date;
  entry: MoodEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (entry: MoodEntry) => void;
}

export function MoodEditorDialog({
  date,
  entry,
  open,
  onOpenChange,
  onSaved,
}: MoodEditorDialogProps) {
  const { moodOptions } = useMoodOptions();
  const { showSuccess, showError } = useToast();
  const [selectedTier, setSelectedTier] = useState<MoodTier | null>(
    entry?.tier ?? null,
  );
  const [selectedMood, setSelectedMood] = useState<{
    emoji: string;
    label: string;
  } | null>(entry ? { emoji: entry.emoji, label: entry.label } : null);
  const [selectedSecondaryTier, setSelectedSecondaryTier] =
    useState<MoodTier | null>(entry?.secondaryTier ?? null);
  const [selectedSecondaryMood, setSelectedSecondaryMood] = useState<{
    emoji: string;
    label: string;
  } | null>(
    entry?.secondaryEmoji && entry.secondaryLabel
      ? { emoji: entry.secondaryEmoji, label: entry.secondaryLabel }
      : null,
  );
  const [notes, setNotes] = useState(entry?.notes ?? "");

  useEffect(() => {
    setSelectedTier(entry?.tier ?? null);
    setSelectedMood(entry ? { emoji: entry.emoji, label: entry.label } : null);
    setSelectedSecondaryTier(entry?.secondaryTier ?? null);
    setSelectedSecondaryMood(
      entry?.secondaryEmoji && entry.secondaryLabel
        ? { emoji: entry.secondaryEmoji, label: entry.secondaryLabel }
        : null,
    );
    setNotes(entry?.notes ?? "");
  }, [entry, open]);

  const { loading: submitting, execute: save } = useAsyncOperation(
    async () => {
      if (!selectedTier || !selectedMood)
        throw new Error("Please select a mood");
      const saved = await backend.task.createMoodEntry({
        date,
        tier: selectedTier,
        emoji: selectedMood.emoji,
        label: selectedMood.label,
        secondaryTier: selectedSecondaryTier ?? undefined,
        secondaryEmoji: selectedSecondaryMood?.emoji,
        secondaryLabel: selectedSecondaryMood?.label,
        notes: notes.trim() || undefined,
      });
      onSaved(saved);
      return saved;
    },
    () => {
      showSuccess("Mood saved");
      onOpenChange(false);
    },
    (err) => showError(err, "Save Error"),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Mood</DialogTitle>
        </DialogHeader>
        {Object.entries(moodOptions).map(([tier, options]) => (
          <div key={`primary-${tier}`} className="space-y-2">
            <h4 className="font-medium capitalize">{tier}</h4>
            <div className="grid grid-cols-4 gap-2">
              {options
                .filter((o) => !o.hidden)
                .map((option) => {
                  const isSelected = selectedMood?.label === option.label;
                  return (
                    <Button
                      key={option.label}
                      variant={isSelected ? "default" : "outline"}
                      className={`flex flex-col items-center gap-1 h-auto py-2 ${isSelected ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                      onClick={() => {
                        setSelectedTier(tier as MoodTier);
                        setSelectedMood(option);
                      }}
                      title={option.description || option.label}
                    >
                      <span className="text-lg">{option.emoji}</span>
                      <span className="text-xs">{option.label}</span>
                    </Button>
                  );
                })}
            </div>
          </div>
        ))}

        <h4 className="font-medium mt-4">Secondary Mood (optional)</h4>
        {Object.entries(moodOptions).map(([tier, options]) => (
          <div key={`secondary-${tier}`} className="space-y-2">
            <h5 className="font-medium capitalize">{tier}</h5>
            <div className="grid grid-cols-4 gap-2">
              {options
                .filter((o) => !o.hidden)
                .map((option) => {
                  const isSelected =
                    selectedSecondaryMood?.label === option.label;
                  return (
                    <Button
                      key={option.label}
                      variant={isSelected ? "default" : "outline"}
                      className={`flex flex-col items-center gap-1 h-auto py-2 ${
                        isSelected ? "bg-purple-600 hover:bg-purple-700" : ""
                      }`}
                      onClick={() => {
                        setSelectedSecondaryTier(tier as MoodTier);
                        setSelectedSecondaryMood(option);
                      }}
                      title={option.description || option.label}
                    >
                      <span className="text-lg">{option.emoji}</span>
                      <span className="text-xs">{option.label}</span>
                    </Button>
                  );
                })}
            </div>
          </div>
        ))}
        <div>
          <Label htmlFor="moodNotes">Notes</Label>
          <Textarea
            id="moodNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selectedTier || !selectedMood || submitting}
            onClick={() => save()}
          >
            {submitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
