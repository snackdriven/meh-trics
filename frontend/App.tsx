import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
// Main application shell housing all feature tabs and navigation.
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Metrics } from "./components/Metrics";
import { MomentMarker } from "./components/MomentMarker";
import { PulseCheck } from "./components/PulseCheck";
import { RoutineTracker } from "./components/RoutineTracker";
import { SettingsPage } from "./components/SettingsPage";
import { TaskTracker } from "./components/TaskTracker";
import { ToastContainer } from "./components/ToastContainer";
import { TodayView } from "./components/TodayView";
import { useToast } from "./hooks/useToast";

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
			const missing = defaultOrder.filter((k) => !filtered.includes(k));
			const updated = [...filtered, ...missing];
			const todayIndex = updated.indexOf("today");
			if (todayIndex > 0) {
				updated.splice(todayIndex, 1);
				updated.unshift("today");
			} else if (todayIndex === -1) {
				updated.unshift("today");
			}
			if (updated.length !== order.length || todayIndex !== 0) {
				localStorage.setItem("tabOrder", JSON.stringify(updated));
			}
			return updated;
		}
		return defaultOrder;
	});

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

	return (
		<ErrorBoundary>
			<div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
				<div className="container mx-auto px-4 py-8">
					<div className="mb-8 text-center">
						<div className="flex items-center justify-center gap-4 mb-3">
							<h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
								MoodLoop
							</h1>
						</div>
						<p className="text-gray-600 dark:text-gray-200 text-lg">
							The emotionally aware control panel for people doing their best
							(statistically)
						</p>
					</div>

					<Tabs defaultValue="today" className="w-full">
						<TabsList className="grid w-full grid-cols-9 mb-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
							{tabOrder.map((key) => (
								<TabsTrigger
									key={key}
									value={key}
									className="flex items-center gap-2"
								>
									<span>{tabPrefs[key].emoji}</span>
									{tabPrefs[key].label}
								</TabsTrigger>
							))}
						</TabsList>

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
					</Tabs>

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
			</div>
		</ErrorBoundary>
	);
}
