/**
 * Modern Task CRUD Dialogs
 *
 * This component replaces the old CreateTaskDialog and EditTaskDialog components
 * using the new Universal CRUD Dialog framework. It maintains the same API
 * for compatibility while providing a unified implementation.
 */

import { useState } from "react";
import backend from "~backend/client";
import { useOfflineTasks } from "../hooks/useOfflineTasks";
import { useToast } from "../hooks/useToast";
import { UniversalCRUDDialog } from "./crud";
import { createTaskDialogConfig, editTaskDialogConfig } from "./crud/taskDialogConfig";
import type { CRUDDialogConfig } from "./crud/types";

// Simplified Task interface (can be replaced with proper import when types are fixed)
interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: number;
  dueDate?: Date;
  tags: string[];
  energyLevel?: string;
  isHardDeadline: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// CREATE TASK DIALOG
// ============================================================================

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: (task: Task) => void;
}

export function CreateTaskDialog({ open, onOpenChange, onTaskCreated }: CreateTaskDialogProps) {
  const { showSuccess, showError } = useToast();
  const { createTask } = useOfflineTasks();
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Create the task
      const task = await backend.task.createTask({
        title: data.title,
        description: data.description || undefined,
        priority: data.priority,
        energyLevel: data.energy || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        tags: data.tags || [],
      });

      // Add to offline store
      await createTask(task);

      // Notify parent
      onTaskCreated(task);

      // Show success message
      showSuccess("Task created successfully");

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create task:", error);
      showError("Failed to create task");
      throw error; // Re-throw to keep dialog open
    } finally {
      setIsLoading(false);
    }
  };

  const config: CRUDDialogConfig = {
    ...createTaskDialogConfig,
    onSubmit: handleSubmit,
  };

  return (
    <UniversalCRUDDialog
      config={config}
      open={open}
      onOpenChange={onOpenChange}
      loading={isLoading}
    />
  );
}

// ============================================================================
// EDIT TASK DIALOG
// ============================================================================

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onTaskUpdated: (task: Task) => void;
}

export function EditTaskDialog({ open, onOpenChange, task, onTaskUpdated }: EditTaskDialogProps) {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Update the task
      const updatedTask = await backend.task.updateTask({
        id: task.id,
        title: data.title,
        description: data.description || undefined,
        priority: data.priority,
        energyLevel: data.energy || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: data.completed ? "done" : task.status,
        tags: data.tags || [],
        isHardDeadline: task.isHardDeadline,
        sortOrder: task.sortOrder,
      });

      // Notify parent
      onTaskUpdated(updatedTask);

      // Show success message
      showSuccess("Task updated successfully");

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update task:", error);
      showError("Failed to update task");
      throw error; // Re-throw to keep dialog open
    } finally {
      setIsLoading(false);
    }
  };
  // Prepare initial data for the form
  const initialData = {
    id: task.id,
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    energy: task.energyLevel || "medium",
    dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : "",
    completed: task.status === "done",
    tags: task.tags || [],
  };

  const config: CRUDDialogConfig = {
    ...editTaskDialogConfig,
    onSubmit: handleSubmit,
  };

  return (
    <UniversalCRUDDialog
      config={config}
      open={open}
      onOpenChange={onOpenChange}
      initialData={initialData}
      loading={isLoading}
    />
  );
}

// ============================================================================
// CONVENIENCE HOOKS (for easier migration)
// ============================================================================

/**
 * Hook for managing task creation dialog state
 * Drop-in replacement for manual state management
 */
export function useCreateTaskDialog(onTaskCreated: (task: Task) => void) {
  const [open, setOpen] = useState(false);

  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);

  return {
    open,
    openDialog,
    closeDialog,
    CreateTaskDialog: (
      props: Omit<CreateTaskDialogProps, "open" | "onOpenChange" | "onTaskCreated">
    ) => (
      <CreateTaskDialog
        {...props}
        open={open}
        onOpenChange={setOpen}
        onTaskCreated={(task) => {
          onTaskCreated(task);
          closeDialog();
        }}
      />
    ),
  };
}

/**
 * Hook for managing task editing dialog state
 * Drop-in replacement for manual state management
 */
export function useEditTaskDialog(onTaskUpdated: (task: Task) => void) {
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState<Task | null>(null);

  const openDialog = (taskToEdit: Task) => {
    setTask(taskToEdit);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setTask(null);
  };

  return {
    open,
    openDialog,
    closeDialog,
    EditTaskDialog: task ? (
      <EditTaskDialog
        open={open}
        onOpenChange={setOpen}
        task={task}
        onTaskUpdated={(updatedTask) => {
          onTaskUpdated(updatedTask);
          closeDialog();
        }}
      />
    ) : null,
  };
}
