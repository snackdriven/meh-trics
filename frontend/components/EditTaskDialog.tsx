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
import type { EnergyLevel, Priority, Task } from "~backend/task/types";
import { useTagList } from "../hooks/useTagList";
import { TagSelector } from "./TagSelector";

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: (task: Task) => void;
}

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
  onTaskUpdated,
}: EditTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>(3);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | "">("");
  const [dueDate, setDueDate] = useState("");
  const [isHardDeadline, setIsHardDeadline] = useState(false);
  const tagList = useTagList();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setEnergyLevel(task.energyLevel || "");
      setDueDate(
        task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      );
      setIsHardDeadline(task.isHardDeadline);
      tagList.setTags(task.tags);
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
        tags: tagList.tags,
      });

      onTaskUpdated(updatedTask);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby="edit-task-desc"
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <DialogDescription id="edit-task-desc" className="sr-only">
          Update the details for this task.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={uiText.editTask.titlePlaceholder}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={uiText.editTask.descriptionPlaceholder}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority.toString()}
                onValueChange={(value) =>
                  setPriority(parseInt(value) as Priority)
                }
              >
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
              <Select
                value={energyLevel}
                onValueChange={(value) =>
                  setEnergyLevel(value === "none" ? "" : (value as EnergyLevel))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={uiText.editTask.energySelectPlaceholder}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not specified</SelectItem>
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
                  onCheckedChange={(checked) =>
                    setIsHardDeadline(checked === true)
                  }
                />
                <Label htmlFor="hardDeadline" className="text-sm">
                  {uiText.editTask.hardDeadlineLabel}
                </Label>
              </div>
            )}
          </div>

          <TagSelector tagList={tagList} />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {uiText.editTask.cancel}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/90"
            >
              {isSubmitting
                ? uiText.editTask.submitting
                : uiText.editTask.submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
