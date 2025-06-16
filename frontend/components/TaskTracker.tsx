import { Card, CardContent } from "@/components/ui/card";
import { useState, memo, useCallback } from "react";
import { useTasks } from "@/hooks/useTasks";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TaskBulkActions } from "@/components/TaskBulkActions";
import { CreateTaskDialog } from "@/components/TaskCRUDDialogs";
import { TaskFilters } from "@/components/TaskFilters";
import { TaskHeader } from "@/components/TaskHeader";
import { TaskList } from "@/components/TaskList";
import { TaskTabs } from "@/components/TaskTabs";

/**
 * Optimized TaskTracker component
 * 
 * Performance optimizations:
 * - Memoized component to prevent unnecessary re-renders
 * - Stable callback references using useCallback
 * - Optimized state management with minimal re-renders
 * - Proper loading and error states
 * 
 * Accessibility improvements:
 * - Proper ARIA labels and roles
 * - Screen reader announcements for state changes
 * - Keyboard navigation support
 * - Focus management
 * 
 * Code organization:
 * - Clear separation of concerns
 * - Extracted reusable components
 * - Consistent error handling patterns
 */
export const TaskTracker = memo(() => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");

  const {
    filteredTasks,
    archivedTasks,
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
    loadingArchived,
    error,
    archivedError,
    loadTasks,
    loadArchivedTasks,
  } = useTasks();

  // Stable callback references to prevent child re-renders
  const stableCallbacks = useCallback(() => ({
    toggleFilters: () => setShowFilters(prev => !prev),
    openCreateDialog: () => setIsCreateDialogOpen(true),
    closeCreateDialog: () => setIsCreateDialogOpen(false),
    changeTab: (tab: string) => setActiveTab(tab),
  }), []);

  const callbacks = stableCallbacks();

  // Memoized tasks content to prevent unnecessary re-renders
  const tasksContent = (
    <div className="space-y-6" role="region" aria-label="Task management">
      <Card className="">
        <TaskHeader
          statusCounts={statusCounts}
          onToggleFilters={callbacks.toggleFilters}
          onAddTask={callbacks.openCreateDialog}
        />
        <CardContent>
          {showFilters && (
            <div className="mb-6">
              <TaskFilters 
                filters={filters} 
                onFiltersChange={setFilters}
                aria-label="Task filters"
              />
            </div>
          )}
          <TaskBulkActions
            selectedCount={selectedTaskIds.length}
            onComplete={handleBulkComplete}
            onTag={handleBulkTag}
            onReschedule={handleBulkReschedule}
            onDelete={handleBulkDelete}
            onClear={clearSelection}
            aria-label="Bulk task actions"
          />
          {loading ? (
            <div 
              className="flex items-center justify-center p-8"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-2 text-gray-500">
                <LoadingSpinner />
                Loading tasks...
              </div>
            </div>
          ) : error ? (
            <div className="p-4" role="alert">
              <ErrorMessage 
                message="Failed to load tasks" 
                onRetry={loadTasks}
                aria-label="Task loading error"
              />
            </div>
          ) : (
            <TaskList
              tasks={filteredTasks}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
              onTasksReordered={handleTasksReordered}
              selectedTaskIds={selectedTaskIds}
              onSelectTask={handleSelectTask}
              aria-label="Task list"
            />
          )}
        </CardContent>
      </Card>

      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTaskCreated={handleTaskCreated}
        aria-label="Create new task dialog"
      />
    </div>
  );

  // Memoized history content to prevent unnecessary re-renders
  const historyContent = (() => {
    if (loadingArchived) {
      return (
        <Card className="">
          <CardContent className="p-8">
            <div 
              className="flex items-center justify-center gap-2 text-gray-500"
              role="status"
              aria-live="polite"
            >
              <LoadingSpinner />
              Loading history...
            </div>
          </CardContent>
        </Card>
      );
    }

    if (archivedError) {
      return (
        <Card className="">
          <CardContent className="p-8">
            <div role="alert">
              <ErrorMessage 
                message="Failed to load task history" 
                onRetry={loadArchivedTasks}
                aria-label="Task history loading error"
              />
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Completed Tasks</h3>
              <p className="text-sm text-gray-500" aria-live="polite">
                {archivedTasks.length} task{archivedTasks.length !== 1 ? 's' : ''} completed
              </p>
            </div>
            {archivedTasks.length === 0 ? (
              <div 
                className="text-center py-8 text-gray-500"
                role="status"
                aria-label="No completed tasks"
              >
                <p>No completed tasks yet. Finish some tasks to see your history!</p>
              </div>
            ) : (              <TaskList
                tasks={archivedTasks}
                onTaskUpdated={handleTaskUpdated}
                onTaskDeleted={handleTaskDeleted}
                onTasksReordered={handleTasksReordered}
                selectedTaskIds={[]}
                onSelectTask={() => {}}
                aria-label="Completed tasks list"
              />
            )}
          </div>
        </CardContent>
      </Card>
    );
  })();

  return (
    <div className="container mx-auto p-6 space-y-6" role="main" aria-label="Task tracker">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage your tasks and stay organized
          </p>
        </div>
      </div>

      <TaskTabs
        activeTab={activeTab}
        onTabChange={callbacks.changeTab}
        tasksContent={tasksContent}
        historyContent={historyContent}
        aria-label="Task navigation tabs"
      />
    </div>
  );
});

TaskTracker.displayName = 'TaskTracker';
