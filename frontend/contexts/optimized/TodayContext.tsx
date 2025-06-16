import { ReactNode, createContext, useCallback, useContext, useMemo } from "react";
import { useSWR } from "swr";
import backend from "~backend/client";
import type { Habit, HabitEntry } from "~backend/task/types";

// Split contexts for better performance
interface TodayDataContextValue {
  habits: Habit[];
  habitEntries: Record<number, HabitEntry>;
  isLoading: boolean;
  error: string | null;
  mutateHabits: () => void;
}

interface TodayActionsContextValue {
  updateHabitCount: (habitId: number, count: number) => Promise<void>;
  updateHabitNotes: (habitId: number, notes: string) => Promise<void>;
  updateHabitEntry: (habitId: number, count: number, notes: string) => Promise<void>;
}

interface TodayUIContextValue {
  collapsed: Record<string, boolean>;
  toggleCollapse: (key: string) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

// Create separate contexts
const TodayDataContext = createContext<TodayDataContextValue | null>(null);
const TodayActionsContext = createContext<TodayActionsContextValue | null>(null);
const TodayUIContext = createContext<TodayUIContextValue | null>(null);

// Custom hooks for each context
export function useTodayData() {
  const context = useContext(TodayDataContext);
  if (!context) {
    throw new Error("useTodayData must be used within TodayDataProvider");
  }
  return context;
}

export function useTodayActions() {
  const context = useContext(TodayActionsContext);
  if (!context) {
    throw new Error("useTodayActions must be used within TodayActionsProvider");
  }
  return context;
}

export function useTodayUI() {
  const context = useContext(TodayUIContext);
  if (!context) {
    throw new Error("useTodayUI must be used within TodayUIProvider");
  }
  return context;
}

// Optimized data provider with SWR
interface TodayDataProviderProps {
  children: ReactNode;
  date: Date;
}

export function TodayDataProvider({ children, date }: TodayDataProviderProps) {
  const dateString = date.toISOString().split("T")[0];

  // Use SWR for habits data
  const {
    data: habits = [],
    error: habitsError,
    mutate: mutateHabits,
    isLoading: habitsLoading,
  } = useSWR(`habits-${dateString}`, () => backend.habit.listHabits({ activeDate: dateString }), {
    revalidateOnFocus: false,
    dedupingInterval: 5000, // Dedupe requests within 5 seconds
  });

  // Use SWR for habit entries
  const {
    data: habitEntriesData = [],
    error: entriesError,
    isLoading: entriesLoading,
  } = useSWR(
    `habit-entries-${dateString}`,
    () => backend.habit.listHabitEntries({ date: dateString }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  // Normalize habit entries for O(1) lookup
  const habitEntries = useMemo(() => {
    const entries: Record<number, HabitEntry> = {};
    habitEntriesData.forEach((entry) => {
      entries[entry.habitId] = entry;
    });
    return entries;
  }, [habitEntriesData]);

  const contextValue = useMemo(
    () => ({
      habits,
      habitEntries,
      isLoading: habitsLoading || entriesLoading,
      error: habitsError?.message || entriesError?.message || null,
      mutateHabits,
    }),
    [habits, habitEntries, habitsLoading, entriesLoading, habitsError, entriesError, mutateHabits]
  );

  return <TodayDataContext.Provider value={contextValue}>{children}</TodayDataContext.Provider>;
}

// Optimistic actions provider
interface TodayActionsProviderProps {
  children: ReactNode;
  date: Date;
}

export function TodayActionsProvider({ children, date }: TodayActionsProviderProps) {
  const dateString = date.toISOString().split("T")[0];
  const { mutate } = useSWR(`habit-entries-${dateString}`);

  const updateHabitCount = useCallback(
    async (habitId: number, count: number) => {
      // Optimistic update
      mutate(
        (currentEntries: HabitEntry[] = []) => {
          const updated = [...currentEntries];
          const existingIndex = updated.findIndex((e) => e.habitId === habitId);

          if (existingIndex >= 0) {
            updated[existingIndex] = { ...updated[existingIndex], count };
          } else {
            updated.push({
              id: Date.now(), // Temporary ID
              habitId,
              date: dateString,
              count,
              notes: "",
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }

          return updated;
        },
        false // Don't revalidate immediately
      );

      try {
        // Perform actual update
        await backend.habit.createHabitEntry({
          habitId,
          date: dateString,
          count,
          notes: "", // Will be updated separately if needed
        });

        // Revalidate from server
        mutate();
      } catch (error) {
        // Revert optimistic update on error
        mutate();
        throw error;
      }
    },
    [dateString, mutate]
  );

  const updateHabitNotes = useCallback(
    async (habitId: number, notes: string) => {
      // Get current entry for this habit
      const currentEntries = await mutate();
      const currentEntry = currentEntries?.find((e) => e.habitId === habitId);

      if (currentEntry) {
        // Optimistic update
        mutate(
          (entries: HabitEntry[] = []) =>
            entries.map((e) => (e.habitId === habitId ? { ...e, notes } : e)),
          false
        );

        try {
          await backend.habit.updateHabitEntry(currentEntry.id, { notes });
          mutate();
        } catch (error) {
          mutate();
          throw error;
        }
      }
    },
    [mutate]
  );

  const updateHabitEntry = useCallback(
    async (habitId: number, count: number, notes: string) => {
      // Optimistic update for both count and notes
      mutate((currentEntries: HabitEntry[] = []) => {
        const updated = [...currentEntries];
        const existingIndex = updated.findIndex((e) => e.habitId === habitId);

        if (existingIndex >= 0) {
          updated[existingIndex] = { ...updated[existingIndex], count, notes };
        } else {
          updated.push({
            id: Date.now(),
            habitId,
            date: dateString,
            count,
            notes,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        return updated;
      }, false);

      try {
        await backend.habit.createHabitEntry({
          habitId,
          date: dateString,
          count,
          notes,
        });
        mutate();
      } catch (error) {
        mutate();
        throw error;
      }
    },
    [dateString, mutate]
  );

  const contextValue = useMemo(
    () => ({
      updateHabitCount,
      updateHabitNotes,
      updateHabitEntry,
    }),
    [updateHabitCount, updateHabitNotes, updateHabitEntry]
  );

  return (
    <TodayActionsContext.Provider value={contextValue}>{children}</TodayActionsContext.Provider>
  );
}

// UI state provider (changes infrequently)
interface TodayUIProviderProps {
  children: ReactNode;
}

export function TodayUIProvider({ children }: TodayUIProviderProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    // Load from localStorage
    const stored = localStorage.getItem("today-ui-collapsed");
    return stored ? JSON.parse(stored) : {};
  });

  const [selectedDate, setSelectedDate] = useState(new Date());

  const toggleCollapse = useCallback((key: string) => {
    setCollapsed((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("today-ui-collapsed", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      collapsed,
      toggleCollapse,
      selectedDate,
      setSelectedDate,
    }),
    [collapsed, toggleCollapse, selectedDate]
  );

  return <TodayUIContext.Provider value={contextValue}>{children}</TodayUIContext.Provider>;
}

// Composed provider for easy usage
interface TodayProviderProps {
  children: ReactNode;
  date?: Date;
}

export function TodayProvider({ children, date = new Date() }: TodayProviderProps) {
  return (
    <TodayUIProvider>
      <TodayDataProvider date={date}>
        <TodayActionsProvider date={date}>{children}</TodayActionsProvider>
      </TodayDataProvider>
    </TodayUIProvider>
  );
}
