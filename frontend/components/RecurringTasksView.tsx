import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Edit,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import backend from "~backend/client";
import type { RecurringTask, Task } from "~backend/task/types";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
import { ConfirmDialog } from "./ConfirmDialog";
import { CreateRecurringTaskDialog } from "./CreateRecurringTaskDialog";
import { EditRecurringTaskDialog } from "./EditRecurringTaskDialog";
import { ErrorMessage } from "./ErrorMessage";
import { LoadingSpinner } from "./LoadingSpinner";

export function RecurringTasksView() {
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<RecurringTask | null>(null);
  const [deletingTask, setDeletingTask] = useState<RecurringTask | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  const { showSuccess, showError } = useToast();

  const {
    loading: loadingRecurring,
    error: recurringError,
    execute: loadRecurringTasks,
  } = useAsyncOperation(
    async () => {
      const response = await backend.task.listRecurringTasks();
      setRecurringTasks(response.recurringTasks);
      return response.recurringTasks;
    },
    undefined,
    (error) => showError("Failed to load recurring tasks", "Loading Error"),
  );

  const {
    loading: loadingGenerated,
    error: generatedError,
    execute: loadGeneratedTasks,
  } = useAsyncOperation(
    async () => {
      const response = await backend.task.listTasks({});
      const tasksWithRecurring = response.tasks.filter(
        (task) => task.recurringTaskId,
      );
      setGeneratedTasks(tasksWithRecurring);
      return tasksWithRecurring;
    },
    undefined,
    (error) => showError("Failed to load generated tasks", "Loading Error"),
  );

  const { loading: generating, execute: generateTasks } = useAsyncOperation(
    async () => {
      const response = await backend.task.generateRecurringTasks();
      await loadGeneratedTasks();
      return response;
    },
    (result) => showSuccess(`Generated ${result.generated} new tasks! 🎯`),
    (error) => showError("Failed to generate tasks", "Generation Error"),
  );

  const { execute: updateRecurringTask } = useAsyncOperation(
    async (task: RecurringTask, updates: Partial<RecurringTask>) => {
      const updatedTask = await backend.task.updateRecurringTask({
        id: task.id,
        ...updates,
      });
      return updatedTask;
    },
    (updatedTask) => {
      setRecurringTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      );
      showSuccess("Recurring task updated successfully!");
    },
    (error) => {
      showError("Failed to update recurring task", "Update Error");
      setUpdatingTaskId(null);
    },
  );

  const { execute: deleteRecurringTask } = useAsyncOperation(
    async (taskId: number) => {
      await backend.task.deleteRecurringTask({ id: taskId });
      return taskId;
    },
    (taskId) => {
      setRecurringTasks((prev) => prev.filter((task) => task.id !== taskId));
      setDeletingTask(null);
      showSuccess("Recurring task deleted successfully!");
    },
    (error) => {
      showError("Failed to delete recurring task", "Delete Error");
      setDeletingTask(null);
    },
  );

  useEffect(() => {
    loadRecurringTasks();
    loadGeneratedTasks();
  }, []);

  const handleTaskCreated = (newTask: RecurringTask) => {
    setRecurringTasks((prev) => [newTask, ...prev]);
    setIsCreateDialogOpen(false);
    showSuccess("Recurring task created successfully! 🔄");
  };

  const handleTaskUpdated = (updatedTask: RecurringTask) => {
    setRecurringTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
    );
    setEditingTask(null);
  };

  const handleToggleActive = async (task: RecurringTask) => {
    setUpdatingTaskId(task.id);
    await updateRecurringTask(task, { isActive: !task.isActive });
    setUpdatingTaskId(null);
  };

  const handleDeleteTask = async () => {
    if (deletingTask) {
      await deleteRecurringTask(deletingTask.id);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5:
        return "bg-red-100 text-red-800 border-red-200";
      case 4:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case 3:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 2:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 1:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityLabel = (priority: number) => {
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
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "weekly":
        return "bg-green-100 text-green-800 border-green-200";
      case "monthly":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEnergyColor = (energy?: string) => {
    switch (energy) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getRecurringTaskName = (recurringTaskId: number) => {
    const task = recurringTasks.find((t) => t.id === recurringTaskId);
    return task?.title || "Unknown Template";
  };

  const groupedGeneratedTasks = generatedTasks.reduce(
    (acc, task) => {
      const recurringTaskId = task.recurringTaskId!;
      if (!acc[recurringTaskId]) {
        acc[recurringTaskId] = [];
      }
      acc[recurringTaskId].push(task);
      return acc;
    },
    {} as Record<number, Task[]>,
  );

  if (loadingRecurring || loadingGenerated) {
    return (
      <Card className="">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <LoadingSpinner />
            Loading recurring tasks...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recurringError || generatedError) {
    return (
      <Card className="">
        <CardContent className="p-8">
          <ErrorMessage
            message={recurringError || generatedError || "Unknown error"}
            onRetry={() => {
              loadRecurringTasks();
              loadGeneratedTasks();
            }}
          />
        </CardContent>
      </Card>
    );
  }

  const activeTasks = recurringTasks.filter((task) => task.isActive);
  const pausedTasks = recurringTasks.filter((task) => !task.isActive);

  return (
    <div className="space-y-6">
      <Card className="">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <RefreshCw className="h-6 w-6" />
              Recurring Tasks
            </CardTitle>
            <p className="text-gray-600 mt-1">
              Manage task templates that automatically generate new tasks
            </p>
            <div className="flex gap-2 mt-3">
              <Badge
                variant="outline"
                className="bg-green-50 flex items-center gap-1"
              >
                <Play className="h-3 w-3" />
                {activeTasks.length} Active
              </Badge>
              <Badge
                variant="outline"
                className="bg-gray-50 flex items-center gap-1"
              >
                <Pause className="h-3 w-3" />
                {pausedTasks.length} Paused
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={generateTasks}
              disabled={generating}
              variant="outline"
              className="bg-white/50"
            >
              {generating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Due Tasks
                </>
              )}
            </Button>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="generated">Generated Tasks</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              {recurringTasks.length === 0 ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No recurring tasks yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Create templates that automatically generate tasks on a
                    schedule.
                  </p>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Template
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recurringTasks.map((task) => (
                    <Card
                      key={task.id}
                      className={`p-4 transition-all duration-200 ${
                        task.isActive
                          ? "bg-white/50 border-purple-100"
                          : "bg-gray-50/50 border-gray-200"
                      } ${updatingTaskId === task.id ? "opacity-75" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex-1">
                              <h3
                                className={`font-medium text-lg ${!task.isActive ? "text-gray-500" : "text-gray-900"}`}
                              >
                                {task.title}
                              </h3>
                              {task.description && (
                                <p
                                  className={`text-sm mt-1 ${!task.isActive ? "text-gray-400" : "text-gray-600"}`}
                                >
                                  {task.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                  {task.isActive ? "Active" : "Paused"}
                                </span>
                                <Switch
                                  checked={task.isActive}
                                  onCheckedChange={() =>
                                    handleToggleActive(task)
                                  }
                                  disabled={updatingTaskId === task.id}
                                />
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingTask(task)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingTask(task)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <Badge
                              className={getFrequencyColor(task.frequency)}
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              {task.frequency}
                            </Badge>

                            <Badge className={getPriorityColor(task.priority)}>
                              {getPriorityLabel(task.priority)}
                            </Badge>

                            {task.energyLevel && (
                              <Badge
                                className={getEnergyColor(task.energyLevel)}
                              >
                                <Zap className="h-3 w-3 mr-1" />
                                {task.energyLevel}
                              </Badge>
                            )}

                            {task.maxOccurrencesPerCycle > 1 && (
                              <Badge variant="outline" className="text-xs">
                                {task.maxOccurrencesPerCycle}x /{" "}
                                {task.frequency}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {task.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              Next:{" "}
                              {new Date(task.nextDueDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="generated" className="space-y-4">
              {generatedTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No generated tasks yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Tasks generated from recurring templates will appear here.
                  </p>
                  <Button
                    onClick={generateTasks}
                    disabled={generating}
                    variant="outline"
                  >
                    {generating ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Generate Due Tasks
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedGeneratedTasks).map(
                    ([recurringTaskId, tasks]) => (
                      <Card key={recurringTaskId} className="p-4 bg-white/50">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-lg">
                              {getRecurringTaskName(parseInt(recurringTaskId))}
                            </h3>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {tasks.length} generated
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            {tasks.map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      task.status === "done"
                                        ? "bg-green-500"
                                        : task.status === "in_progress"
                                          ? "bg-yellow-500"
                                          : "bg-blue-500"
                                    }`}
                                  />
                                  <span
                                    className={`font-medium ${task.status === "done" ? "line-through text-gray-500" : ""}`}
                                  >
                                    {task.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  {task.dueDate && (
                                    <>
                                      <Calendar className="h-3 w-3" />
                                      {new Date(
                                        task.dueDate,
                                      ).toLocaleDateString()}
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ),
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CreateRecurringTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTaskCreated={handleTaskCreated}
      />

      {editingTask && (
        <EditRecurringTaskDialog
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          onTaskUpdated={handleTaskUpdated}
        />
      )}

      <ConfirmDialog
        open={!!deletingTask}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        title="Delete Recurring Task"
        description={`Are you sure you want to delete "${deletingTask?.title}"? This will remove the template but won't affect already generated tasks.`}
        confirmText="Delete"
        onConfirm={handleDeleteTask}
        variant="destructive"
      />
    </div>
  );
}
