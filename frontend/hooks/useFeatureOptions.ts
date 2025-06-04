import { useState, useEffect } from "react";

export interface FeatureOptions {
  enableEditing: boolean;
  enableDragAndDrop: boolean;
}

const DEFAULT_OPTIONS: FeatureOptions = {
  enableEditing: true,
  enableDragAndDrop: true,
};

const STORAGE_KEY = "featureOptions";

export function useFeatureOptions() {
  const [options, setOptions] = useState<FeatureOptions>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_OPTIONS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
  }, [options]);

  return { options, setOptions };
}
