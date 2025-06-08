import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { ErrorMessage } from "./ErrorMessage";
import { LoadingSpinner } from "./LoadingSpinner";
import { TaskBulkActions } from "./TaskBulkActions";
import { TaskFilters } from "./TaskFilters";
import { TaskHeader } from "./TaskHeader";
import { TaskList } from "./TaskList";
import { TaskTabs } from "./TaskTabs";

export function TaskTracker() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");

  const {
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
    statusCounts,
    loading,
    error,
    loadTasks,
  } = useTasks();

  const tasksContent = (
    <div className="space-y-6">
      <Card className="">
        <TaskHeader
          statusCounts={statusCounts}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onAddTask={() => setIsCreateDialogOpen(true)}
        />
        <CardContent>
          {showFilters && (
            <div className="mb-6">
              <TaskFilters filters={filters} onFiltersChange={setFilters} />
            </div>
          )}
          <TaskBulkActions
            selectedCount={selectedTaskIds.length}
            onComplete={handleBulkComplete}
            onTag={handleBulkTag}
            onReschedule={handleBulkReschedule}
            onDelete={handleBulkDelete}
            onClear={clearSelection}
          />
          <TaskList
            tasks={filteredTasks}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
            onTasksReordered={handleTasksReordered}
            selectedTaskIds={selectedTaskIds}
            onSelectTask={handleSelectTask}
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

  const content = (() => {
    if (loading) {
      return (
        <Card className="">
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
        <Card className="">
          <CardContent className="p-8">
            <ErrorMessage message={error} onRetry={loadTasks} />
          </CardContent>
        </Card>
      );
    }

    return tasksContent;
  })();

  return (
    <div className="space-y-6">
      <TaskTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tasksContent={content}
      />
    </div>
  );
}
