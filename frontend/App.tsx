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
import { Brain, Heart, CheckCircle, List, Calendar, Target, Search, RefreshCw, PieChart } from "lucide-react";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  const { toasts, dismissToast } = useToast();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
            </div>
            <p className="text-gray-600 dark:text-gray-200 text-lg">
              Your neurodivergent-first daily companion for moods, moments, and gentle productivity
            </p>
          </div>

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-8 mb-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="pulse" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Pulse
              </TabsTrigger>
              <TabsTrigger value="moment" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Moment
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
                <List className="h-4 w-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
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

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </ErrorBoundary>
  );
}
