import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
import backend from "~backend/client";
import type { RecurringTask, Priority, EnergyLevel, RecurringFrequency } from "~backend/task/types";

interface CreateRecurringTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: (task: RecurringTask) => void;
}

const commonTags = [
  "work", "personal", "urgent", "errands", "health", "creative",
  "admin", "social", "learning", "home", "finance", "fun"
];

const displayFields = {
  titlePlaceholder: "What task should be created regularly?",
  descriptionPlaceholder: "Any additional details...",
  energyPlaceholder: "Select energy",
  customTagPlaceholder: "Add custom tag...",
};

export function CreateRecurringTaskDialog({ open, onOpenChange, onTaskCreated }: CreateRecurringTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<RecurringFrequency>("daily");
  const [priority, setPriority] = useState<Priority>(3);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | "">("");
  const [nextDueDate, setNextDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [maxOccurrences, setMaxOccurrences] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");

  const { showSuccess, showError } = useToast();

  const {
    loading: submitting,
    execute: createRecurringTask,
  } = useAsyncOperation(
    async () => {
      if (!title.trim()) {
        throw new Error("Task title is required");
      }

      const task = await backend.task.createRecurringTask({
        title: title.trim(),
        description: description.trim() || undefined,
        frequency,
        maxOccurrencesPerCycle: maxOccurrences,
        priority,
        energyLevel: energyLevel || undefined,
        nextDueDate: new Date(nextDueDate),
        tags,
      });
      
      onTaskCreated(task);
      
      // Reset form
      setTitle("");
      setDescription("");
      setFrequency("daily");
      setPriority(3);
      setEnergyLevel("");
      setNextDueDate(new Date().toISOString().split('T')[0]);
      setMaxOccurrences(1);
      setTags([]);
      setCustomTag("");
      
      return task;
    },
    () => {
      showSuccess("Recurring task created successfully! 🔄");
      onOpenChange(false);
    },
    (error) => showError(error, "Failed to Create Recurring Task")
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRecurringTask();
  };

  const toggleTag = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags(prev => [...prev, customTag.trim()]);
      setCustomTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Recurring Task Template</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={displayFields.titlePlaceholder}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={displayFields.descriptionPlaceholder}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={(value) => setFrequency(value as RecurringFrequency)}>
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
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority.toString()} onValueChange={(value) => setPriority(parseInt(value) as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Lowest</SelectItem>
                  <SelectItem value="2">Low</SelectItem>
                  <SelectItem value="3">Medium</SelectItem>
                  <SelectItem value="4">High</SelectItem>
                  <SelectItem value="5">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="maxOccur">Times / cycle</Label>
              <Input
                id="maxOccur"
                type="number"
                min={1}
                value={maxOccurrences}
                onChange={(e) => setMaxOccurrences(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="energyLevel">Energy Level</Label>
              <Select value={energyLevel} onValueChange={(value) => setEnergyLevel(value === "none" ? "" : (value as EnergyLevel))}>
                <SelectTrigger>
                  <SelectValue placeholder={displayFields.energyPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not specified</SelectItem>
                  <SelectItem value="high">High Energy</SelectItem>
                  <SelectItem value="medium">Medium Energy</SelectItem>
                  <SelectItem value="low">Low Energy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="nextDueDate">Next Due Date</Label>
              <Input
                id="nextDueDate"
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <Label>Tags</Label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {commonTags.map((tag) => {
                  const isSelected = tags.includes(tag);
                  return (
                    <Button
                      key={tag}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTag(tag)}
                      className={isSelected ? "bg-purple-600 hover:bg-purple-700" : ""}
                    >
                      {tag}
                    </Button>
                  );
                })}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder={displayFields.customTagPlaceholder}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                />
                <Button type="button" variant="outline" onClick={addCustomTag}>
                  Add
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || !title.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                "Create Template"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
