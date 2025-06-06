import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Brain, Target, Calendar, Plus, Minus } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { MoodSnapshot } from './MoodSnapshot';
import backend from '~backend/client';
import type {
  Task,
  MoodEntry,
  JournalEntry,
  HabitEntry,
  Habit,
  TaskStatus,
} from '~backend/task/types';

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
  const [journalText, setJournalText] = useState('');
  const [journalTags, setJournalTags] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { showSuccess, showError } = useToast();
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];

  const loadData = async () => {
    try {
      const [tasksRes, moodRes, habitEntriesRes, habitsRes] = await Promise.all(
        [
          backend.task.listTasks({}),
          backend.task.listMoodEntries({
            startDate: dateStr,
            endDate: dateStr,
          }),
          backend.task.listHabitEntries({
            startDate: dateStr,
            endDate: dateStr,
          }),
          backend.task.listHabits(),
        ],
      );

      const dayTasks = tasksRes.tasks
        .filter(
          (task) =>
            task.dueDate &&
            new Date(task.dueDate).toISOString().split('T')[0] === dateStr,
        )
        .sort((a, b) => a.priority - b.priority);
      setTasks(dayTasks);

      const dayMood =
        moodRes.entries.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0] || null;
      setMoodEntry(dayMood);

      try {
        const journal = await backend.task.getJournalEntry({ date: dateStr });
        setJournalEntry(journal);
        setJournalText(journal.text);
        setJournalTags(journal.tags.join(', '));
      } catch (_) {
        setJournalEntry(null);
        setJournalText('');
        setJournalTags('');
      }

      setHabits(habitsRes.habits);
      const habitMap: Record<number, HabitEntry> = {};
      const countsMap: Record<number, number> = {};
      const notesMap: Record<number, string> = {};

      habitEntriesRes.entries.forEach((entry) => {
        habitMap[entry.habitId] = entry;
        countsMap[entry.habitId] = entry.count;
        notesMap[entry.habitId] = entry.notes || '';
      });

      habitsRes.habits.forEach((habit) => {
        if (!(habit.id in countsMap)) {
          countsMap[habit.id] = 0;
          notesMap[habit.id] = '';
        }
      });

      setHabitEntries(habitMap);
      setHabitCounts(countsMap);
      setHabitNotes(notesMap);
    } catch (error) {
      console.error('Failed to load today data:', error);
      showError('Failed to load today data', 'Loading Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveJournalEntry = async () => {
    try {
      const entry = await backend.task.createJournalEntry({
        date,
        text: journalText.trim(),
        tags: journalTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        moodId: moodEntry?.id,
      });
      setJournalEntry(entry);
      showSuccess('Journal saved!');
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      showError('Failed to save journal', 'Save Error');
    }
  };

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
      showSuccess('Habit updated');
    } catch (error) {
      console.error('Failed to update habit entry:', error);
      showError('Failed to update habit', 'Update Error');
      loadData();
    }
  };

  const handleHabitCountChange = (habitId: number, newCount: number) => {
    const count = Math.max(0, newCount);
    setHabitCounts((prev) => ({ ...prev, [habitId]: count }));
    const notes = habitNotes[habitId] || '';
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
      showSuccess('Task updated');
    } catch (error) {
      console.error('Failed to update task:', error);
      showError('Failed to update task', 'Update Error');
      loadData();
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <MoodSnapshot onEntryChange={setMoodEntry} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-4 w-4" /> Journal Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="journalText">Entry</Label>
            <Textarea
              id="journalText"
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="journalTags">Tags (comma separated)</Label>
            <Input
              id="journalTags"
              value={journalTags}
              onChange={(e) => setJournalTags(e.target.value)}
            />
          </div>
          <Button onClick={saveJournalEntry} className="w-full">
            Save Journal Entry
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" /> Habits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {habits.map((habit) => {
            const count = habitCounts[habit.id] || 0;
            const notes = habitNotes[habit.id] || '';
            const isCompleted = count >= habit.targetCount;
            return (
              <div key={habit.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{habit.name}</h4>
                  <Badge variant={isCompleted ? 'default' : 'outline'}>
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
                    onClick={() => handleHabitCountChange(habit.id, count + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    / {habit.targetCount} {isCompleted && '✓'}
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
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Tasks Due Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tasks due today</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{task.title}</h4>
                    <Select
                      value={task.status}
                      onValueChange={(value) =>
                        handleTaskStatusChange(task.id, value as TaskStatus)
                      }
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
                    <p className="text-sm text-gray-600 mb-2">
                      {task.description}
                    </p>
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
    </div>
  );
}
