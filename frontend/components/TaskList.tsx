import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Calendar, Zap, Clock, GripVertical } from "lucide-react";
import { EditTaskDialog } from "./EditTaskDialog";
import { LoadingSpinner } from "./LoadingSpinner";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
import backend from "~backend/client";
import type { Task, TaskStatus } from "~backend/task/types";

interface TaskListProps {
  tasks: Task[];
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: number) => void;
  onTasksReordered: (tasks: Task[]) => void;
}

export function TaskList({ tasks, onTaskUpdated, onTaskDeleted, onTasksReordered }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  const { showSuccess, showError } = useToast();

  const {
    execute: updateTaskStatus,
  } = useAsyncOperation(
    async (task: Task, newStatus: TaskStatus) => {
      setUpdatingTaskId(task.id);
      const updatedTask = await backend.task.updateTask({
        id: task.id,
        status: newStatus,
      });
      onTaskUpdated(updatedTask);
      return updatedTask;
    },
    (updatedTask) => showSuccess(`Task "${updatedTask.title}" updated successfully!`),
    (error) => showError(error, "Failed to Update Task")
  );

  const {
    execute: deleteTask,
  } = useAsyncOperation(
    async (taskId: number) => {
      setDeletingTaskId(taskId);
      await backend.task.deleteTask({ id: taskId });
      onTaskDeleted(taskId);
      return taskId;
    },
    () => showSuccess("Task deleted successfully!"),
    (error) => showError(error, "Failed to Delete Task")
  );

  const {
    execute: reorderTasks,
  } = useAsyncOperation(
    async (newTasks: Task[]) => {
      const taskIds = newTasks.map(task => task.id);
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

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    await updateTaskStatus(task, newStatus);
    setUpdatingTaskId(null);
  };

  const handleDeleteTask = async (taskId: number) => {
    await deleteTask(taskId);
    setDeletingTaskId(null);
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (!draggedTask) return;

    const dragIndex = tasks.findIndex(task => task.id === draggedTask.id);
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
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverIndex(null);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5: return "bg-red-100 text-red-800 border-red-200";
      case 4: return "bg-orange-100 text-orange-800 border-orange-200";
      case 3: return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 2: return "bg-blue-100 text-blue-800 border-blue-200";
      case 1: return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 5: return "Urgent";
      case 4: return "High";
      case 3: return "Medium";
      case 2: return "Low";
      case 1: return "Lowest";
      default: return "Unknown";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "todo": return "bg-blue-50 text-blue-700 border-blue-200";
      case "in_progress": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "done": return "bg-green-50 text-green-700 border-green-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case "todo": return "To Do";
      case "in_progress": return "In Progress";
      case "done": return "Done";
      default: return status;
    }
  };

  const getEnergyColor = (energy?: string) => {
    switch (energy) {
      case "high": return "bg-red-50 text-red-700 border-red-200";
      case "medium": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-50 text-green-700 border-green-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg">No tasks match your current filters.</p>
        <p className="text-sm mt-2">Try adjusting your filters or create a new task!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <Card 
          key={task.id} 
          className={`p-4 bg-white/50 border-purple-100 transition-all duration-200 ${
            draggedTask?.id === task.id ? 'opacity-50 scale-95' : ''
          } ${
            dragOverIndex === index ? 'border-purple-400 shadow-lg' : ''
          }`}
          draggable
          onDragStart={(e) => handleDragStart(e, task)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
        >
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-6 h-6 mt-1 cursor-grab active:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1">
                  <h3 className={`font-medium text-lg ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className={`text-sm mt-1 ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                      {task.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
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
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={deletingTaskId === task.id}
                  >
                    {deletingTaskId === task.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="relative">
                  <Select 
                    value={task.status} 
                    onValueChange={(value) => handleStatusChange(task, value as TaskStatus)}
                    disabled={updatingTaskId === task.id}
                  >
                    <SelectTrigger className={`w-32 h-8 ${getStatusColor(task.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  {updatingTaskId === task.id && (
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
                  <Badge className="bg-red-50 text-red-700 border-red-200">
                    <Clock className="h-3 w-3 mr-1" />
                    Hard Deadline
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="h-3 w-3" />
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}

      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          onTaskUpdated={onTaskUpdated}
        />
      )}
    </div>
  );
}
