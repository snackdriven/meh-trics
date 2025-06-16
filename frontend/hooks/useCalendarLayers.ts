import { useEffect, useState } from "react";

export interface CalendarLayers {
  tasks: boolean;
  moods: boolean;
  habits: boolean;
  journals: boolean;
  events: boolean;
}

const DEFAULT_LAYERS: CalendarLayers = {
  tasks: true,
  moods: true,
  habits: true,
  journals: true,
  events: true,
};

const STORAGE_KEY = "calendarLayers";

export function useCalendarLayers() {
  const [layers, setLayers] = useState<CalendarLayers>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_LAYERS, ...parsed };
      } catch (error) {
        console.warn("Failed to parse calendar layers from localStorage:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return DEFAULT_LAYERS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layers));
  }, [layers]);

  const toggleLayer = (key: keyof CalendarLayers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return { layers, toggleLayer };
}
