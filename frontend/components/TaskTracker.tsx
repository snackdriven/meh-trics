import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecurringTasksView } from "./RecurringTasksView";
import { TaskList } from "./TaskList";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { TaskFilters } from "./TaskFilters";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
import backend from "~backend/client";
import type { Task, TaskStatus, EnergyLevel } from "~backend/task/types";

export function TaskTracker() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");
  const [filters, setFilters] = useState({
    status: "" as TaskStatus | "",
    energyLevel: "" as EnergyLevel | "",
    tags: [] as string[],
  });
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const { showError, showSuccess } = useToast();

  const {
    loading,
    error,
    execute: loadTasks,
  } = useAsyncOperation(
      async (newPage = page, currentFilters = filters) => {
        const response = await backend.task.listTasks({
          page: newPage,
          pageSize,
          status: currentFilters.status || undefined,
          energyLevel: currentFilters.energyLevel || undefined,
          tags: currentFilters.tags[0],
        });
        setPage(newPage);
        setTotal(response.total);
        setTasks(response.tasks);
        return response.tasks;
      },
    undefined,
    (error) => showError("Failed to load tasks", "Loading Error")
  );

  useEffect(() => {
    loadTasks(page);
  }, [page]);


  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const handleTaskDeleted = (taskId: number) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleTasksReordered = (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
  };

  const handleSelectTask = (taskId: number, selected: boolean) => {
    setSelectedTaskIds(prev =>
      selected ? [...prev, taskId] : prev.filter(id => id !== taskId)
    );
  };

  const clearSelection = () => setSelectedTaskIds([]);

  const handleBulkComplete = async () => {
    for (const id of selectedTaskIds) {
      const task = tasks.find(t => t.id === id);
      if (task && task.status !== "done") {
        const updated = await backend.task.updateTask({ id, status: "done" });
        handleTaskUpdated(updated);
      }
    }
    showSuccess("Tasks marked complete");
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
    const tags = input.split(",").map(t => t.trim()).filter(Boolean);
    for (const id of selectedTaskIds) {
      const task = tasks.find(t => t.id === id);
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
    const counts = {
      todo: tasks.filter(t => t.status === "todo").length,
      in_progress: tasks.filter(t => t.status === "in_progress").length,
      done: tasks.filter(t => t.status === "done").length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  const renderTasks = () => {
    if (loading) {
      return (
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <LoadingSpinner />
              Loading your tasks...
            </div>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardContent className="p-8">
            <ErrorMessage
              message={error}
              onRetry={() => loadTasks(page)}
            />
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Task Tracker 📋</CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="bg-blue-50">
                {statusCounts.todo} To Do
              </Badge>
              <Badge variant="outline" className="bg-yellow-50">
                {statusCounts.in_progress} In Progress
              </Badge>
              <Badge variant="outline" className="bg-green-50">
                {statusCounts.done} Done
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              💡 Drag tasks to reorder them
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showFilters && (
            <div className="mb-6">
              <TaskFilters
                filters={filters}
                onFiltersChange={(f) => {
                  setFilters(f);
                  setPage(1);
                  loadTasks(1, f);
                }}
              />
            </div>
          )}
          {selectedTaskIds.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedTaskIds.length} selected
              </span>
              <Button size="sm" onClick={handleBulkComplete}>Complete</Button>
              <Button size="sm" onClick={handleBulkTag}>Tag</Button>
              <Button size="sm" onClick={handleBulkReschedule}>Reschedule</Button>
              <Button size="sm" variant="destructive" onClick={handleBulkDelete}>Delete</Button>
              <Button size="sm" variant="outline" onClick={clearSelection}>Clear</Button>
            </div>
          )}
          <TaskList
            tasks={tasks}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
            onTasksReordered={handleTasksReordered}
            selectedTaskIds={selectedTaskIds}
            onSelectTask={handleSelectTask}
          />
          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
  };

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="recurring">Recurring</TabsTrigger>
      </TabsList>
      <TabsContent value="tasks">{renderTasks()}</TabsContent>
      <TabsContent value="recurring">
        <RecurringTasksView />
      </TabsContent>
    </Tabs>
  );
}
