import { useEffect, useState } from "react";
import backend from "~backend/client";
import type { MoodEntry } from "~backend/task/types";

export interface TodayMoodData {
  moodEntry: MoodEntry | null;
  setMoodEntry: React.Dispatch<React.SetStateAction<MoodEntry | null>>;
  loading: boolean;
}

export function useTodayMoodData(date: Date): TodayMoodData {
  const [moodEntry, setMoodEntry] = useState<MoodEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTodayMoodData = async () => {
      try {
        setLoading(true);
        
        // Load mood entry for today
        const dateStr = date.toISOString().split("T")[0];
        const moodResponse = await backend.mood.listMoodEntries({ 
          startDate: dateStr, 
          endDate: dateStr 
        });
        const todayEntry = moodResponse.entries?.[0] || null;
        setMoodEntry(todayEntry);
      } catch (error) {
        console.error("Error loading today's mood data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTodayMoodData();
  }, [date]);

  return {
    moodEntry,
    setMoodEntry,
    loading,
  };
}
