import { useCallback, useEffect, useState } from "react";
import backend from "~backend/client";
import type { Habit, HabitEntry, JournalEntry, MoodEntry } from "~backend/task/types";
import { useAutoTags } from "./useAutoTags";
import { useToast } from "./useToast";

export interface TodayData {
  moodEntry: MoodEntry | null;
  journalEntry: JournalEntry | null;
  habits: Habit[];
  habitCounts: Record<number, number>;
  habitNotes: Record<number, string>;
  loading: boolean;
  handleHabitCountChange: (habitId: number, newCount: number) => void;
  updateHabitEntry: (habitId: number, count: number, notes: string) => Promise<void>;
  setHabitNotes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  setMoodEntry: React.Dispatch<React.SetStateAction<MoodEntry | null>>;
  setJournalEntry: React.Dispatch<React.SetStateAction<JournalEntry | null>>;
}

export function useTodayData(date: Date): TodayData {
  const [moodEntry, setMoodEntry] = useState<MoodEntry | null>(null);
  const [journalEntry, setJournalEntry] = useState<JournalEntry | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [_habitEntries, setHabitEntries] = useState<Record<number, HabitEntry>>({});
  const [habitCounts, setHabitCounts] = useState<Record<number, number>>({});
  const [habitNotes, setHabitNotes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const { refresh: refreshAutoTags } = useAutoTags();
  const { showSuccess, showError } = useToast();

  const dateStr = date.toISOString().split("T")[0];

  const loadData = useCallback(async () => {
    try {
      const [moodRes, habitEntriesRes, habitsRes] = await Promise.all([
        backend.task.listMoodEntries({ startDate: dateStr, endDate: dateStr }),
        backend.task.listHabitEntries({ startDate: dateStr, endDate: dateStr }),
        backend.task.listHabits(),
      ]);

      const dayMood =
        moodRes.entries.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
      setLoading(false);
    }
  }, [dateStr, showError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const updateHabitEntry = useCallback(
    async (habitId: number, count: number, notes: string) => {
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
    },
    [date, refreshAutoTags, showError, showSuccess, loadData]
  );

  const handleHabitCountChange = useCallback(
    (habitId: number, newCount: number) => {
      const count = Math.max(0, newCount);
      setHabitCounts((prev) => ({ ...prev, [habitId]: count }));
      const notes = habitNotes[habitId] || "";
      void updateHabitEntry(habitId, count, notes);
    },
    [habitNotes, updateHabitEntry]
  );

  return {
    moodEntry,
    journalEntry,
    habits,
    habitCounts,
    habitNotes,
    loading,
    handleHabitCountChange,
    updateHabitEntry,
    setHabitNotes,
    setMoodEntry,
    setJournalEntry,
  };
}
