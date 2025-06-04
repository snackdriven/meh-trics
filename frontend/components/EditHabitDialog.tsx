import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "./LoadingSpinner";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
import backend from "~backend/client";
import type { Habit, HabitFrequency } from "~backend/task/types";

interface EditHabitDialogProps {
  habit: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHabitUpdated: (habit: Habit) => void;
}

export function EditHabitDialog({ habit, open, onOpenChange, onHabitUpdated }: EditHabitDialogProps) {
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
      setStartDate(new Date(habit.startDate).toISOString().split('T')[0]);
      setEndDate(habit.endDate ? new Date(habit.endDate).toISOString().split('T')[0] : "");
    }
  }, [habit]);

  const {
    loading: submitting,
    execute: updateHabit,
  } = useAsyncOperation(
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
    (error) => showError(error, "Failed to Update Habit")
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateHabit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emoji">Emoji</Label>
              <Input id="emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={2} required />
            </div>
            <div>
              <Label htmlFor="name">Habit Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Drink 8 glasses of water"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why is this habit important to you?"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={(value) => setFrequency(value as HabitFrequency)}>
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
              <Label htmlFor="targetCount">Target Count</Label>
              <Input
                id="targetCount"
                type="number"
                min="1"
                value={targetCount}
                onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                placeholder="1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="endDate">End Date (optional)</Label>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || !name.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                "Update Habit"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
