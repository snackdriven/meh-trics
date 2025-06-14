import { EmojiPicker } from "@/components/EmojiPicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { uiText } from "@/constants/uiText";
import { useEffect, useState } from "react";
import backend from "~backend/client";
import type { Habit, HabitFrequency } from "~backend/habits/types";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
import { LoadingSpinner } from "./LoadingSpinner";

interface EditHabitDialogProps {
  habit: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHabitUpdated: (habit: Habit) => void;
}

export function EditHabitDialog({
  habit,
  open,
  onOpenChange,
  onHabitUpdated,
}: EditHabitDialogProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🥅");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [targetCount, setTargetCount] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setEmoji(habit.emoji);
      setDescription(habit.description || "");
      setFrequency(habit.frequency);
      setTargetCount(habit.targetCount);
      setStartDate(new Date(habit.startDate).toISOString().split("T")[0]);
      setEndDate(
        habit.endDate
          ? new Date(habit.endDate).toISOString().split("T")[0]
          : "",
      );
    }
  }, [habit]);

  const { loading: submitting, execute: updateHabit } = useAsyncOperation(
    async () => {
      if (!name.trim()) {
        throw new Error("Habit name is required");
      }

      const updatedHabit = await backend.task.updateHabit({
        id: habit.id,
        name: name.trim(),
        emoji: emoji.trim(),
        description: description.trim() || undefined,
        frequency,
        targetCount,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
      });

      onHabitUpdated(updatedHabit);

      return updatedHabit;
    },
    () => {
      showSuccess("Habit updated successfully! 🎯");
      onOpenChange(false);
    },
    (error) => showError(error, "Failed to Update Habit"),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateHabit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="edit-habit-desc" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{uiText.editHabit.dialogTitle}</DialogTitle>
        </DialogHeader>
        <DialogDescription id="edit-habit-desc" className="sr-only">
          Update your habit details.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emoji">{uiText.editHabit.emojiLabel}</Label>
              <EmojiPicker id="emoji" value={emoji} onChange={setEmoji} />
            </div>
            <div>
              <Label htmlFor="name">{uiText.editHabit.nameLabel}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={uiText.editHabit.namePlaceholder}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">
              {uiText.editHabit.descriptionLabel}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={uiText.editHabit.descriptionPlaceholder}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="frequency">
                {uiText.editHabit.frequencyLabel}
              </Label>
              <Select
                value={frequency}
                onValueChange={(value) => setFrequency(value as HabitFrequency)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="targetCount">
                {uiText.editHabit.targetCountLabel}
              </Label>
              <Input
                id="targetCount"
                type="number"
                min="1"
                value={targetCount}
                onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                placeholder={uiText.editHabit.targetCountPlaceholder}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">
                {uiText.editHabit.startDateLabel}
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate">{uiText.editHabit.endDateLabel}</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {uiText.editHabit.cancel}
            </Button>
            <Button
              type="submit"
              disabled={submitting || !name.trim()}
              className="bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/90"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {uiText.editHabit.submitting}
                </>
              ) : (
                uiText.editHabit.submit
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
