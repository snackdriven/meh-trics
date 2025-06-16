import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Edit3,
  Save,
  X,
  Clock,
  Target,
  CheckCircle,
  BookOpen,
  Heart,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import backend from "~backend/client";
import type {
  Task,
  MoodEntry,
  JournalEntry,
  HabitEntry,
  Habit,
  RoutineEntry,
  RoutineItem,
  CalendarEvent,
} from "~backend/task/types";
import { useToast } from "@/hooks/useToast";
import { useCopyEditing } from "@/hooks/useCopyEditing";

interface DayViewProps {
  date: Date;
  onDateChange: (date: Date) => void;
  onClose?: () => void;
}

interface DayData {
  tasks: Task[];
  moodEntries: MoodEntry[];
  journalEntries: JournalEntry[];
  habitEntries: HabitEntry[];
  habits: Habit[];
  routineEntries: RoutineEntry[];
  routineItems: RoutineItem[];
  calendarEvents: CalendarEvent[];
}

export function DayView({ date, onDateChange, onClose }: DayViewProps) {
  const [data, setData] = useState<DayData>({
    tasks: [],
    moodEntries: [],
    journalEntries: [],
    habitEntries: [],
    habits: [],
    routineEntries: [],
    routineItems: [],
    calendarEvents: [],
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: string; id: string; data: any } | null>(
    null
  );
  const { showSuccess, showError } = useToast();
  const { moodOptions, tierInfo } = useCopyEditing();

  const dateStr = date.toISOString().split("T")[0];

  useEffect(() => {
    loadDayData();
  }, [date]);

  const loadDayData = async () => {
    setLoading(true);
    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const [
        tasksResp,
        moodResp,
        journalResp,
        habitEntriesResp,
        habitsResp,
        routineEntriesResp,
        routineItemsResp,
        eventsResp,
      ] = await Promise.all([
        backend.task.listTasks({}),
        backend.mood.listMoodEntries({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
        backend.task.listJournalEntries({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
        backend.habits.listHabitEntries({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
        backend.habits.listHabits({}),
        backend.task.listRoutineEntries({
          date: dateStr,
        }),
        backend.task.listRoutineItems({}),
        backend.calendar.listCalendarEvents({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      ]);

      // Filter tasks for this specific date
      const dayTasks = tasksResp.tasks.filter(
        (task) => task.dueDate && new Date(task.dueDate).toISOString().split("T")[0] === dateStr
      );

      setData({
        tasks: dayTasks,
        moodEntries: moodResp.entries,
        journalEntries: journalResp.entries,
        habitEntries: habitEntriesResp.entries,
        habits: habitsResp.habits,
        routineEntries: routineEntriesResp.entries,
        routineItems: routineItemsResp.items,
        calendarEvents: eventsResp.events,
      });
    } catch (error) {
      console.error("Failed to load day data:", error);
      showError("Failed to load day data");
    } finally {
      setLoading(false);
    }
  };

  const navigateDay = (direction: "prev" | "next") => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await backend.task.updateTask({ id: taskId, ...updates });
      await loadDayData();
      showSuccess("Task updated");
      setEditingItem(null);
    } catch (error) {
      showError("Failed to update task");
    }
  };

  const updateJournalEntry = async (entryId: string, content: string) => {
    try {
      await backend.task.updateJournalEntry({ id: entryId, content });
      await loadDayData();
      showSuccess("Journal updated");
      setEditingItem(null);
    } catch (error) {
      showError("Failed to update journal");
    }
  };

  const updateCalendarEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    try {
      await backend.calendar.updateCalendarEvent({ id: eventId, ...updates });
      await loadDayData();
      showSuccess("Event updated");
      setEditingItem(null);
    } catch (error) {
      showError("Failed to update event");
    }
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getMoodTier = (mood: MoodEntry): keyof typeof moodOptions => {
    // Simple logic to determine tier based on mood value
    if (mood.mood >= 7) return "uplifted";
    if (mood.mood >= 4) return "neutral";
    return "heavy";
  };

  const getMoodDisplay = (mood: MoodEntry) => {
    const tier = getMoodTier(mood);
    const moodOption = moodOptions[tier]?.find(
      (option) => option.label === mood.label || option.emoji === mood.emoji
    );
    return moodOption || { emoji: mood.emoji || "😐", label: mood.label || "Unknown" };
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateDay("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              {date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h1>
            <Button variant="outline" size="sm" onClick={() => navigateDay("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {date.toDateString() !== new Date().toDateString() && (
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="edit-mode" className="text-sm">
            Edit Mode
          </Label>
          <Switch id="edit-mode" checked={editMode} onCheckedChange={setEditMode} />
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="moods">Moods</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tasks Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {data.tasks.filter((t) => t.status === "done").length} / {data.tasks.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    {data.tasks.length === 0
                      ? "No tasks"
                      : data.tasks.filter((t) => t.status === "done").length === data.tasks.length
                        ? "All complete!"
                        : `${data.tasks.filter((t) => t.status !== "done").length} remaining`}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mood Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Mood
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.moodEntries.length > 0 ? (
                  <div className="space-y-2">
                    {data.moodEntries.map((mood, index) => {
                      const display = getMoodDisplay(mood);
                      return (
                        <div key={mood.id} className="flex items-center gap-2">
                          <span className="text-lg">{display.emoji}</span>
                          <span className="text-sm">{display.label}</span>
                          {index === 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Latest
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">No mood entries</div>
                )}
              </CardContent>
            </Card>

            {/* Events Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{data.calendarEvents.length}</div>
                  <div className="text-sm text-gray-600">
                    {data.calendarEvents.length === 0
                      ? "No events"
                      : data.calendarEvents.length === 1
                        ? "1 event"
                        : `${data.calendarEvents.length} events`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasks for {date.toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              {data.tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No tasks scheduled for this day
                </div>
              ) : (
                <div className="space-y-3">
                  {data.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div className="flex-1">
                        {editingItem?.type === "task" && editingItem.id === task.id.toString() ? (
                          <div className="space-y-2">
                            <Input
                              value={editingItem.data.title}
                              onChange={(e) =>
                                setEditingItem({
                                  ...editingItem,
                                  data: { ...editingItem.data, title: e.target.value },
                                })
                              }
                            />
                            <Textarea
                              value={editingItem.data.description || ""}
                              onChange={(e) =>
                                setEditingItem({
                                  ...editingItem,
                                  data: { ...editingItem.data, description: e.target.value },
                                })
                              }
                              placeholder="Description..."
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => updateTask(task.id.toString(), editingItem.data)}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingItem(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{task.title}</h3>
                              <Badge variant={task.status === "done" ? "default" : "secondary"}>
                                {task.status}
                              </Badge>
                              {task.priority && task.priority > 3 && (
                                <Badge variant="destructive">High Priority</Badge>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            )}
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {task.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {editMode && editingItem?.id !== task.id.toString() && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setEditingItem({
                              type: "task",
                              id: task.id.toString(),
                              data: { ...task },
                            })
                          }
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Events for {date.toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              {data.calendarEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No events scheduled for this day
                </div>
              ) : (
                <div className="space-y-3">
                  {data.calendarEvents.map((event) => (
                    <div key={event.id} className="p-3 border rounded">
                      {editingItem?.type === "event" && editingItem.id === event.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editingItem.data.title}
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                data: { ...editingItem.data, title: e.target.value },
                              })
                            }
                          />
                          <Textarea
                            value={editingItem.data.description || ""}
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                data: { ...editingItem.data, description: e.target.value },
                              })
                            }
                            placeholder="Description..."
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateCalendarEvent(event.id, editingItem.data)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingItem(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              {event.isAllDay
                                ? "All day"
                                : `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`}
                            </div>
                            {event.description && (
                              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            )}
                          </div>
                          {editMode && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setEditingItem({
                                  type: "event",
                                  id: event.id,
                                  data: { ...event },
                                })
                              }
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mood Entries for {date.toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              {data.moodEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No mood entries for this day</div>
              ) : (
                <div className="space-y-3">
                  {data.moodEntries.map((mood) => {
                    const display = getMoodDisplay(mood);
                    const tier = getMoodTier(mood);
                    return (
                      <div key={mood.id} className="p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{display.emoji}</span>
                          <div>
                            <h3 className="font-medium">{display.label}</h3>
                            <div className="text-sm text-gray-600">
                              {tierInfo[tier]?.title} •{" "}
                              {new Date(mood.createdAt).toLocaleTimeString()}
                            </div>
                            {mood.notes && <p className="text-sm mt-1">{mood.notes}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="habits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Habit Progress for {date.toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              {data.habits.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No habits tracked</div>
              ) : (
                <div className="space-y-3">
                  {data.habits.map((habit) => {
                    const entries = data.habitEntries.filter((e) => e.habitId === habit.id);
                    const totalCount = entries.reduce((sum, e) => sum + e.count, 0);
                    const isComplete = totalCount >= habit.targetCount;

                    return (
                      <div key={habit.id} className="p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{habit.emoji || "🎯"}</span>
                            <div>
                              <h3 className="font-medium">{habit.name}</h3>
                              <div className="text-sm text-gray-600">
                                Target: {habit.targetCount} • Current: {totalCount}
                              </div>
                            </div>
                          </div>
                          <Badge variant={isComplete ? "default" : "secondary"}>
                            {isComplete ? "Complete" : "In Progress"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Journal Entries for {date.toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              {data.journalEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No journal entries for this day
                </div>
              ) : (
                <div className="space-y-3">
                  {data.journalEntries.map((entry) => (
                    <div key={entry.id} className="p-3 border rounded">
                      {editingItem?.type === "journal" && editingItem.id === entry.id.toString() ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingItem.data.content}
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                data: { ...editingItem.data, content: e.target.value },
                              })
                            }
                            rows={4}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateJournalEntry(entry.id.toString(), editingItem.data.content)
                              }
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingItem(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="h-4 w-4" />
                              <Badge variant="outline">{entry.type}</Badge>
                              <span className="text-sm text-gray-600">
                                {new Date(entry.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="whitespace-pre-wrap">{entry.content}</div>
                          </div>
                          {editMode && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setEditingItem({
                                  type: "journal",
                                  id: entry.id.toString(),
                                  data: { content: entry.content },
                                })
                              }
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
