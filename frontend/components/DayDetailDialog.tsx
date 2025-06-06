import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Brain, CheckCircle, Target, Calendar, Plus, Minus, Edit, Trash2 } from "lucide-react";
import { EditCalendarEventDialog } from "./EditCalendarEventDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { LoadingSpinner } from "./LoadingSpinner";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
import { useMoodOptions } from "../hooks/useMoodOptions";
import { getEventColorClasses } from "./eventColors";
import backend from "~backend/client";
import type { 
  Task, 
  MoodEntry, 
  JournalEntry, 
  RoutineEntry, 
  RoutineItem, 
  HabitEntry, 
  Habit,
  CalendarEvent,
  MoodTier,
  TaskStatus
} from "~backend/task/types";

interface DayDetailDialogProps {
  date: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataUpdated: () => void;
}

const displayFields = {
  moodNotesPlaceholder: "How are you feeling?",
  journalNotesPlaceholder: "Notes...",
};


export function DayDetailDialog({ date, open, onOpenChange, onDataUpdated }: DayDetailDialogProps) {
  const { moodOptions } = useMoodOptions();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [moodEntry, setMoodEntry] = useState<MoodEntry | null>(null);
  const [journalEntry, setJournalEntry] = useState<JournalEntry | null>(null);
  const [routineEntries, setRoutineEntries] = useState<Record<number, RoutineEntry>>({});
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([]);
  const [habitEntries, setHabitEntries] = useState<Record<number, HabitEntry>>({});
  const [habits, setHabits] = useState<Habit[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<CalendarEvent | null>(null);

  // Form states
  const [selectedMoodTier, setSelectedMoodTier] = useState<MoodTier | null>(null);
  const [selectedMood, setSelectedMood] = useState<{ emoji: string; label: string } | null>(null);
  const [moodNotes, setMoodNotes] = useState("");
  const [journalEntries, setJournalEntries] = useState({
    whatHappened: "",
    whatINeed: "",
    smallWin: "",
    whatFeltHard: "",
    thoughtToRelease: "",
  });
  const [habitCounts, setHabitCounts] = useState<Record<number, number>>({});
  const [habitNotes, setHabitNotes] = useState<Record<number, string>>({});

  const { showSuccess, showError } = useToast();

  const dateStr = date.toISOString().split('T')[0];

  const {
    execute: deleteEvent,
  } = useAsyncOperation(
    async (eventId: number) => {
      await backend.task.deleteCalendarEvent({ id: eventId });
      return eventId;
    },
    (eventId) => {
      setCalendarEvents(prev => prev.filter(event => event.id !== eventId));
      setDeletingEvent(null);
      showSuccess("Event deleted successfully!");
      onDataUpdated();
    },
    (error) => {
      showError("Failed to delete event", "Delete Error");
      setDeletingEvent(null);
    }
  );

  const loadDayData = async () => {
    try {
      const [
        tasksRes,
        moodRes,
        routineEntriesRes,
        routineItemsRes,
        habitEntriesRes,
        habitsRes,
        eventsRes,
        ] = await Promise.all([
          backend.task.listTasks({}),
        backend.task.listMoodEntries({ startDate: dateStr, endDate: dateStr }),
        backend.task.listRoutineEntries({ date: dateStr }),
        backend.task.listRoutineItems(),
        backend.task.listHabitEntries({ startDate: dateStr, endDate: dateStr }),
        backend.task.listHabits(),
        backend.task.listCalendarEvents({ startDate: dateStr, endDate: dateStr }),
      ]);

      // Filter tasks for this date
      const dayTasks = tasksRes.tasks.filter(task => 
        task.dueDate && new Date(task.dueDate).toISOString().split('T')[0] === dateStr
      );
      setTasks(dayTasks);

      // Set mood entry - pick the latest if multiple exist
      const dayMood = moodRes.entries.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0] || null;
      setMoodEntry(dayMood);
      if (dayMood) {
        setSelectedMoodTier(dayMood.tier);
        setSelectedMood({ emoji: dayMood.emoji, label: dayMood.label });
        setMoodNotes(dayMood.notes || "");
      }

      // Try to get journal entry
      try {
        const journal = await backend.task.getJournalEntry({ date: dateStr });
        setJournalEntry(journal);
        setJournalEntries({
          whatHappened: journal.whatHappened || "",
          whatINeed: journal.whatINeed || "",
          smallWin: journal.smallWin || "",
          whatFeltHard: journal.whatFeltHard || "",
          thoughtToRelease: journal.thoughtToRelease || "",
        });
      } catch (error) {
        // No journal entry for this date
        setJournalEntry(null);
        setJournalEntries({
          whatHappened: "",
          whatINeed: "",
          smallWin: "",
          whatFeltHard: "",
          thoughtToRelease: "",
        });
      }

      // Set routine data
      setRoutineItems(routineItemsRes.items);
      const routineMap: Record<number, RoutineEntry> = {};
      routineEntriesRes.entries.forEach(entry => {
        routineMap[entry.routineItemId] = entry;
      });
      setRoutineEntries(routineMap);

      // Set habit data
      setHabits(habitsRes.habits);
      const habitMap: Record<number, HabitEntry> = {};
      const countsMap: Record<number, number> = {};
      const notesMap: Record<number, string> = {};
      
      habitEntriesRes.entries.forEach(entry => {
        habitMap[entry.habitId] = entry;
        countsMap[entry.habitId] = entry.count;
        notesMap[entry.habitId] = entry.notes || "";
      });
      
      // Initialize counts for habits without entries
      habitsRes.habits.forEach(habit => {
        if (!(habit.id in countsMap)) {
          countsMap[habit.id] = 0;
          notesMap[habit.id] = "";
        }
      });
      
      setHabitEntries(habitMap);
      setHabitCounts(countsMap);
      setHabitNotes(notesMap);

      // Set calendar events
      setCalendarEvents(eventsRes.events);
    } catch (error) {
      console.error("Failed to load day data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadDayData();
    }
  }, [open, dateStr]);

  const saveMoodEntry = async () => {
    if (!selectedMoodTier || !selectedMood) return;

    try {
      await backend.task.createMoodEntry({
        date: new Date(dateStr),
        tier: selectedMoodTier,
        emoji: selectedMood.emoji,
        label: selectedMood.label,
        notes: moodNotes.trim() || undefined,
      });
      onDataUpdated();
    } catch (error) {
      console.error("Failed to save mood entry:", error);
    }
  };

  const saveJournalEntry = async () => {
    try {
      await backend.task.createJournalEntry({
        date: new Date(dateStr),
        whatHappened: journalEntries.whatHappened.trim() || undefined,
        whatINeed: journalEntries.whatINeed.trim() || undefined,
        smallWin: journalEntries.smallWin.trim() || undefined,
        whatFeltHard: journalEntries.whatFeltHard.trim() || undefined,
        thoughtToRelease: journalEntries.thoughtToRelease.trim() || undefined,
      });
      onDataUpdated();
    } catch (error) {
      console.error("Failed to save journal entry:", error);
    }
  };

  const toggleRoutineItem = async (itemId: number, completed: boolean) => {
    // Optimistic update
    const optimisticEntry: RoutineEntry = {
      id: Date.now(),
      routineItemId: itemId,
      date: new Date(dateStr),
      completed,
      createdAt: new Date(),
    };

    setRoutineEntries(prev => ({
      ...prev,
      [itemId]: optimisticEntry,
    }));

    try {
      const entry = await backend.task.createRoutineEntry({
        routineItemId: itemId,
        date: new Date(dateStr),
        completed,
      });
      
      setRoutineEntries(prev => ({
        ...prev,
        [itemId]: entry,
      }));
      onDataUpdated();
    } catch (error) {
      console.error("Failed to update routine entry:", error);
      // Revert optimistic update on error
      setRoutineEntries(prev => {
        const newEntries = { ...prev };
        if (prev[itemId]?.id === optimisticEntry.id) {
          delete newEntries[itemId];
        }
        return newEntries;
      });
    }
  };

  const updateHabitEntry = async (habitId: number, count: number, notes: string) => {
    try {
      await backend.task.createHabitEntry({
        habitId,
        date: new Date(dateStr),
        count,
        notes: notes.trim() || undefined,
      });
      onDataUpdated();
    } catch (error) {
      console.error("Failed to update habit entry:", error);
      // Revert optimistic update on error
      loadDayData();
    }
  };

  const handleHabitCountChange = (habitId: number, newCount: number) => {
    const count = Math.max(0, newCount);
    
    // Optimistic update
    setHabitCounts(prev => ({ ...prev, [habitId]: count }));
    
    const notes = habitNotes[habitId] || "";
    updateHabitEntry(habitId, count, notes);
  };

  const handleTaskStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    // Optimistic update
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));

    try {
      await backend.task.updateTask({ id: taskId, status: newStatus });
      onDataUpdated();
    } catch (error) {
      console.error("Failed to update task:", error);
      // Revert optimistic update on error
      loadDayData();
    }
  };

  const handleEventUpdated = (updatedEvent: CalendarEvent) => {
    setCalendarEvents(prev => prev.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
    setEditingEvent(null);
    onDataUpdated();
  };

  const handleDeleteEvent = async () => {
    if (deletingEvent) {
      await deleteEvent(deletingEvent.id);
    }
  };

  const selectMood = (tier: MoodTier, mood: { emoji: string; label: string }) => {
    setSelectedMoodTier(tier);
    setSelectedMood(mood);
  };

  const formatEventTime = (event: CalendarEvent) => {
    if (event.isAllDay) {
      return "All day";
    }
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    return `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-8 text-center text-gray-500">
            <LoadingSpinner className="mx-auto mb-4" />
            Loading day details...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="mood" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Mood
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Journal
            </TabsTrigger>
            <TabsTrigger value="routine" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Routine
            </TabsTrigger>
            <TabsTrigger value="habits" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Habits
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Calendar Events</CardTitle>
              </CardHeader>
              <CardContent>
                {calendarEvents.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No events scheduled for this date</p>
                ) : (
                  <div className="space-y-3">
                    {calendarEvents.map((event) => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${getEventColorClasses(event.color).solid}`}
                            />
                            <h4 className="font-medium">{event.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingEvent(event)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setDeletingEvent(event)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {formatEventTime(event)}
                        </p>
                        {event.location && (
                          <p className="text-sm text-gray-600 mb-2">📍 {event.location}</p>
                        )}
                        {event.description && (
                          <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        )}
                        {event.tags.length > 0 && (
                          <div className="flex gap-2">
                            {event.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mood" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mood Check</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(moodOptions).map(([tier, options]) => (
                  <div key={tier} className="space-y-2">
                    <h4 className="font-medium capitalize">{tier}</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {options.map((option) => {
                        const isSelected = selectedMood?.emoji === option.emoji;
                        return (
                          <Button
                            key={option.emoji}
                            variant={isSelected ? "default" : "outline"}
                            className={`flex flex-col items-center gap-1 h-auto py-2 ${
                              isSelected ? "bg-purple-600 hover:bg-purple-700" : ""
                            }`}
                            onClick={() => selectMood(tier as MoodTier, option)}
                          >
                            <span className="text-lg">{option.emoji}</span>
                            <span className="text-xs">{option.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                <div>
                  <Label htmlFor="moodNotes">Notes</Label>
                  <Textarea
                    id="moodNotes"
                    value={moodNotes}
                    onChange={(e) => setMoodNotes(e.target.value)}
                    placeholder={displayFields.moodNotesPlaceholder}
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={saveMoodEntry}
                  disabled={!selectedMoodTier || !selectedMood}
                  className="w-full"
                >
                  Save Mood
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="journal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Journal Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "whatHappened", label: "What happened today?" },
                  { key: "whatINeed", label: "What do I need right now?" },
                  { key: "smallWin", label: "What's one small win?" },
                  { key: "whatFeltHard", label: "What felt hard?" },
                  { key: "thoughtToRelease", label: "Any thought I want to release:" },
                ].map((prompt) => (
                  <div key={prompt.key}>
                    <Label htmlFor={prompt.key}>{prompt.label}</Label>
                    <Textarea
                      id={prompt.key}
                      value={journalEntries[prompt.key as keyof typeof journalEntries]}
                      onChange={(e) => setJournalEntries(prev => ({
                        ...prev,
                        [prompt.key]: e.target.value
                      }))}
                      rows={3}
                    />
                  </div>
                ))}
                
                <Button onClick={saveJournalEntry} className="w-full">
                  Save Journal Entry
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="routine" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Routine Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {routineItems.map((item) => {
                  const entry = routineEntries[item.id];
                  const isCompleted = entry?.completed || false;
                  
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={(checked) => toggleRoutineItem(item.id, !!checked)}
                      />
                      <span className="text-xl">{item.emoji}</span>
                      <span className="flex-1">{item.name}</span>
                      {isCompleted && (
                        <Badge className="bg-green-100 text-green-800">✓ Done</Badge>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="habits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Habit Tracking</CardTitle>
              </CardHeader>
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
                          onClick={() => handleHabitCountChange(habit.id, count - 1)}
                          disabled={count <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          value={count}
                          onChange={(e) => handleHabitCountChange(habit.id, parseInt(e.target.value) || 0)}
                          className="w-20 text-center"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleHabitCountChange(habit.id, count + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-600">
                          / {habit.targetCount} {isCompleted && "✓"}
                        </span>
                      </div>
                      
                      <Textarea
                        value={notes}
                        onChange={(e) => setHabitNotes(prev => ({ ...prev, [habit.id]: e.target.value }))}
                        onBlur={() => updateHabitEntry(habit.id, count, notes)}
                        placeholder={displayFields.journalNotesPlaceholder}
                        rows={2}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tasks Due</CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No tasks due on this date</p>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div key={task.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{task.title}</h4>
                          <Select 
                            value={task.status} 
                            onValueChange={(value) => handleTaskStatusChange(task.id, value as TaskStatus)}
                          >
                            <SelectTrigger className="w-32">
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
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        )}
                        <div className="flex gap-2">
                          {task.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {editingEvent && (
          <EditCalendarEventDialog
            event={editingEvent}
            open={!!editingEvent}
            onOpenChange={(open) => !open && setEditingEvent(null)}
            onEventUpdated={handleEventUpdated}
          />
        )}

        <ConfirmDialog
          open={!!deletingEvent}
          onOpenChange={(open) => !open && setDeletingEvent(null)}
          title="Delete Event"
          description={`Are you sure you want to delete "${deletingEvent?.title}"?`}
          confirmText="Delete"
          onConfirm={handleDeleteEvent}
          variant="destructive"
        />
      </DialogContent>
    </Dialog>
  );
}
