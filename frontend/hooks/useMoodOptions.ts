import { useEffect, useState } from "react";

export interface MoodOption {
  emoji: string;
  label: string;
  description?: string;
  hidden?: boolean;
}

export type MoodTier = "uplifted" | "neutral" | "heavy";

export type MoodOptions = Record<MoodTier, MoodOption[]>;

export interface TierInfoItem {
  title: string;
  subtitle: string;
  color: string; // hex color
}

export type TierInfo = Record<MoodTier, TierInfoItem>;

const defaultMoodOptions: MoodOptions = {
  uplifted: [
    { emoji: "😄", label: "Happy", hidden: false },
    { emoji: "🙏", label: "Grateful", hidden: false },
    { emoji: "🎈", label: "Playful", hidden: false },
    { emoji: "💖", label: "Loving", hidden: false },
    { emoji: "🥰", label: "Affectionate", hidden: false },
    { emoji: "📘", label: "Optimistic", hidden: false },
    { emoji: "🌞", label: "Hopeful", hidden: false },
    { emoji: "⚡", label: "Motivated", hidden: false },
    { emoji: "🤓", label: "Curious", hidden: false },
    { emoji: "🧃", label: "Excited", hidden: false },
    { emoji: "🌿", label: "Content", hidden: false },
    { emoji: "✨", label: "Inspired", hidden: false },
    { emoji: "🔗", label: "Connected", hidden: false },
  ],
  neutral: [
    { emoji: "😟", label: "Confused", hidden: false },
    { emoji: "😰", label: "Anxious", hidden: false },
    { emoji: "😔", label: "Insecure", hidden: false },
    { emoji: "😟", label: "Worried", hidden: false },
    { emoji: "😲", label: "Startled", hidden: false },
    { emoji: "🌀", label: "Restless", hidden: false },
    { emoji: "😳", label: "Embarrassed", hidden: false },
    { emoji: "💤", label: "Tired", hidden: false },
    { emoji: "😵", label: "Disoriented", hidden: false },
    { emoji: "🤨", label: "Judgmental", hidden: false },
    { emoji: "😵‍💫", label: "Overstimulated", hidden: false },
    { emoji: "🔍", label: "Disconnected", hidden: false },
  ],
  heavy: [
    { emoji: "😞", label: "Sad", hidden: false },
    { emoji: "😠", label: "Frustrated", hidden: false },
    { emoji: "💔", label: "Hopeless", hidden: false },
    { emoji: "😔", label: "Guilty", hidden: false },
    { emoji: "😔", label: "Lonely", hidden: false },
    { emoji: "😡", label: "Angry", hidden: false },
    { emoji: "❌", label: "Hurt", hidden: false },
    { emoji: "🙇‍♀️", label: "Helpless", hidden: false },
    { emoji: "🤢", label: "Repulsed", hidden: false },
    { emoji: "🔥", label: "Furious", hidden: false },
    { emoji: "😒", label: "Jealous", hidden: false },
    { emoji: "🤢", label: "Nauseated", hidden: false },
    { emoji: "😠", label: "Hostile", hidden: false },
    { emoji: "😔", label: "Depressed", hidden: false },
  ],
};

const defaultTierInfo: TierInfo = {
  uplifted: {
    title: "🟢 Uplifted / Energized",
    subtitle: "(positive, connected, curious, hopeful)",
    color: "#d1fae5", // green-100
  },
  neutral: {
    title: "🟡 Neutral / Mixed / Alert",
    subtitle: "(uncertain, tense, overstimulated, reflective)",
    color: "#fef3c7", // yellow-100
  },
  heavy: {
    title: "🔴 Heavy / Drained / Distressed",
    subtitle: "(hurt, angry, overwhelmed, low energy)",
    color: "#fee2e2", // red-100
  },
};

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
