import { useEffect, useState } from "react";
import {
  defaultMoodOptions,
  defaultTierInfo,
  type MoodOptions,
  type MoodOption,
  type MoodTier,
  type TierInfo,
} from "@/constants/moods";

const OPTIONS_KEY = "moodOptions";
const TIER_KEY = "moodTierInfo";

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

  const [tierInfo, setTierInfo] = useState<TierInfo>(() => {
    const stored = localStorage.getItem(TIER_KEY);
    return stored ? JSON.parse(stored) : defaultTierInfo;
  });

  useEffect(() => {
    localStorage.setItem(OPTIONS_KEY, JSON.stringify(moodOptions));
  }, [moodOptions]);

  useEffect(() => {
    localStorage.setItem(TIER_KEY, JSON.stringify(tierInfo));
  }, [tierInfo]);

  return { moodOptions, setMoodOptions, tierInfo, setTierInfo };
}
