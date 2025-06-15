import { Badge } from "@/components/ui/badge";
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
import { commonTags } from "@/constants/tags";
import { uiText } from "@/constants/uiText";
import { X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import backend from "~backend/client";
import type { EnergyLevel, Priority, Task } from "~backend/task/types";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useAutoTags } from "../hooks/useAutoTags";
import { useOfflineTasks } from "../hooks/useOfflineTasks";
import { useTagList } from "../hooks/useTagList";
import { useToast } from "../hooks/useToast";
import { LoadingSpinner } from "./LoadingSpinner";
import { TagSelector } from "./TagSelector";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: (task: Task) => void;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  onTaskCreated,
}: CreateTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>(3);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | "">("");
  const [dueDate, setDueDate] = useState("");
  const [isHardDeadline, setIsHardDeadline] = useState(false);
  const tagList = useTagList();
  const { tags: autoTags } = useAutoTags();
  const descId = useId();

  useEffect(() => {
    if (open && autoTags.length > 0 && tagList.tags.length === 0) {
      tagList.setTags(autoTags);
    }
  }, [open, autoTags]);

  const { showSuccess, showError } = useToast();
  const { createTask: createOfflineTask, pending, syncing } = useOfflineTasks();

  const { loading: submitting, execute: createTask } = useAsyncOperation(
    async () => {
      if (!title.trim()) {
        throw new Error("Task title is required");
      }
      const data = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        energyLevel: energyLevel || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        isHardDeadline,
        tags: tagList.tags,
      } as const;

      const task = await createOfflineTask(data);

      if (task) {
        onTaskCreated(task);
      }

      // Reset form
      setTitle("");
      setDescription("");
      setPriority(3);
      setEnergyLevel("");
      setDueDate("");
      setIsHardDeadline(false);
      tagList.reset();

      return task;
    },
    () => {
      showSuccess(
        navigator.onLine
          ? "Task created successfully! 📝"
          : "Task queued for sync",
      );
      onOpenChange(false);
    },
    (error) => showError(error, "Failed to Create Task"),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTask();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={descId}
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle>Create New Task</DialogTitle>
          {(pending > 0 || syncing) && (
            <Badge
              variant="outline"
              className="text-xs flex items-center gap-1"
            >
              {syncing && <LoadingSpinner size="sm" className="mr-1" />}
              {syncing ? "Syncing..." : `${pending} pending`}
            </Badge>
          )}
        </DialogHeader>
        <DialogDescription id={descId} className="sr-only">
          Fill out the form to create a new task.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={uiText.createTask.titlePlaceholder}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={uiText.createTask.descriptionPlaceholder}
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
                    placeholder={uiText.createTask.energySelectPlaceholder}
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
                  {uiText.createTask.hardDeadlineLabel}
                </Label>
              </div>
            )}
          </div>

          <div>
            <Label>Tags</Label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(autoTags.length > 0 ? autoTags : commonTags).map((tag) => {
                  const isSelected = tagList.tags.includes(tag);
                  return (
                    <Button
                      key={tag}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => tagList.toggleTag(tag)}
                    >
                      {tag}
                    </Button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Input
                  value={tagList.customTag}
                  onChange={(e) => tagList.setCustomTag(e.target.value)}
                  placeholder={uiText.createTask.customTagPlaceholder}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), tagList.addCustomTag())
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={tagList.addCustomTag}
                >
                  {uiText.createTask.addButton}
                </Button>
              </div>

              {tagList.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tagList.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => tagList.removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {uiText.createTask.cancel}
            </Button>
            <Button
              type="submit"
              disabled={submitting || !title.trim()}
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {uiText.createTask.submitting}
                </>
              ) : (
                uiText.createTask.submit
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
