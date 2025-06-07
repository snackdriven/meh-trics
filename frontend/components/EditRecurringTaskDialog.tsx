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
import { uiText } from "@/constants/uiText";
import { useEffect, useState } from "react";
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
import { TagSelector } from "./TagSelector";

interface EditRecurringTaskDialogProps {
  task: RecurringTask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: (task: RecurringTask) => void;
}

export function EditRecurringTaskDialog({
  task,
  open,
  onOpenChange,
  onTaskUpdated,
}: EditRecurringTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<RecurringFrequency>("daily");
  const [priority, setPriority] = useState<Priority>(3);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | "">("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [maxOccurrences, setMaxOccurrences] = useState(1);
  const tagList = useTagList();

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setFrequency(task.frequency);
      setPriority(task.priority);
      setEnergyLevel(task.energyLevel || "");
      setNextDueDate(new Date(task.nextDueDate).toISOString().split("T")[0]);
      setMaxOccurrences(task.maxOccurrencesPerCycle);
      tagList.setTags(task.tags);
    }
  }, [task]);

  const { loading: submitting, execute: updateRecurringTask } =
    useAsyncOperation(
      async () => {
        if (!title.trim()) {
          throw new Error("Task title is required");
        }

        const updatedTask = await backend.task.updateRecurringTask({
          id: task.id,
          title: title.trim(),
          description: description.trim() || undefined,
          frequency,
          maxOccurrencesPerCycle: maxOccurrences,
          priority,
          energyLevel: energyLevel || undefined,
          nextDueDate: new Date(nextDueDate),
          tags: tagList.tags,
        });

        onTaskUpdated(updatedTask);

        return updatedTask;
      },
      () => {
        showSuccess("Recurring task updated successfully! 🔄");
        onOpenChange(false);
      },
      (error) => showError(error, "Failed to Update Recurring Task"),
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateRecurringTask();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Recurring Task Template</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={uiText.editRecurringTask.titlePlaceholder}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={uiText.editRecurringTask.descriptionPlaceholder}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="frequency">Frequency</Label>
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
              <Label htmlFor="maxOccurEdit">Times / cycle</Label>
              <Input
                id="maxOccurEdit"
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
              <Label htmlFor="energyLevel">Energy Level</Label>
              <Select
                value={energyLevel}
                onValueChange={(value) =>
                  setEnergyLevel(value === "none" ? "" : (value as EnergyLevel))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      uiText.editRecurringTask.energySelectPlaceholder
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

          <TagSelector tagList={tagList} />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {uiText.editRecurringTask.cancel}
            </Button>
            <Button
              type="submit"
              disabled={submitting || !title.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {uiText.editRecurringTask.submitting}
                </>
              ) : (
                uiText.editRecurringTask.submit
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
