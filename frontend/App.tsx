import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
// Main application shell housing all feature tabs and navigation.
import { TabsContent } from "@/components/ui/tabs";
import {
  BarChart2,
  Brain,
  Calendar,
  CheckCircle,
  Heart,
  List,
  RefreshCw,
  Search,
  Target,
} from "lucide-react";
import { CalendarView } from "./components/CalendarView";
import { DarkModeToggle } from "./components/DarkModeToggle";
import { EditTabsDialog, type TabPref } from "./components/EditTabsDialog";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { FeatureErrorBoundary } from "./components/FeatureErrorBoundary";
import { GlobalSearch } from "./components/GlobalSearch";
import { HabitTracker } from "./components/HabitTracker";
import { Layout } from "./components/Layout";
import { Metrics } from "./components/Metrics";
import { MomentMarker } from "./components/MomentMarker";
import { PulseCheck } from "./components/PulseCheck";
import { RoutineTracker } from "./components/RoutineTracker";
import { SettingsPage } from "./components/SettingsPage";
import { TaskTracker } from "./components/TaskTracker";
import { ToastContainer } from "./components/ToastContainer";
import { TodayView } from "./components/TodayView";
import { useCurrentTime } from "./hooks/useCurrentTime";
import { useToast } from "./hooks/useToast";
import { useUserName } from "./hooks/useUserName";

const defaultPrefs: Record<string, TabPref> = {
  today: { key: "today", label: "Today", emoji: "📆" },
  metrics: { key: "metrics", label: "Metrics", emoji: "📈" },
  pulse: { key: "pulse", label: "Pulse", emoji: "❤️" },
  moment: { key: "moment", label: "Moment", emoji: "🧠" },
  routine: { key: "routine", label: "Routine", emoji: "✅" },
  habits: { key: "habits", label: "Habits", emoji: "🎯" },
  tasks: { key: "tasks", label: "Tasks", emoji: "📝" },
  calendar: { key: "calendar", label: "Calendar", emoji: "📅" },
  settings: { key: "settings", label: "Settings", emoji: "⚙️" },
};

const defaultOrder = [
  "today",
  ...Object.keys(defaultPrefs).filter((k) => k !== "today"),
];

export default function App() {
  const { toasts, dismissToast } = useToast();
  const now = useCurrentTime();
  const { name: userName } = useUserName();
  const timeStr = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = now.toLocaleDateString();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [tabPrefs, setTabPrefs] = useState<Record<string, TabPref>>(() => {
    const stored = localStorage.getItem("tabPrefs");
    if (stored) {
      const prefs = JSON.parse(stored);
      const filtered = Object.fromEntries(
        Object.entries(prefs).filter(([k]) => k in defaultPrefs),
      );
      const merged = { ...defaultPrefs, ...filtered };
      if (Object.keys(merged).length !== Object.keys(filtered).length) {
        localStorage.setItem("tabPrefs", JSON.stringify(merged));
      }
      return merged;
    }
    return defaultPrefs;
  });
  const [tabOrder, setTabOrder] = useState<string[]>(() => {
    const stored = localStorage.getItem("tabOrder");
    if (stored) {
      const order = JSON.parse(stored) as string[];
      const filtered = order.filter((key) => key in defaultPrefs);
      const missing = Object.keys(defaultPrefs).filter(
        (k) => !filtered.includes(k),
      );
      const updated = [...filtered, ...missing];
      if (updated.length !== order.length) {
        localStorage.setItem("tabOrder", JSON.stringify(updated));
      }
      return updated;
    }
    return Object.keys(defaultPrefs);
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    const rawHash = window.location.hash;
    const hash = rawHash.startsWith("#")
      ? decodeURIComponent(rawHash.slice(1))
      : "";
    return hash && hash in defaultPrefs ? hash : "today";
  });

  useEffect(() => {
    const handler = () => {
      const h = window.location.hash.replace("#", "");
      if (h in defaultPrefs) {
        setActiveTab(h);
      }
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  useEffect(() => {
    const current = window.location.hash.startsWith("#")
      ? decodeURIComponent(window.location.hash.slice(1))
      : "";
    if (current !== activeTab) {
      history.replaceState(null, "", `#${encodeURIComponent(activeTab)}`);
    }
  }, [activeTab]);

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Keyboard shortcuts for tab navigation
  useEffect(() => {
    const handleNavKeys = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        target.closest("input, textarea, [contenteditable=true]") !== null
      ) {
        return;
      }

      if (e.key >= "1" && e.key <= "9" && (e.metaKey || e.ctrlKey)) {
        const index = parseInt(e.key, 10) - 1;
        const key = tabOrder[index];
        if (key) {
          e.preventDefault();
          setActiveTab(key);
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "ArrowLeft") {
        e.preventDefault();
        const idx = tabOrder.indexOf(activeTab);
        const prev = tabOrder[(idx - 1 + tabOrder.length) % tabOrder.length];
        setActiveTab(prev);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "ArrowRight") {
        e.preventDefault();
        const idx = tabOrder.indexOf(activeTab);
        const next = tabOrder[(idx + 1) % tabOrder.length];
        setActiveTab(next);
      }
    };

    document.addEventListener("keydown", handleNavKeys);
    return () => document.removeEventListener("keydown", handleNavKeys);
  }, [activeTab, tabOrder]);

  return (
    <ErrorBoundary>
      <Layout
        tabOrder={tabOrder}
        tabPrefs={tabPrefs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <p className="text-gray-600 dark:text-gray-200 text-lg">
              Hi {userName || "there"}! it's {timeStr} and {dateStr}
            </p>
          </div>

          <FeatureErrorBoundary featureName="Today" icon={Calendar}>
            <TabsContent value="today">
              <TodayView />
            </TabsContent>
          </FeatureErrorBoundary>
          <FeatureErrorBoundary featureName="Metrics" icon={BarChart2}>
            <TabsContent value="metrics">
              <Metrics />
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

          <FeatureErrorBoundary
            featureName="Routine Tracker"
            icon={CheckCircle}
          >
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

          <TabsContent value="settings">
            <SettingsPage
              tabPrefs={tabPrefs}
              tabOrder={tabOrder}
              onTabsSave={(prefs, order) => {
                setTabPrefs(prefs);
                setTabOrder(order);
                localStorage.setItem("tabPrefs", JSON.stringify(prefs));
                localStorage.setItem("tabOrder", JSON.stringify(order));
              }}
            />
          </TabsContent>

          <footer className="mt-8 flex items-center justify-center gap-4">
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
          </footer>

          <GlobalSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />

          {/* Tab editing now lives in Settings page */}

          <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
      </Layout>
    </ErrorBoundary>
  );
}
