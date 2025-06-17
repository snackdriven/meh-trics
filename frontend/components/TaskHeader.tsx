import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Plus } from "lucide-react";
import { getStatusColor } from "@/lib/colors";
import { EditableCopy } from "./EditableCopy";

interface TaskHeaderProps {
  statusCounts: {
    todo: number;
    in_progress: number;
    done: number;
    archived: number;
  };
  onToggleFilters: () => void;
  onAddTask: () => void;
}

export function TaskHeader({ statusCounts, onToggleFilters, onAddTask }: TaskHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle className="text-2xl">Task Tracker 📋</CardTitle>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className={getStatusColor("todo")}>
            {statusCounts.todo} To Do
          </Badge>
          <Badge variant="outline" className={getStatusColor("in_progress")}>
            {statusCounts.in_progress} In Progress
          </Badge>
          <Badge variant="outline" className={getStatusColor("done")}>
            {statusCounts.done} Done
          </Badge>
          <Badge variant="outline" className={getStatusColor("archived")}>
            {statusCounts.archived} Archived
          </Badge>
        </div>
        <EditableCopy
          defaultText="💡 Drag tasks to reorder them"
          as="p"
          className="text-sm text-gray-600 mt-1"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onToggleFilters}>
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <Button onClick={onAddTask}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
    </CardHeader>
  );
}
