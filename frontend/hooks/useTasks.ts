import { useEffect, useState } from "react";
import backend from "~backend/client";
import type { EnergyLevel, Task, TaskStatus } from "~backend/task/types";
import { useAsyncOperation } from "./useAsyncOperation";
import { useConfetti } from "./useConfetti";
import { useToast } from "./useToast";

interface Filters {
  status: TaskStatus | "";
  energyLevel: EnergyLevel | "";
  tags: string[];
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [filters, setFilters] = useState<Filters>({
    status: "",
    energyLevel: "",
    tags: [],
  });

  const { showError, showSuccess } = useToast();
  const showConfetti = useConfetti();

  const {
    loading,
    error,
    execute: loadTasks,
  } = useAsyncOperation(
    async () => {
      const response = await backend.task.listTasks({});
      setTasks(response.tasks);
      setFilteredTasks(response.tasks);
      return response.tasks;
    },
    undefined,
    () => showError("Failed to load tasks", "Loading Error"),
  );

  const {
    loading: loadingArchived,
    error: archivedError,
    execute: loadArchivedTasks,
  } = useAsyncOperation(
    async () => {
      const response = await backend.task.listTasks({ archived: "true" });
      setArchivedTasks(response.tasks);
      return response.tasks;
    },
    undefined,
    () => showError("Failed to load task history", "Loading Error"),
  );

  useEffect(() => {
    loadTasks();
    loadArchivedTasks();
  }, []);

  useEffect(() => {
    let filtered = [...tasks];
    if (filters.status) {
      filtered = filtered.filter((t) => t.status === filters.status);
    }
    if (filters.energyLevel) {
      filtered = filtered.filter((t) => t.energyLevel === filters.energyLevel);
    }
    if (filters.tags.length > 0) {
      filtered = filtered.filter((t) =>
        filters.tags.some((tag) => t.tags.includes(tag)),
      );
    }
    setFilteredTasks(filtered);
  }, [tasks, filters]);

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
    );
  };

  const handleTaskDeleted = (taskId: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const handleTasksReordered = (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
  };

  const handleSelectTask = (taskId: number, selected: boolean) => {
    setSelectedTaskIds((prev) =>
      selected ? [...prev, taskId] : prev.filter((id) => id !== taskId),
    );
  };

  const clearSelection = () => setSelectedTaskIds([]);

  const handleBulkComplete = async () => {
    for (const id of selectedTaskIds) {
      const task = tasks.find((t) => t.id === id);
      if (task && task.status !== "done") {
        const updated = await backend.task.updateTask({ id, status: "done" });
        handleTaskUpdated(updated);
      }
    }
    showSuccess("Tasks marked complete");
    showConfetti();
    clearSelection();
  };

  const handleBulkDelete = async () => {
    for (const id of selectedTaskIds) {
      await backend.task.deleteTask({ id });
      handleTaskDeleted(id);
    }
    showSuccess("Tasks deleted");
    clearSelection();
  };

  const handleBulkTag = async () => {
    const input = window.prompt("Enter tags separated by commas");
    if (!input) return;
    const tags = input
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    for (const id of selectedTaskIds) {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        const newTags = Array.from(new Set([...task.tags, ...tags]));
        const updated = await backend.task.updateTask({ id, tags: newTags });
        handleTaskUpdated(updated);
      }
    }
    showSuccess("Tags added");
    clearSelection();
  };

  const handleBulkReschedule = async () => {
    const dateStr = window.prompt("Enter new due date (YYYY-MM-DD)");
    if (!dateStr) return;
    const dueDate = new Date(dateStr);
    if (isNaN(dueDate.getTime())) return;
    for (const id of selectedTaskIds) {
      const updated = await backend.task.updateTask({ id, dueDate });
      handleTaskUpdated(updated);
    }
    showSuccess("Tasks rescheduled");
    clearSelection();
  };

  const getStatusCounts = () => {
    return {
      todo: tasks.filter((t) => t.status === "todo").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      done: tasks.filter((t) => t.status === "done").length,
      archived: tasks.filter((t) => t.status === "archived").length,
    };
  };

  return {
    tasks,
    archivedTasks,
    filteredTasks,
    filters,
    setFilters,
    selectedTaskIds,
    handleSelectTask,
    clearSelection,
    handleTaskCreated,
    handleTaskUpdated,
    handleTaskDeleted,
    handleTasksReordered,
    handleBulkComplete,
    handleBulkDelete,
    handleBulkTag,
    handleBulkReschedule,
    statusCounts: getStatusCounts(),
    loading,
    loadingArchived,
    error,
    archivedError,
    loadTasks,
    loadArchivedTasks,
  };
}
