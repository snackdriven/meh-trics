import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight, Minus, Plus, Target } from "lucide-react";
import { useEffect, useState } from "react";
import backend from "~backend/client";
import type {
  Habit,
  HabitEntry,
  JournalEntry,
  MoodEntry,
  Task,
  TaskStatus,
} from "~backend/task/types";
import { useAutoTags } from "../hooks/useAutoTags";
import { useCollapse } from "../hooks/useCollapse";
import { useToast } from "../hooks/useToast";
import { JournalEntryForm } from "./JournalEntryForm";
import { MoodSnapshot } from "./MoodSnapshot";
import { TodayTasks } from "./TodayTasks";

export function TodayView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [moodEntry, setMoodEntry] = useState<MoodEntry | null>(null);
  const [journalEntry, setJournalEntry] = useState<JournalEntry | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<Record<number, HabitEntry>>(
    {},
  );
  const [habitCounts, setHabitCounts] = useState<Record<number, number>>({});
  const [habitNotes, setHabitNotes] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const habitsCollapse = useCollapse("today_habits");
  const { tags: autoTags, refresh: refreshAutoTags } = useAutoTags();

  const { showSuccess, showError } = useToast();
  const date = new Date();
  const dateStr = date.toISOString().split("T")[0];

  const loadData = async () => {
    try {
      const [moodRes, habitEntriesRes, habitsRes] = await Promise.all([
        backend.task.listMoodEntries({ startDate: dateStr, endDate: dateStr }),
        backend.task.listHabitEntries({ startDate: dateStr, endDate: dateStr }),
        backend.task.listHabits(),
      ]);

      const dayMood =
        moodRes.entries.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0] || null;
      setMoodEntry(dayMood);

      try {
        const journal = await backend.task.getJournalEntry({ date: dateStr });
        setJournalEntry(journal);
      } catch {
        setJournalEntry(null);
      }

      setHabits(habitsRes.habits);
      const habitMap: Record<number, HabitEntry> = {};
      const countsMap: Record<number, number> = {};
      const notesMap: Record<number, string> = {};

      habitEntriesRes.entries.forEach((entry) => {
        habitMap[entry.habitId] = entry;
        countsMap[entry.habitId] = entry.count;
        notesMap[entry.habitId] = entry.notes || "";
      });

      habitsRes.habits.forEach((habit) => {
        if (!(habit.id in countsMap)) {
          countsMap[habit.id] = 0;
          notesMap[habit.id] = "";
        }
      });

      setHabitEntries(habitMap);
      setHabitCounts(countsMap);
      setHabitNotes(notesMap);
    } catch (error) {
      console.error("Failed to load today data:", error);
      showError("Failed to load today data", "Loading Error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateHabitEntry = async (
    habitId: number,
    count: number,
    notes: string,
  ) => {
    try {
      await backend.task.createHabitEntry({
        habitId,
        date,
        count,
        notes: notes.trim() || undefined,
      });
      showSuccess("Habit updated");
      refreshAutoTags();
    } catch (error) {
      console.error("Failed to update habit entry:", error);
      showError("Failed to update habit", "Update Error");
      loadData();
    }
  };

  const handleHabitCountChange = (habitId: number, newCount: number) => {
    const count = Math.max(0, newCount);
    setHabitCounts((prev) => ({ ...prev, [habitId]: count }));
    const notes = habitNotes[habitId] || "";
    updateHabitEntry(habitId, count, notes);
  };

  const handleTaskStatusChange = async (
    taskId: number,
    newStatus: TaskStatus,
  ) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task,
      ),
    );
    try {
      await backend.task.updateTask({ id: taskId, status: newStatus });
      showSuccess("Task updated");
    } catch (error) {
      console.error("Failed to update task:", error);
      showError("Failed to update task", "Update Error");
      loadData();
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <MoodSnapshot onEntryChange={setMoodEntry} />
      <JournalEntryForm
        date={date}
        moodId={moodEntry?.id}
        autoTags={autoTags}
        onEntryCreated={setJournalEntry}
      />

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" /> Habits
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={habitsCollapse.toggle}>
            {habitsCollapse.collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>
        {!habitsCollapse.collapsed && (
          <CardContent className="space-y-4">
            {habits.map((habit) => {
              const count = habitCounts[habit.id] || 0;
              const notes = habitNotes[habit.id] || "";
              const isCompleted = count >= habit.targetCount;
              return (
                <div key={habit.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{habit.name}</h4>
                    <Badge variant={isCompleted ? "default" : "outline"}>
                      {habit.frequency}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleHabitCountChange(habit.id, count - 1)
                      }
                      disabled={count <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      value={count}
                      onChange={(e) =>
                        handleHabitCountChange(
                          habit.id,
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-20 text-center"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleHabitCountChange(habit.id, count + 1)
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      / {habit.targetCount}
                      {isCompleted && "✓"}
                    </span>
                  </div>
                  <Textarea
                    value={notes}
                    onChange={(e) =>
                      setHabitNotes((prev) => ({
                        ...prev,
                        [habit.id]: e.target.value,
                      }))
                    }
                    onBlur={() => updateHabitEntry(habit.id, count, notes)}
                    rows={2}
                  />
                </div>
              );
            })}
          </CardContent>
        )}
      </Card>

      <TodayTasks date={dateStr} />
    </div>
  );
}
