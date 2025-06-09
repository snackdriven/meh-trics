import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { useState } from "react";
import backend from "~backend/client";
import type {
  EnergyLevel,
  Priority,
  RecurringFrequency,
  RecurringTask,
} from "~backend/task/types";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useTagList } from "../hooks/useTagList";
import { useToast } from "../hooks/useToast";
import { LoadingSpinner } from "./LoadingSpinner";

interface CreateRecurringTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: (task: RecurringTask) => void;
}

export function CreateRecurringTaskDialog({
  open,
  onOpenChange,
  onTaskCreated,
}: CreateRecurringTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<RecurringFrequency>("daily");
  const [priority, setPriority] = useState<Priority>(3);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | "">("");
  const [nextDueDate, setNextDueDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [maxOccurrences, setMaxOccurrences] = useState(1);
  const tagList = useTagList();

  const { showSuccess, showError } = useToast();

  const { loading: submitting, execute: createRecurringTask } =
    useAsyncOperation(
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
          tags: tagList.tags,
        });

        onTaskCreated(task);

        // Reset form
        setTitle("");
        setDescription("");
        setFrequency("daily");
        setPriority(3);
        setEnergyLevel("");
        setNextDueDate(new Date().toISOString().split("T")[0]);
        setMaxOccurrences(1);
        tagList.reset();

        return task;
      },
      () => {
        showSuccess("Recurring task created successfully! 🔄");
        onOpenChange(false);
      },
      (error) => showError(error, "Failed to Create Recurring Task"),
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRecurringTask();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby="create-recurring-task-desc"
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>{uiText.createRecurringTask.dialogTitle}</DialogTitle>
        </DialogHeader>
        <DialogDescription id="create-recurring-task-desc" className="sr-only">
          Fill out the form to create a recurring task template.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">
              {uiText.createRecurringTask.titleLabel}
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={uiText.createRecurringTask.titlePlaceholder}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">
              {uiText.createRecurringTask.descriptionLabel}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={uiText.createRecurringTask.descriptionPlaceholder}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="frequency">
                {uiText.createRecurringTask.frequencyLabel}
              </Label>
              <Select
                value={frequency}
                onValueChange={(value) =>
                  setFrequency(value as RecurringFrequency)
                }
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
              <Label htmlFor="priority">
                {uiText.createRecurringTask.priorityLabel}
              </Label>
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
              <Label htmlFor="maxOccur">
                {uiText.createRecurringTask.maxOccurrencesLabel}
              </Label>
              <Input
                id="maxOccur"
                type="number"
                min={1}
                value={maxOccurrences}
                onChange={(e) =>
                  setMaxOccurrences(parseInt(e.target.value) || 1)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="energyLevel">
                {uiText.createRecurringTask.energyLevelLabel}
              </Label>
              <Select
                value={energyLevel}
                onValueChange={(value) =>
                  setEnergyLevel(value === "none" ? "" : (value as EnergyLevel))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      uiText.createRecurringTask.energySelectPlaceholder
                    }
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

            <div>
              <Label htmlFor="nextDueDate">
                {uiText.createRecurringTask.nextDueDateLabel}
              </Label>
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
            <Label>{uiText.createRecurringTask.tagLabel}</Label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {commonTags.map((tag) => {
                  const isSelected = tagList.tags.includes(tag);
                  return (
                    <Button
                      key={tag}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => tagList.toggleTag(tag)}
                      className={
                        isSelected ? "bg-purple-600 hover:bg-purple-700" : ""
                      }
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
                  placeholder={uiText.createRecurringTask.customTagPlaceholder}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), tagList.addCustomTag())
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={tagList.addCustomTag}
                >
                  {uiText.createRecurringTask.addButton}
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
              {uiText.createRecurringTask.cancel}
            </Button>
            <Button
              type="submit"
              disabled={submitting || !title.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {uiText.createRecurringTask.submitting}
                </>
              ) : (
                uiText.createRecurringTask.submit
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
