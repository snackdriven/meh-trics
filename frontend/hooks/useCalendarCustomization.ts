import { useEffect, useState } from "react";
import type { CalendarCustomizationSettings } from "@/components/CalendarCustomizationDialog";

const STORAGE_KEY = "calendar-customization";

const defaultSettings: CalendarCustomizationSettings = {
  defaultView: "month",
  startOfWeek: "sunday",
  weekendHighlight: true,
  todayHighlight: true,
  colorScheme: "default",
  customColors: {
    primary: "#3b82f6",
    secondary: "#64748b",
    accent: "#8b5cf6",
    background: "#ffffff",
    text: "#1f2937",
  },
  eventBadgeStyle: "rounded",
  eventTextSize: "sm",
  maxEventsPerDay: 3,
  showEventTime: true,
  compactMode: false,
  defaultLayers: {
    tasks: true,
    moods: true,
    habits: true,
    routines: true,
    events: true,
    journals: true,
  },
  cellPadding: "normal",
  showWeekNumbers: false,
  showMonthGrid: true,
  timeFormat: "12h",
  dateFormat: "US",
  enableDragDrop: true,
  enableQuickAdd: true,
  enableKeyboardShortcuts: true,
  autoRefresh: false,
  refreshInterval: 5,
  customLabels: {
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    monthNames: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    viewNames: {
      day: "Day",
      "3days": "3 Days",
      week: "Week",
      "2weeks": "2 Weeks",
      month: "Month",
    },
  },
};

export function useCalendarCustomization() {
  const [settings, setSettings] = useState<CalendarCustomizationSettings>(defaultSettings);

  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error("Failed to load calendar customization:", e);
      }
    }
  }, []);

  const saveSettings = (newSettings: CalendarCustomizationSettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    setSettings(newSettings);
  };

  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(defaultSettings);
  };

  // Helper functions for applying settings
  const getCellPaddingClass = () => {
    switch (settings.cellPadding) {
      case "tight":
        return "p-0.5";
      case "comfortable":
        return "p-3";
      default:
        return "p-1";
    }
  };

  const getEventBadgeClass = () => {
    const baseClass = "px-1 py-0.5 text-xs border";
    switch (settings.eventBadgeStyle) {
      case "square":
        return `${baseClass} rounded-none`;
      case "pill":
        return `${baseClass} rounded-full`;
      default:
        return `${baseClass} rounded`;
    }
  };

  const getEventTextSizeClass = () => {
    switch (settings.eventTextSize) {
      case "xs":
        return "text-xs";
      case "base":
        return "text-base";
      default:
        return "text-sm";
    }
  };

  const getDayNames = () => {
    if (settings.startOfWeek === "monday") {
      // Reorder to start with Monday
      return [...settings.customLabels.dayNames.slice(1), settings.customLabels.dayNames[0]];
    }
    return settings.customLabels.dayNames;
  };

  const getShortDayNames = () => {
    return getDayNames().map((day) => day.slice(0, 3));
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    if (settings.timeFormat === "24h") {
      return d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    switch (settings.dateFormat) {
      case "EU":
        return d.toLocaleDateString("en-GB");
      case "ISO":
        return d.toISOString().split("T")[0];
      default:
        return d.toLocaleDateString("en-US");
    }
  };

  const getColorSchemeStyles = () => {
    if (settings.colorScheme === "custom") {
      return {
        "--calendar-primary": settings.customColors.primary,
        "--calendar-secondary": settings.customColors.secondary,
        "--calendar-accent": settings.customColors.accent,
        "--calendar-background": settings.customColors.background,
        "--calendar-text": settings.customColors.text,
      };
    }

    // Return predefined scheme styles
    const schemes = {
      minimal: {
        "--calendar-primary": "#374151",
        "--calendar-secondary": "#9CA3AF",
        "--calendar-accent": "#6B7280",
        "--calendar-background": "#F9FAFB",
        "--calendar-text": "#111827",
      },
      vibrant: {
        "--calendar-primary": "#DC2626",
        "--calendar-secondary": "#EA580C",
        "--calendar-accent": "#7C3AED",
        "--calendar-background": "#FEF2F2",
        "--calendar-text": "#7F1D1D",
      },
      pastel: {
        "--calendar-primary": "#A78BFA",
        "--calendar-secondary": "#F9A8D4",
        "--calendar-accent": "#6EE7B7",
        "--calendar-background": "#F8FAFC",
        "--calendar-text": "#475569",
      },
      dark: {
        "--calendar-primary": "#60A5FA",
        "--calendar-secondary": "#6B7280",
        "--calendar-accent": "#A78BFA",
        "--calendar-background": "#1F2937",
        "--calendar-text": "#F9FAFB",
      },
    };

    return schemes[settings.colorScheme as keyof typeof schemes] || {};
  };

  return {
    settings,
    saveSettings,
    resetToDefaults,
    getCellPaddingClass,
    getEventBadgeClass,
    getEventTextSizeClass,
    getDayNames,
    getShortDayNames,
    formatTime,
    formatDate,
    getColorSchemeStyles,
  };
}
