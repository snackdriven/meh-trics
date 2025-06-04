import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PulseCheck } from "./components/PulseCheck";
import { MomentMarker } from "./components/MomentMarker";
import { RoutineTracker } from "./components/RoutineTracker";
import { TaskTracker } from "./components/TaskTracker";
import { HabitTracker } from "./components/HabitTracker";
import { CalendarView } from "./components/CalendarView";
import { GlobalSearch } from "./components/GlobalSearch";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { FeatureErrorBoundary } from "./components/FeatureErrorBoundary";
import { ToastContainer } from "./components/ToastContainer";
import { DarkModeToggle } from "./components/DarkModeToggle";
import { useToast } from "./hooks/useToast";
import { Brain, Heart, CheckCircle, List, Calendar, Target, Search, RefreshCw, PieChart, Settings } from "lucide-react";
import { EditTabsDialog, TabPref } from "./components/EditTabsDialog";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  const { toasts, dismissToast } = useToast();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTabsDialogOpen, setIsTabsDialogOpen] = useState(false);
  const [tabPrefs, setTabPrefs] = useState<Record<string, TabPref>>(() => {
    const stored = localStorage.getItem("tabPrefs");
    if (stored) return JSON.parse(stored);
    return {
      dashboard: { key: "dashboard", label: "Dashboard", emoji: "📊" },
      pulse: { key: "pulse", label: "Pulse", emoji: "❤️" },
      moment: { key: "moment", label: "Moment", emoji: "🧠" },
      routine: { key: "routine", label: "Routine", emoji: "✅" },
      habits: { key: "habits", label: "Habits", emoji: "🎯" },
      tasks: { key: "tasks", label: "Tasks", emoji: "📝" },
      calendar: { key: "calendar", label: "Calendar", emoji: "📅" },
    };
  });

  // Global keyboard shortcut for search
  useState(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-3">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🧠 Second Braincell
              </h1>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="bg-white/50 hover:bg-white/80 border-purple-200"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
                <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-gray-100 rounded border">
                  ⌘K
                </kbd>
              </Button>
              <DarkModeToggle />
              <Button variant="ghost" size="icon" onClick={() => setIsTabsDialogOpen(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-600 dark:text-gray-200 text-lg">
              Your neurodivergent-first daily companion for moods, moments, and gentle productivity
            </p>
          </div>

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-8 mb-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <span>{tabPrefs.dashboard.emoji}</span>
                {tabPrefs.dashboard.label}
              </TabsTrigger>
              <TabsTrigger value="pulse" className="flex items-center gap-2">
                <span>{tabPrefs.pulse.emoji}</span>
                {tabPrefs.pulse.label}
              </TabsTrigger>
              <TabsTrigger value="moment" className="flex items-center gap-2">
                <span>{tabPrefs.moment.emoji}</span>
                {tabPrefs.moment.label}
              </TabsTrigger>
              <TabsTrigger value="routine" className="flex items-center gap-2">
                <span>{tabPrefs.routine.emoji}</span>
                {tabPrefs.routine.label}
              </TabsTrigger>
              <TabsTrigger value="habits" className="flex items-center gap-2">
                <span>{tabPrefs.habits.emoji}</span>
                {tabPrefs.habits.label}
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <span>{tabPrefs.tasks.emoji}</span>
                {tabPrefs.tasks.label}
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <span>{tabPrefs.calendar.emoji}</span>
                {tabPrefs.calendar.label}
              </TabsTrigger>
            </TabsList>

            <FeatureErrorBoundary featureName="Dashboard" icon={PieChart}>
              <TabsContent value="dashboard">
                <Dashboard />
              </TabsContent>
            </FeatureErrorBoundary>

            <FeatureErrorBoundary featureName="Pulse Check" icon={Heart}>
              <TabsContent value="pulse">
                <PulseCheck />
              </TabsContent>
            </FeatureErrorBoundary>

            <FeatureErrorBoundary featureName="Moment Marker" icon={Brain}>
              <TabsContent value="moment">
                <MomentMarker />
              </TabsContent>
            </FeatureErrorBoundary>

            <FeatureErrorBoundary featureName="Routine Tracker" icon={CheckCircle}>
              <TabsContent value="routine">
                <RoutineTracker />
              </TabsContent>
            </FeatureErrorBoundary>

            <FeatureErrorBoundary featureName="Habit Tracker" icon={Target}>
              <TabsContent value="habits">
                <HabitTracker />
              </TabsContent>
            </FeatureErrorBoundary>

            <FeatureErrorBoundary featureName="Task Tracker" icon={List}>
              <TabsContent value="tasks">
                <TaskTracker />
              </TabsContent>
            </FeatureErrorBoundary>

            <FeatureErrorBoundary featureName="Calendar View" icon={Calendar}>
              <TabsContent value="calendar">
                <CalendarView />
              </TabsContent>
            </FeatureErrorBoundary>
          </Tabs>
        </div>

        <GlobalSearch
          open={isSearchOpen}
          onOpenChange={setIsSearchOpen}
        />

        <EditTabsDialog
          prefs={tabPrefs}
          open={isTabsDialogOpen}
          onOpenChange={setIsTabsDialogOpen}
          onSave={(prefs) => {
            setTabPrefs(prefs);
            localStorage.setItem("tabPrefs", JSON.stringify(prefs));
            setIsTabsDialogOpen(false);
          }}
        />

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </ErrorBoundary>
  );
}
