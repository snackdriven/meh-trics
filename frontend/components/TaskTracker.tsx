import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter } from "lucide-react";
import { TaskList } from "./TaskList";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { TaskFilters } from "./TaskFilters";
import backend from "~backend/client";
import type { Task, TaskStatus, EnergyLevel } from "~backend/task/types";

export function TaskTracker() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "" as TaskStatus | "",
    energyLevel: "" as EnergyLevel | "",
    tags: [] as string[],
  });

  const loadTasks = async () => {
    try {
      const response = await backend.task.listTasks();
      setTasks(response.tasks);
      setFilteredTasks(response.tasks);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    let filtered = [...tasks];

    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.energyLevel) {
      filtered = filtered.filter(task => task.energyLevel === filters.energyLevel);
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter(task => 
        filters.tags.some(tag => task.tags.includes(tag))
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, filters]);

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    setIsCreateDialogOpen(false);
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

  const getStatusCounts = () => {
    const counts = {
      todo: tasks.filter(t => t.status === "todo").length,
      in_progress: tasks.filter(t => t.status === "in_progress").length,
      done: tasks.filter(t => t.status === "done").length,
    };
    return counts;
  };

  if (isLoading) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center text-gray-500">Loading your tasks...</div>
        </CardContent>
      </Card>
    );
  }

  const statusCounts = getStatusCounts();

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
              <TaskFilters filters={filters} onFiltersChange={setFilters} />
            </div>
          )}
          <TaskList
            tasks={filteredTasks}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
            onTasksReordered={handleTasksReordered}
          />
        </CardContent>
      </Card>

      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
