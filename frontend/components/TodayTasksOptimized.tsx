import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { Calendar, CheckSquare, ChevronDown, ChevronRight, Clock } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import backend from "~backend/client";
import type { Task, TaskStatus } from "~backend/task/types";
import { useCollapse } from "../hooks/useCollapse";
import { useConfetti } from "../hooks/useConfetti";
import { useOfflineTasks } from "../hooks/useOfflineTasks";
import { useToast } from "../hooks/useToast";
import { getEmptyStateColor } from "../lib/colors";

interface TodayTasksProps {
  date: string;
}

/**
 * Optimized TodayTasks Component
 *
 * Performance optimizations:
 * - Memoized task processing and filtering
 * - Stable callback references to prevent child re-renders
 * - Optimized completion statistics calculation
 * - Better loading states with skeleton placeholders
 *
 * Accessibility improvements:
 * - ARIA labels for screen readers
 * - Semantic markup for task completion states
 * - Keyboard navigation support
 * - Live region updates for status changes
 */
export const TodayTasks = memo(({ date }: TodayTasksProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [includeOverdue, setIncludeOverdue] = useState(false);
  const [includeNoDue, setIncludeNoDue] = useState(false);
  const [sortBy, setSortBy] = useState<"priority" | "created">("priority");
  const [quickTitle, setQuickTitle] = useState("");
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [newDueDate, setNewDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const { showError, showSuccess } = useToast();
  const { collapsed, toggle } = useCollapse("today_tasks");
  const showConfetti = useConfetti();
  const { createTask: createOfflineTask } = useOfflineTasks();

  // Memoized task processing with filtering and sorting
  const processedTasks = useMemo(() => {
    if (!tasks.length) return [];

    const filteredTasks = [...tasks];

    // Apply filters (if needed in the future)
    // This structure allows for easy extension

    // Apply sorting
    return filteredTasks.sort((a, b) => {
      if (sortBy === "priority") {
        return b.priority - a.priority;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [tasks, sortBy]);

  // Memoized task statistics for better performance
  const taskStats = useMemo(() => {
    const total = processedTasks.length;
    const completed = processedTasks.filter((task) => task.status === "done").length;
    const pending = processedTasks.filter((task) => task.status === "pending").length;
    const inProgress = processedTasks.filter((task) => task.status === "in_progress").length;

    // Calculate overdue tasks
    const now = new Date();
    const overdue = processedTasks.filter((task) => {
      if (!task.dueDate || task.status === "done") return false;
      return new Date(task.dueDate) < now;
    }).length;

    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      pending,
      inProgress,
      overdue,
      completionRate,
    };
  }, [processedTasks]);

  // Memoized selected task information
  const selectionInfo = useMemo(
    () => ({
      count: selectedIds.length,
      hasSelected: selectedIds.length > 0,
      allSelected: selectedIds.length === processedTasks.length && processedTasks.length > 0,
    }),
    [selectedIds.length, processedTasks.length]
  );

  // Stable callback references to prevent unnecessary re-renders
  const memoizedHandlers = useMemo(
    () => ({
      onToggleSelect: (id: number, checked: boolean) => {
        setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)));
      },

      onSelectAll: (checked: boolean) => {
        setSelectedIds(checked ? processedTasks.map((t) => t.id) : []);
      },

      onStatusChange: async (id: number, status: TaskStatus) => {
        // Optimistic update for immediate UI feedback
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));

        try {
          await backend.task.updateTask(id, { status });
          if (status === "done") {
            showConfetti();
            showSuccess("Task completed! 🎉");
          }
        } catch (error) {
          // Revert optimistic update on error
          setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: t.status } : t)));
          showError("Failed to update task status", "Update Error");
        }
      },

      onBulkComplete: async () => {
        if (!selectionInfo.hasSelected) return;

        // Optimistic update
        setTasks((prev) =>
          prev.map((t) => (selectedIds.includes(t.id) ? { ...t, status: "done" as TaskStatus } : t))
        );

        try {
          await Promise.all(
            selectedIds.map((id) => backend.task.updateTask(id, { status: "done" }))
          );
          showConfetti();
          showSuccess(`${selectedIds.length} tasks completed! 🎉`);
          setSelectedIds([]);
        } catch (error) {
          // Revert on error
          loadTasks();
          showError("Failed to complete tasks", "Bulk Update Error");
        }
      },

      onBulkReschedule: async () => {
        if (!selectionInfo.hasSelected || !newDueDate) return;

        try {
          await Promise.all(
            selectedIds.map((id) => backend.task.updateTask(id, { dueDate: newDueDate }))
          );
          showSuccess(`${selectedIds.length} tasks rescheduled`);
          setSelectedIds([]);
          setRescheduleDialogOpen(false);
          setNewDueDate("");
          loadTasks();
        } catch (error) {
          showError("Failed to reschedule tasks", "Bulk Update Error");
        }
      },

      onQuickAdd: async () => {
        if (!quickTitle.trim()) return;

        try {
          setLoading(true);
          const newTask = await createOfflineTask({
            title: quickTitle.trim(),
            dueDate: date,
            priority: 1,
            status: "pending",
          });
          setTasks((prev) => [newTask, ...prev]);
          setQuickTitle("");
          showSuccess("Task added! 📝");
        } catch (error) {
          showError("Failed to create task", "Creation Error");
        } finally {
          setLoading(false);
        }
      },
    }),
    [
      selectedIds,
      selectionInfo.hasSelected,
      processedTasks,
      newDueDate,
      quickTitle,
      date,
      showConfetti,
      showSuccess,
      showError,
      createOfflineTask,
    ]
  );

  // Optimized load function with proper dependency array
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await backend.task.listDueTasks({
        date,
        includeOverdue: includeOverdue ? "true" : undefined,
        includeNoDue: includeNoDue ? "true" : undefined,
      });
      setTasks(res.tasks);
    } catch (error) {
      showError("Failed to load tasks. Please try again.", "Loading Error");
    } finally {
      setLoading(false);
    }
  }, [date, includeOverdue, includeNoDue, showError]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Memoized filter controls to prevent unnecessary re-renders
  const filterControls = useMemo(
    () => (
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="include-overdue"
            checked={includeOverdue}
            onCheckedChange={setIncludeOverdue}
          />
          <Label htmlFor="include-overdue" className="text-sm">
            Include overdue
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="include-no-due" checked={includeNoDue} onCheckedChange={setIncludeNoDue} />
          <Label htmlFor="include-no-due" className="text-sm">
            Include no due date
          </Label>
        </div>
        <Select value={sortBy} onValueChange={(value: "priority" | "created") => setSortBy(value)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">By priority</SelectItem>
            <SelectItem value="created">By created date</SelectItem>
          </SelectContent>
        </Select>
      </div>
    ),
    [includeOverdue, includeNoDue, sortBy]
  );

  // Memoized bulk actions to prevent re-renders
  const bulkActions = useMemo(() => {
    if (!selectionInfo.hasSelected) return null;

    return (
      <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
        <span className="text-sm font-medium">{selectionInfo.count} selected</span>
        <Button size="sm" onClick={memoizedHandlers.onBulkComplete} className="ml-auto">
          <CheckSquare className="w-4 h-4 mr-1" />
          Complete All
        </Button>
        <Button size="sm" variant="outline" onClick={() => setRescheduleDialogOpen(true)}>
          <Calendar className="w-4 h-4 mr-1" />
          Reschedule
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
          Clear
        </Button>
      </div>
    );
  }, [selectionInfo, memoizedHandlers.onBulkComplete]);

  // Memoized progress indicator
  const progressIndicator = useMemo(
    () => (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>
          {taskStats.completed}/{taskStats.total} complete
        </span>
        {taskStats.total > 0 && (
          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-24">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${taskStats.completionRate}%` }}
              aria-label={`${taskStats.completionRate.toFixed(0)}% complete`}
            />
          </div>
        )}
        {taskStats.overdue > 0 && (
          <Badge variant="destructive" className="text-xs">
            {taskStats.overdue} overdue
          </Badge>
        )}
      </div>
    ),
    [taskStats]
  );

  // Loading state with skeleton
  if (loading && tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-controls="today-tasks-content"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {collapsed ? (
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              )}
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" aria-hidden="true" />
                Today's Tasks
                {taskStats.total > 0 && (
                  <Badge variant="outline">
                    {taskStats.completed}/{taskStats.total}
                  </Badge>
                )}
              </CardTitle>
            </div>
            {!collapsed && progressIndicator}
          </div>
        </CardHeader>

        {!collapsed && (
          <CardContent id="today-tasks-content">
            {/* Quick add task */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Quick add task..."
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && memoizedHandlers.onQuickAdd()}
                aria-label="Quick add task"
              />
              <Button
                onClick={memoizedHandlers.onQuickAdd}
                disabled={!quickTitle.trim() || loading}
              >
                Add
              </Button>
            </div>

            {filterControls}
            {bulkActions}

            {/* Task list */}
            <div className="space-y-2" role="list" aria-label="Today's tasks" aria-live="polite">
              {processedTasks.length === 0 ? (
                <div
                  className={`text-center py-8 text-gray-500 ${getEmptyStateColor()}`}
                  role="status"
                >
                  {includeOverdue || includeNoDue
                    ? "No tasks found with current filters"
                    : "No tasks due today"}
                </div>
              ) : (
                processedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isSelected={selectedIds.includes(task.id)}
                    onToggleSelect={memoizedHandlers.onToggleSelect}
                    onStatusChange={memoizedHandlers.onStatusChange}
                  />
                ))
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Reschedule dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Selected Tasks</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="new-due-date">New due date</Label>
            <Input
              id="new-due-date"
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={memoizedHandlers.onBulkReschedule} disabled={!newDueDate}>
              Reschedule {selectionInfo.count} tasks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

TodayTasks.displayName = "TodayTasks";

/**
 * Optimized TaskItem component for individual task rendering
 */
interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onToggleSelect: (id: number, checked: boolean) => void;
  onStatusChange: (id: number, status: TaskStatus) => void;
}

const TaskItem = memo(({ task, isSelected, onToggleSelect, onStatusChange }: TaskItemProps) => {
  const isCompleted = task.status === "done";
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        isCompleted
          ? "bg-green-50 border-green-200"
          : isOverdue
            ? "bg-red-50 border-red-200"
            : "bg-gray-50"
      }`}
      role="listitem"
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={(checked) => onToggleSelect(task.id, !!checked)}
        aria-label={`Select task: ${task.title}`}
      />

      <div className="flex-1 min-w-0">
        <div className={`font-medium ${isCompleted ? "line-through text-gray-500" : ""}`}>
          {task.title}
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {new Date(task.dueDate).toLocaleDateString()}
            {isOverdue && (
              <Badge variant="destructive" className="text-xs ml-1">
                Overdue
              </Badge>
            )}
          </div>
        )}
      </div>

      <Select
        value={task.status}
        onValueChange={(status: TaskStatus) => onStatusChange(task.id, status)}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="done">Done</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
});

TaskItem.displayName = "TaskItem";
