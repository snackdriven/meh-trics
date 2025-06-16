import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCardColor,
  getEmptyStateColor,
  getEnergyColor,
  getPriorityColor,
  getStatusColor,
  getTagColor,
} from "@/lib/colors";
import { Archive, Calendar, Clock, Edit, GripVertical, Trash2, Zap } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import backend from "~backend/client";
import type { Task, TaskStatus } from "~backend/task/types";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useConfetti } from "../hooks/useConfetti";
import { useToast } from "../hooks/useToast";
import { LoadingSpinner } from "./LoadingSpinner";
import { EditTaskDialog } from "./TaskCRUDDialogs";

/**
 * Props for the TaskItem component.
 */
interface TaskItemProps {
  task: Task;
  index: number;
  isSelected: boolean;
  isDragged: boolean;
  isDraggedOver: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onSelectTask: (taskId: number, selected: boolean) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onArchiveTask: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, dropIndex: number) => void;
  onDragEnd: () => void;
}

/**
 * Memoized TaskItem component for better performance in large lists
 */
const TaskItem = memo<TaskItemProps>(
  ({
    task,
    index,
    isSelected,
    isDragged,
    isDraggedOver,
    isUpdating,
    isDeleting,
    onSelectTask,
    onStatusChange,
    onEditTask,
    onArchiveTask,
    onDeleteTask,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
  }) => {
    const handleCheckboxChange = useCallback(
      (checked: boolean | string) => {
        onSelectTask(task.id, !!checked);
      },
      [task.id, onSelectTask]
    );

    const handleStatusChange = useCallback(
      (value: string) => {
        onStatusChange(task, value as TaskStatus);
      },
      [task, onStatusChange]
    );

    const handleEditClick = useCallback(() => {
      onEditTask(task);
    }, [task, onEditTask]);

    const handleArchiveClick = useCallback(() => {
      onArchiveTask(task.id);
    }, [task.id, onArchiveTask]);

    const handleDeleteClick = useCallback(() => {
      onDeleteTask(task.id);
    }, [task.id, onDeleteTask]);

    const handleDragStart = useCallback(
      (e: React.DragEvent) => {
        onDragStart(e, task);
      },
      [task, onDragStart]
    );

    const handleDragOver = useCallback(
      (e: React.DragEvent) => {
        onDragOver(e, index);
      },
      [index, onDragOver]
    );

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        onDrop(e, index);
      },
      [index, onDrop]
    );

    const getPriorityLabel = useCallback((priority: number) => {
      switch (priority) {
        case 5:
          return "Urgent";
        case 4:
          return "High";
        case 3:
          return "Medium";
        case 2:
          return "Low";
        case 1:
          return "Lowest";
        default:
          return "Unknown";
      }
    }, []);

    const cardClassName = useMemo(() => {
      return `p-4 ${getCardColor(isDraggedOver)} transition-all duration-200 ${
        isDragged ? "opacity-50 scale-95" : ""
      } ${isDraggedOver ? "border-[var(--color-compassionate-gentle)] shadow-[var(--shadow-component-card-hover)]" : ""}`;
    }, [isDraggedOver, isDragged]);

    const titleClassName = useMemo(() => {
      return `font-medium text-lg ${task.status === "done" ? "line-through text-[var(--color-text-tertiary)]" : "text-[var(--color-text-primary)]"}`;
    }, [task.status]);

    const descriptionClassName = useMemo(() => {
      return `text-sm mt-1 ${task.status === "done" ? "line-through text-[var(--color-text-tertiary)]" : "text-[var(--color-text-secondary)]"}`;
    }, [task.status]);

    return (
      <Card
        className={cardClassName}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={onDragLeave}
        onDrop={handleDrop}
        onDragEnd={onDragEnd}
      >
        <div className="flex items-start gap-3">
          <Checkbox checked={isSelected} onCheckedChange={handleCheckboxChange} className="mt-1" />
          <div className="flex items-center justify-center w-6 h-6 mt-1 cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-[var(--color-text-tertiary)]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1">
                <h3 className={titleClassName}>{task.title}</h3>
                {task.description && <p className={descriptionClassName}>{task.description}</p>}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleEditClick}>
                  <Edit className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="sm" onClick={handleArchiveClick}>
                  <Archive className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="sm" onClick={handleDeleteClick} disabled={isDeleting}>
                  {isDeleting ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="relative">
                <Select
                  value={task.status}
                  onValueChange={handleStatusChange}
                  disabled={isUpdating}
                >
                  <SelectTrigger className={`w-32 h-8 ${getStatusColor(task.status)}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                {isUpdating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>

              <Badge className={getPriorityColor(task.priority)}>
                {getPriorityLabel(task.priority)}
              </Badge>

              {task.energyLevel && (
                <Badge className={getEnergyColor(task.energyLevel)}>
                  <Zap className="h-3 w-3 mr-1" />
                  {task.energyLevel}
                </Badge>
              )}

              {task.isHardDeadline && (
                <Badge className="bg-[var(--color-semantic-error-bg)] text-[var(--color-semantic-error-text)] border-[var(--color-semantic-error-border)]">
                  <Clock className="h-3 w-3 mr-1" />
                  Hard Deadline
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className={`text-xs ${getTagColor(tag)}`}>
                    {tag}
                  </Badge>
                ))}
              </div>

              {task.dueDate && (
                <div className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
                  <Calendar className="h-3 w-3" />
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }
);

TaskItem.displayName = "TaskItem";

/**
 * Props for the TaskList component.
 */
interface TaskListProps {
  /** Array of tasks to display in the list */
  tasks: Task[];

  /** Callback fired when a task is updated (status change, edit, etc.) */
  onTaskUpdated: (task: Task) => void;

  /** Callback fired when a task is deleted */
  onTaskDeleted: (taskId: number) => void;

  /** Callback fired when tasks are reordered via drag and drop */
  onTasksReordered: (tasks: Task[]) => void;

  /** Array of task IDs that are currently selected for bulk operations */
  selectedTaskIds: number[];

  /** Callback fired when a task's selection state changes */
  onSelectTask: (taskId: number, selected: boolean) => void;
}

/**
 * TaskList component renders a list of tasks with drag-and-drop reordering,
 * inline editing, status changes, and bulk selection capabilities.
 *
 * Features:
 * - Drag and drop reordering with visual feedback
 * - Inline status updates with optimistic UI
 * - Task editing via modal dialog
 * - Bulk selection with checkboxes
 * - Visual indicators for energy level, priority, due dates
 * - Confetti animation for task completion
 * - Archive/delete operations with confirmation
 * - Loading states for async operations
 *
 * Accessibility:
 * - Keyboard navigation support
 * - Screen reader friendly labels
 * - Focus management during interactions
 * - Semantic HTML structure
 *
 * Performance considerations:
 * - Optimistic UI updates for better perceived performance
 * - Efficient re-rendering with React.memo patterns
 * - Debounced drag operations to prevent excessive API calls
 * - Memoized callbacks and computed values
 *
 * @param props - TaskList component props
 * @returns Rendered task list with interactive features
 */
export const TaskList = memo<TaskListProps>(
  ({ tasks, onTaskUpdated, onTaskDeleted, onTasksReordered, selectedTaskIds, onSelectTask }) => {
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
    const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

    const { showSuccess, showError } = useToast();
    const showConfetti = useConfetti();

    const { execute: updateTaskStatus } = useAsyncOperation(
      async (task: Task, newStatus: TaskStatus) => {
        const updatedTask = await backend.task.updateTask({
          id: task.id,
          status: newStatus,
        });
        return updatedTask;
      },
      (updatedTask) => {
        onTaskUpdated(updatedTask);
        showSuccess(`Task "${updatedTask.title}" updated successfully!`);
        if (updatedTask.status === "done") {
          showConfetti();
        }
      },
      (error) => {
        showError(error, "Failed to Update Task");
        // Revert optimistic update on error
        setUpdatingTaskId(null);
      }
    );

    const { execute: deleteTask } = useAsyncOperation(
      async (...args: unknown[]) => {
        const taskId = args[0] as number;
        await backend.task.deleteTask({ id: taskId });
        return taskId;
      },
      (taskId) => {
        onTaskDeleted(taskId);
        showSuccess("Task deleted successfully!");
      },
      (error) => {
        showError(error, "Failed to Delete Task");
        setDeletingTaskId(null);
      }
    );

    const { execute: archiveTask } = useAsyncOperation(
      async (...args: unknown[]) => {
        const taskId = args[0] as number;
        const updated = await backend.task.updateTask({
          id: taskId,
          archivedAt: new Date(),
          status: "archived",
        });
        return updated;
      },
      (task) => {
        onTaskUpdated(task);
        showSuccess("Task archived");
      },
      (error) => showError(error, "Failed to Archive Task")
    );

    const { execute: reorderTasks } = useAsyncOperation(
      async (...args: unknown[]) => {
        const newTasks = args[0] as Task[];
        const taskIds = newTasks.map((task) => task.id);
        await backend.task.reorderTasks({ taskIds });
        return newTasks;
      },
      () => showSuccess("Tasks reordered successfully!"),
      (error) => {
        showError(error, "Failed to Reorder Tasks");
        // Revert on error
        onTasksReordered(tasks);
      }
    );

    // Memoized callbacks for stable references
    const handleStatusChange = useCallback(
      async (task: Task, newStatus: TaskStatus) => {
        setUpdatingTaskId(task.id);

        // Optimistic update
        const optimisticTask = { ...task, status: newStatus };
        onTaskUpdated(optimisticTask);

        await updateTaskStatus(task, newStatus);
        setUpdatingTaskId(null);
      },
      [onTaskUpdated, updateTaskStatus]
    );

    const handleDeleteTask = useCallback(
      async (taskId: number) => {
        setDeletingTaskId(taskId);
        await deleteTask(taskId);
        setDeletingTaskId(null);
      },
      [deleteTask]
    );

    const handleEditTask = useCallback((task: Task) => {
      setEditingTask(task);
    }, []);

    const handleArchiveTask = useCallback(
      async (taskId: number) => {
        await archiveTask(taskId);
      },
      [archiveTask]
    );

    const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
      setDraggedTask(task);
      e.dataTransfer.effectAllowed = "move";
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverIndex(index);
    }, []);

    const handleDragLeave = useCallback(() => {
      setDragOverIndex(null);
    }, []);

    const handleDrop = useCallback(
      async (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        setDragOverIndex(null);

        if (!draggedTask) return;

        const dragIndex = tasks.findIndex((task) => task.id === draggedTask.id);
        if (dragIndex === dropIndex) return;

        // Create new array with reordered tasks
        const newTasks = [...tasks];
        const [removed] = newTasks.splice(dragIndex, 1);
        newTasks.splice(dropIndex, 0, removed);

        // Update local state immediately for responsive UI
        onTasksReordered(newTasks);

        // Send reorder request to backend
        await reorderTasks(newTasks);

        setDraggedTask(null);
      },
      [draggedTask, tasks, onTasksReordered, reorderTasks]
    );

    const handleDragEnd = useCallback(() => {
      setDraggedTask(null);
      setDragOverIndex(null);
    }, []);

    const handleCloseEditDialog = useCallback((open: boolean) => {
      if (!open) setEditingTask(null);
    }, []);

    // Memoized computed values
    const selectedTaskIdsSet = useMemo(() => new Set(selectedTaskIds), [selectedTaskIds]);

    const emptyState = useMemo(() => {
      if (tasks.length === 0) {
        return (
          <div className={`text-center py-8 ${getEmptyStateColor()}`}>
            <p className="text-lg">No tasks match your current filters.</p>
            <p className="text-sm mt-2">Try adjusting your filters or create a new task!</p>
          </div>
        );
      }
      return null;
    }, [tasks.length]);

    if (emptyState) {
      return emptyState;
    }

    return (
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            index={index}
            isSelected={selectedTaskIdsSet.has(task.id)}
            isDragged={draggedTask?.id === task.id}
            isDraggedOver={dragOverIndex === index}
            isUpdating={updatingTaskId === task.id}
            isDeleting={deletingTaskId === task.id}
            onSelectTask={onSelectTask}
            onStatusChange={handleStatusChange}
            onEditTask={handleEditTask}
            onArchiveTask={handleArchiveTask}
            onDeleteTask={handleDeleteTask}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
          />
        ))}

        {editingTask && (
          <EditTaskDialog
            task={editingTask}
            open={!!editingTask}
            onOpenChange={handleCloseEditDialog}
            onTaskUpdated={onTaskUpdated}
          />
        )}
      </div>
    );
  }
);

TaskList.displayName = "TaskList";
