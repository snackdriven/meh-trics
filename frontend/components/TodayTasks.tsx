import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, CheckSquare, ChevronDown, ChevronRight, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import backend from "~backend/client";
import type { Task, TaskStatus } from "~backend/task/types";
import { useCollapse } from "../hooks/useCollapse";
import { useConfetti } from "../hooks/useConfetti";
import { useOfflineTasks } from "../hooks/useOfflineTasks";
import { useToast } from "../hooks/useToast";
import { getEmptyStateColor } from "../lib/colors";

interface TodayTasksProps {
  date: string;
}

export function TodayTasks({ date }: TodayTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [includeOverdue, setIncludeOverdue] = useState(false);
  const [includeNoDue, setIncludeNoDue] = useState(false);
  const [sortBy, setSortBy] = useState<"priority" | "created">("priority");
  const [quickTitle, setQuickTitle] = useState("");
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [newDueDate, setNewDueDate] = useState("");
  const { showError, showSuccess } = useToast();
  const { collapsed, toggle } = useCollapse("today_tasks");
  const showConfetti = useConfetti();
  const { createTask: createOfflineTask } = useOfflineTasks();

  const loadTasks = async () => {
    try {
      const res = await backend.task.listDueTasks({
        date,
        includeOverdue: includeOverdue ? "true" : undefined,
        includeNoDue: includeNoDue ? "true" : undefined,
      });
      let list = res.tasks;
      list = list.sort((a, b) => {
        if (sortBy === "priority") return b.priority - a.priority;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      setTasks(list);
    } catch (err) {
      showError("Failed to load tasks. Please try again.", "Loading Error");
    }
  };

  useEffect(() => {
    loadTasks();
  }, [includeOverdue, includeNoDue, sortBy]);

  const toggleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)));
  };

  const handleStatusChange = async (id: number, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      await backend.task.updateTask({ id, status });
      if (status === "done") {
        showConfetti();
      }
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
    showConfetti();
    setSelectedIds([]);
    loadTasks();
  };

  const bulkReschedule = () => {
    setRescheduleDialogOpen(true);
  };

  const handleRescheduleConfirm = async () => {
    if (!newDueDate) return;

    const due = new Date(newDueDate);
    if (isNaN(due.getTime())) {
      showError("Please enter a valid date", "Invalid Date");
      return;
    }

    try {
      for (const id of selectedIds) {
        await backend.task.updateTask({ id, dueDate: due });
      }
      showSuccess("Tasks rescheduled successfully!");
      setSelectedIds([]);
      setRescheduleDialogOpen(false);
      setNewDueDate("");
      loadTasks();
    } catch (error) {
      showError("Failed to reschedule tasks. Please try again.", "Reschedule Error");
    }
  };

  const handleQuickAdd = async () => {
    if (!quickTitle.trim()) return;
    try {
      const task = await createOfflineTask({
        title: quickTitle.trim(),
        dueDate: new Date(date),
      });
      if (task) {
        setTasks((prev) => [task, ...prev]);
      }
      setQuickTitle("");
      showSuccess(navigator.onLine ? "Quick task added" : "Task queued for sync");
    } catch (err) {
      showError("Failed to add task");
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Tasks Due Today
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIncludeOverdue(!includeOverdue)}>
            {includeOverdue ? "Hide Overdue" : "Show Overdue"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIncludeNoDue(!includeNoDue)}>
            {includeNoDue ? "Hide No Due" : "Show No Due"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy(sortBy === "priority" ? "created" : "priority")}
          >
            Sort: {sortBy === "priority" ? "Urgency" : "Created"}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggle}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleQuickAdd();
                }
              }}
              placeholder="Quick add task..."
              className="flex-1"
            />
            <Button size="sm" onClick={handleQuickAdd} disabled={!quickTitle.trim()}>
              Add
            </Button>
          </div>
          {selectedIds.length > 0 && (
            <div className="mb-2 flex gap-2 items-center">
              <span className="text-sm text-[var(--color-text-secondary)]">
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
            <p className={`${getEmptyStateColor()} text-center py-4`}>No tasks due</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="p-3 border rounded-lg flex items-start gap-2">
                  <Checkbox
                    checked={selectedIds.includes(task.id)}
                    onCheckedChange={(c) => toggleSelect(task.id, !!c)}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <Select
                        value={task.status}
                        onValueChange={(v) => handleStatusChange(task.id, v as TaskStatus)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {task.description && (
                      <p className="text-sm text-[var(--color-text-secondary)] mb-2">
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

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Selected Tasks</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set a new due date for {selectedIds.length} selected task
              {selectedIds.length !== 1 ? "s" : ""}
            </p>
            <div className="space-y-2">
              <Label htmlFor="newDueDate">New Due Date</Label>
              <Input
                id="newDueDate"
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                placeholder="Select date"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRescheduleConfirm} disabled={!newDueDate}>
              Reschedule Tasks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
