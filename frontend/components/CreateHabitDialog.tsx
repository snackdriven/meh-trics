import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmojiPicker } from "@/components/EmojiPicker";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import backend from "~backend/client";
import type { Habit, HabitFrequency } from "~backend/task/types";

interface CreateHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHabitCreated: (habit: Habit) => void;
}

const displayFields = {
  namePlaceholder: "e.g., Drink 8 glasses of water",
  descriptionPlaceholder: "Why is this habit important to you?",
  targetCountPlaceholder: "1",
};

export function CreateHabitDialog({ open, onOpenChange, onHabitCreated }: CreateHabitDialogProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🥅");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [targetCount, setTargetCount] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const habit = await backend.task.createHabit({
        name: name.trim(),
        emoji: emoji.trim(),
        description: description.trim() || undefined,
        frequency,
        targetCount,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
      });
      
      onHabitCreated(habit);
      
      // Reset form
      setName("");
      setEmoji("🥅");
      setDescription("");
      setFrequency("daily");
      setTargetCount(1);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate("");
    } catch (error) {
      console.error("Failed to create habit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emoji">Emoji</Label>
              <EmojiPicker id="emoji" value={emoji} onChange={setEmoji} />
            </div>
            <div>
              <Label htmlFor="name">Habit Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={displayFields.namePlaceholder}
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
              placeholder={displayFields.descriptionPlaceholder}
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
                placeholder={displayFields.targetCountPlaceholder}
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
              disabled={isSubmitting || !name.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSubmitting ? "Creating..." : "Create Habit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
