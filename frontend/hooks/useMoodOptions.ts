import {
  type MoodOption,
  type MoodOptions,
  type MoodTier,
  defaultMoodOptions,
} from "@/constants/moods";
import { useEffect, useState } from "react";

const OPTIONS_KEY = "moodOptions";

export function useMoodOptions() {
  const [moodOptions, setMoodOptions] = useState<MoodOptions>(() => {
    const stored = localStorage.getItem(OPTIONS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as MoodOptions;
        for (const tier of ["uplifted", "neutral", "heavy"] as const) {
          parsed[tier] = parsed[tier].map((opt) => ({
            hidden: false,
            description: opt.description,
            ...opt,
          }));
        }
        return parsed;
      } catch {
        return defaultMoodOptions;
      }
    }
    return defaultMoodOptions;
  });

  useEffect(() => {
    localStorage.setItem(OPTIONS_KEY, JSON.stringify(moodOptions));
  }, [moodOptions]);

  return { moodOptions, setMoodOptions };
}
