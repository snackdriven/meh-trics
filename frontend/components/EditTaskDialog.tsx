import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import backend from "~backend/client";
import type { Task, Priority, EnergyLevel } from "~backend/task/types";

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: (task: Task) => void;
}

const commonTags = [
  "work", "personal", "urgent", "errands", "health", "creative", 
  "admin", "social", "learning", "home", "finance", "fun"
];

export function EditTaskDialog({ task, open, onOpenChange, onTaskUpdated }: EditTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>(3);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | "">("");
  const [dueDate, setDueDate] = useState("");
  const [isHardDeadline, setIsHardDeadline] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setEnergyLevel(task.energyLevel || "");
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "");
      setIsHardDeadline(task.isHardDeadline);
      setTags(task.tags);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const updatedTask = await backend.task.updateTask({
        id: task.id,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        energyLevel: energyLevel || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        isHardDeadline,
        tags,
      });
      
      onTaskUpdated(updatedTask);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsSubmitting(false);
    }
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
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional details..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="energyLevel">Energy Level</Label>
              <Select value={energyLevel} onValueChange={(value) => setEnergyLevel(value as EnergyLevel | "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select energy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  <SelectItem value="high">High Energy</SelectItem>
                  <SelectItem value="medium">Medium Energy</SelectItem>
                  <SelectItem value="low">Low Energy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            {dueDate && (
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="hardDeadline"
                  checked={isHardDeadline}
                  onCheckedChange={setIsHardDeadline}
                />
                <Label htmlFor="hardDeadline" className="text-sm">
                  This is a hard deadline (can't be moved)
                </Label>
              </div>
            )}
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
                  placeholder="Add custom tag..."
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
              disabled={isSubmitting || !title.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSubmitting ? "Updating..." : "Update Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
