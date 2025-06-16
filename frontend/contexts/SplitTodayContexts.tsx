/**
 * Split Contexts for Today View
 *
 * This file implements context splitting to prevent unnecessary re-renders.
 * Split into data context (changes frequently) and UI context (changes rarely).
 */

import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";

// ============================================
// Data Context (changes frequently)
// ============================================

interface TodayData {
  habits: Array<{
    id: number;
    name: string;
    currentCount: number;
    targetCount: number;
    notes?: string;
  }>;
  tasks: Array<{
    id: number;
    title: string;
    completed: boolean;
    priority: string;
  }>;
  journalEntry?: {
    id: number;
    content: string;
    date: string;
  };
  moodEntry?: {
    id: number;
    mood: string;
    notes?: string;
  };
}

interface TodayDataContextValue {
  data: TodayData;
  isLoading: boolean;
  error?: string;
  refreshData: () => Promise<void>;
  updateHabitCount: (habitId: number, count: number) => Promise<void>;
  updateHabitNotes: (habitId: number, notes: string) => Promise<void>;
  toggleTask: (taskId: number) => Promise<void>;
  updateJournal: (content: string) => Promise<void>;
  updateMood: (mood: string, notes?: string) => Promise<void>;
}

const TodayDataContext = createContext<TodayDataContextValue | undefined>(undefined);

export function useTodayData() {
  const context = useContext(TodayDataContext);
  if (!context) {
    throw new Error("useTodayData must be used within a TodayDataProvider");
  }
  return context;
}

// ============================================
// UI Context (changes rarely)
// ============================================

interface TodayUIState {
  collapsed: Record<string, boolean>;
  selectedDate: Date;
  activeTab: string;
  showAdvanced: boolean;
}

interface TodayUIContextValue {
  ui: TodayUIState;
  toggleCollapse: (key: string) => void;
  setSelectedDate: (date: Date) => void;
  setActiveTab: (tab: string) => void;
  toggleAdvanced: () => void;
}

const TodayUIContext = createContext<TodayUIContextValue | undefined>(undefined);

export function useTodayUI() {
  const context = useContext(TodayUIContext);
  if (!context) {
    throw new Error("useTodayUI must be used within a TodayUIProvider");
  }
  return context;
}

// ============================================
// Settings Context (changes very rarely)
// ============================================

interface TodaySettings {
  theme: "light" | "dark" | "auto";
  showCompletedTasks: boolean;
  habitSortOrder: "name" | "priority" | "completion";
  autoSave: boolean;
  notifications: boolean;
}

interface TodaySettingsContextValue {
  settings: TodaySettings;
  updateSetting: <K extends keyof TodaySettings>(key: K, value: TodaySettings[K]) => void;
}

const TodaySettingsContext = createContext<TodaySettingsContextValue | undefined>(undefined);

export function useTodaySettings() {
  const context = useContext(TodaySettingsContext);
  if (!context) {
    throw new Error("useTodaySettings must be used within a TodaySettingsProvider");
  }
  return context;
}

// ============================================
// Providers
// ============================================

interface TodayDataProviderProps {
  children: ReactNode;
  initialData?: Partial<TodayData>;
}

