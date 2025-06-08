import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, CheckSquare, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import backend from "~backend/client";
import type { Task, TaskStatus } from "~backend/task/types";
import { useCollapse } from "../hooks/useCollapse";
import { useToast } from "../hooks/useToast";

interface TodayTasksProps {
  date: string;
}

export function TodayTasks({ date }: TodayTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [includeOverdue, setIncludeOverdue] = useState(false);
  const [sortBy, setSortBy] = useState<"priority" | "created">("priority");
  const { showError, showSuccess } = useToast();
  const { collapsed, toggle } = useCollapse("today_tasks");

  const loadTasks = async () => {
    try {
      const res = await backend.task.listDueTasks({
        date,
        includeOverdue: includeOverdue ? "true" : undefined,
      });
      let list = res.tasks;
      list = list.sort((a, b) => {
        if (sortBy === "priority") return b.priority - a.priority;
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
      setTasks(list);
    } catch (err) {
      console.error("Failed to load tasks", err);
      showError("Failed to load tasks");
    }
  };

  useEffect(() => {
    loadTasks();
  }, [includeOverdue, sortBy]);

  const toggleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id),
    );
  };

  const handleStatusChange = async (id: number, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      await backend.task.updateTask({ id, status });
    } catch (err) {
      showError("Failed to update task");
      loadTasks();
    }
  };

  const bulkComplete = async () => {
    for (const id of selectedIds) {
      await backend.task.updateTask({ id, status: "done" });
    }
    showSuccess("Tasks completed");
    setSelectedIds([]);
    loadTasks();
  };

  const bulkReschedule = async () => {
    const dateStr = window.prompt("New due date (YYYY-MM-DD)");
    if (!dateStr) return;
    const due = new Date(dateStr);
    if (isNaN(due.getTime())) return;
    for (const id of selectedIds) {
      await backend.task.updateTask({ id, dueDate: due });
    }
    showSuccess("Tasks rescheduled");
    setSelectedIds([]);
    loadTasks();
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Tasks Due Today
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIncludeOverdue(!includeOverdue)}
          >
            {includeOverdue ? "Hide Overdue" : "Show Overdue"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setSortBy(sortBy === "priority" ? "created" : "priority")
            }
          >
            Sort: {sortBy === "priority" ? "Urgency" : "Created"}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggle}>
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent>
          {selectedIds.length > 0 && (
            <div className="mb-2 flex gap-2 items-center">
              <span className="text-sm text-gray-600">
                {selectedIds.length} selected
              </span>
              <Button size="sm" onClick={bulkComplete}>
                <CheckSquare className="h-4 w-4 mr-1" />
                Complete
              </Button>
              <Button size="sm" onClick={bulkReschedule}>
                <Clock className="h-4 w-4 mr-1" />
                Reschedule
              </Button>
            </div>
          )}
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tasks due</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 border rounded-lg flex items-start gap-2"
                >
                  <Checkbox
                    checked={selectedIds.includes(task.id)}
                    onCheckedChange={(c) => toggleSelect(task.id, !!c)}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <Select
                        value={task.status}
                        onValueChange={(v) =>
                          handleStatusChange(task.id, v as TaskStatus)
                        }
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
