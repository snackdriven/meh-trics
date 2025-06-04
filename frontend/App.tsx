import { useState, useEffect } from "react";

// Main application shell housing all feature tabs and navigation.
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PulseCheck } from "./components/PulseCheck";
import { MomentMarker } from "./components/MomentMarker";
import { DayView } from "./components/DayView";
import { RoutineTracker } from "./components/RoutineTracker";
import { TaskTracker } from "./components/TaskTracker";
import { HabitTracker } from "./components/HabitTracker";
import { CalendarView } from "./components/CalendarView";
import { GlobalSearch } from "./components/GlobalSearch";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { FeatureErrorBoundary } from "./components/FeatureErrorBoundary";
import { ToastContainer } from "./components/ToastContainer";
import { DarkModeToggle } from "./components/DarkModeToggle";
import { ThemeColorPicker } from "./components/ThemeColorPicker";
import { useToast } from "./hooks/useToast";
import { Brain, Heart, CheckCircle, List, Calendar, Target, Search, RefreshCw, PieChart, Settings, Sun, Sparkles } from "lucide-react";
import { Features } from "./components/Features";
import { EditTabsDialog, TabPref } from "./components/EditTabsDialog";
import { Dashboard } from "./components/Dashboard";

const defaultPrefs: Record<string, TabPref> = {
  dashboard: { key: "dashboard", label: "Dashboard", emoji: "📊" },
  day: { key: "day", label: "Today", emoji: "🌞" },
  pulse: { key: "pulse", label: "Pulse", emoji: "❤️" },
  moment: { key: "moment", label: "Moment", emoji: "🧠" },
  routine: { key: "routine", label: "Routine", emoji: "✅" },
  habits: { key: "habits", label: "Habits", emoji: "🎯" },
  tasks: { key: "tasks", label: "Tasks", emoji: "📝" },
  calendar: { key: "calendar", label: "Calendar", emoji: "📅" },
  features: { key: "features", label: "Features", emoji: "✨" },
};

export default function App() {
  const { toasts, dismissToast } = useToast();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTabsDialogOpen, setIsTabsDialogOpen] = useState(false);
  const [tabPrefs, setTabPrefs] = useState<Record<string, TabPref>>(() => {
    const stored = localStorage.getItem("tabPrefs");
    if (stored) return JSON.parse(stored);
    return defaultPrefs;
  });
  const [tabOrder, setTabOrder] = useState<string[]>(() => {
    const stored = localStorage.getItem("tabOrder");
    if (stored) return JSON.parse(stored);
    return Object.keys(defaultPrefs);
  });
  const [draggedTab, setDraggedTab] = useState<string | null>(null);

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavDragStart = (key: string) => {
    setDraggedTab(key);
  };

  const handleNavDrop = (key: string) => {
    if (!draggedTab) return;
    const from = tabOrder.indexOf(draggedTab);
    const to = tabOrder.indexOf(key);
    if (from === to) return;
    const newOrder = [...tabOrder];
    newOrder.splice(from, 1);
    newOrder.splice(to, 0, draggedTab);
    setTabOrder(newOrder);
    localStorage.setItem("tabOrder", JSON.stringify(newOrder));
    setDraggedTab(null);
  };

  const handleNavDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleNavDragEnd = () => setDraggedTab(null);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
        <Tabs defaultValue="day" orientation="vertical" className="flex w-full min-h-full">
          <TabsList className="sticky top-0 self-start min-h-screen flex flex-col gap-2 w-56 p-4 bg-[color:var(--color-sidebar)] text-[color:var(--color-sidebar-foreground)] border-r border-[color:var(--color-sidebar-border)] backdrop-blur-sm">
            {tabOrder.map(key => (
              <TabsTrigger
                key={key}
                value={key}
                className="flex items-center gap-2 justify-start w-full cursor-move"
                draggable
                onDragStart={() => handleNavDragStart(key)}
                onDragOver={handleNavDragOver}
                onDrop={() => handleNavDrop(key)}
                onDragEnd={handleNavDragEnd}
              >
                <span>{tabPrefs[key].emoji}</span>
                {tabPrefs[key].label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1">
            <div className="p-4">
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
              <ThemeColorPicker />
              <Button variant="ghost" size="icon" onClick={() => setIsTabsDialogOpen(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-600 dark:text-gray-200 text-lg">
              Your neurodivergent-first daily companion for moods, moments, and gentle productivity
            </p>
          </div>

            <FeatureErrorBoundary featureName="Dashboard" icon={PieChart}>
              <TabsContent value="dashboard">
                <Dashboard />
              </TabsContent>
            </FeatureErrorBoundary>

            <FeatureErrorBoundary featureName="Day View" icon={Sun}>
              <TabsContent value="day">
                <DayView date={new Date()} onDataUpdated={() => {}} />
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

            <FeatureErrorBoundary featureName="Features" icon={Sparkles}>
              <TabsContent value="features">
                <Features />
              </TabsContent>
            </FeatureErrorBoundary>
          </div>
        </div>
        </Tabs>

        <GlobalSearch
          open={isSearchOpen}
          onOpenChange={setIsSearchOpen}
        />

        <EditTabsDialog
          prefs={tabPrefs}
          order={tabOrder}
          open={isTabsDialogOpen}
          onOpenChange={setIsTabsDialogOpen}
          onSave={(prefs, order) => {
            setTabPrefs(prefs);
            setTabOrder(order);
            localStorage.setItem("tabPrefs", JSON.stringify(prefs));
            localStorage.setItem("tabOrder", JSON.stringify(order));
            setIsTabsDialogOpen(false);
          }}
        />

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </ErrorBoundary>
  );
}