export function TodayDataProvider({ children, initialData }: TodayDataProviderProps) {
  const [data, setData] = useState<TodayData>({
    habits: [],
    tasks: [],
    ...initialData,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      // TODO: Implement actual data fetching
      // const response = await backend.task.getTodayData();
      // setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateHabitCount = useCallback(
    async (habitId: number, count: number) => {
      // Optimistic update
      setData((prev) => ({
        ...prev,
        habits: prev.habits.map((habit) =>
          habit.id === habitId ? { ...habit, currentCount: count } : habit
        ),
      }));

      try {
        // TODO: Implement actual API call
        // await backend.habits.updateCount(habitId, count);
      } catch (err) {
        // Revert on error
        refreshData();
        throw err;
      }
    },
    [refreshData]
  );

  const updateHabitNotes = useCallback(
    async (habitId: number, notes: string) => {
      // Optimistic update
      setData((prev) => ({
        ...prev,
        habits: prev.habits.map((habit) => (habit.id === habitId ? { ...habit, notes } : habit)),
      }));

      try {
        // TODO: Implement actual API call
        // await backend.habits.updateNotes(habitId, notes);
      } catch (err) {
        refreshData();
        throw err;
      }
    },
    [refreshData]
  );

  const toggleTask = useCallback(
    async (taskId: number) => {
      // Optimistic update
      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ),
      }));

      try {
        // TODO: Implement actual API call
        // await backend.tasks.toggle(taskId);
      } catch (err) {
        refreshData();
        throw err;
      }
    },
    [refreshData]
  );

  const updateJournal = useCallback(
    async (content: string) => {
      // Optimistic update
      setData((prev) => ({
        ...prev,
        journalEntry: prev.journalEntry
          ? { ...prev.journalEntry, content }
          : { id: Date.now(), content, date: new Date().toISOString() },
      }));

      try {
        // TODO: Implement actual API call
        // await backend.journal.update(content);
      } catch (err) {
        refreshData();
        throw err;
      }
    },
    [refreshData]
  );

  const updateMood = useCallback(
    async (mood: string, notes?: string) => {
      // Optimistic update
      setData((prev) => ({
        ...prev,
        moodEntry: { id: Date.now(), mood, notes },
      }));

      try {
        // TODO: Implement actual API call
        // await backend.mood.update(mood, notes);
      } catch (err) {
        refreshData();
        throw err;
      }
    },
    [refreshData]
  );

  const value = useMemo(
    () => ({
      data,
      isLoading,
      error,
      refreshData,
      updateHabitCount,
      updateHabitNotes,
      toggleTask,
      updateJournal,
      updateMood,
    }),
    [
      data,
      isLoading,
      error,
      refreshData,
      updateHabitCount,
      updateHabitNotes,
      toggleTask,
      updateJournal,
      updateMood,
    ]
  );

  return <TodayDataContext.Provider value={value}>{children}</TodayDataContext.Provider>;
}

interface TodayUIProviderProps {
  children: ReactNode;
}

export function TodayUIProvider({ children }: TodayUIProviderProps) {
  const [ui, setUI] = useState<TodayUIState>({
    collapsed: {},
    selectedDate: new Date(),
    activeTab: "today",
    showAdvanced: false,
  });

  const toggleCollapse = useCallback((key: string) => {
    setUI((prev) => ({
      ...prev,
      collapsed: {
        ...prev.collapsed,
        [key]: !prev.collapsed[key],
      },
    }));
  }, []);

  const setSelectedDate = useCallback((date: Date) => {
    setUI((prev) => ({ ...prev, selectedDate: date }));
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    setUI((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  const toggleAdvanced = useCallback(() => {
    setUI((prev) => ({ ...prev, showAdvanced: !prev.showAdvanced }));
  }, []);

  const value = useMemo(
    () => ({
      ui,
      toggleCollapse,
      setSelectedDate,
      setActiveTab,
      toggleAdvanced,
    }),
    [ui, toggleCollapse, setSelectedDate, setActiveTab, toggleAdvanced]
  );

  return <TodayUIContext.Provider value={value}>{children}</TodayUIContext.Provider>;
}

interface TodaySettingsProviderProps {
  children: ReactNode;
  initialSettings?: Partial<TodaySettings>;
}

export function TodaySettingsProvider({ children, initialSettings }: TodaySettingsProviderProps) {
  const [settings, setSettings] = useState<TodaySettings>({
    theme: "auto",
    showCompletedTasks: true,
    habitSortOrder: "name",
    autoSave: true,
    notifications: true,
    ...initialSettings,
  });

  const updateSetting = useCallback(
    <K extends keyof TodaySettings>(key: K, value: TodaySettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));

      // Persist to localStorage
      const storageKey = `today-settings-${key}`;
      localStorage.setItem(storageKey, JSON.stringify(value));
    },
    []
  );

  const value = useMemo(
    () => ({
      settings,
      updateSetting,
    }),
    [settings, updateSetting]
  );

  return <TodaySettingsContext.Provider value={value}>{children}</TodaySettingsContext.Provider>;
}

// ============================================
// Composed Provider
// ============================================

interface TodayProvidersProps {
  children: ReactNode;
  initialData?: Partial<TodayData>;
  initialSettings?: Partial<TodaySettings>;
}

/**
 * Composed provider that wraps all Today contexts
 * Use this at the top level of your Today view
 */
export function TodayProviders({ children, initialData, initialSettings }: TodayProvidersProps) {
  return (
    <TodaySettingsProvider initialSettings={initialSettings}>
      <TodayUIProvider>
        <TodayDataProvider initialData={initialData}>{children}</TodayDataProvider>
      </TodayUIProvider>
    </TodaySettingsProvider>
  );
}
