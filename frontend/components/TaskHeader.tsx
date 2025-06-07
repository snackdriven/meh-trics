import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Filter } from 'lucide-react';
import { EditableCopy } from './EditableCopy';

interface TaskHeaderProps {
  statusCounts: { todo: number; in_progress: number; done: number };
  onToggleFilters: () => void;
  onAddTask: () => void;
}

export function TaskHeader({
  statusCounts,
  onToggleFilters,
  onAddTask,
}: TaskHeaderProps) {
  return (
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
        <EditableCopy
          defaultText="💡 Drag tasks to reorder them"
          as="p"
          className="text-sm text-gray-600 mt-1"
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onToggleFilters}
          className="bg-white/50"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <Button
          onClick={onAddTask}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
    </CardHeader>
  );
}
