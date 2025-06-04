import { useState, useEffect } from "react";

export interface MoodOption {
  emoji: string;
  label: string;
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
    { emoji: "😄", label: "Happy" },
    { emoji: "🙏", label: "Grateful" },
    { emoji: "🎈", label: "Playful" },
    { emoji: "💖", label: "Loving" },
    { emoji: "🥰", label: "Affectionate" },
    { emoji: "📘", label: "Optimistic" },
    { emoji: "🌞", label: "Hopeful" },
    { emoji: "⚡", label: "Motivated" },
    { emoji: "🤓", label: "Curious" },
    { emoji: "🧃", label: "Excited" },
    { emoji: "🌿", label: "Content" },
    { emoji: "✨", label: "Inspired" },
    { emoji: "🔗", label: "Connected" },
  ],
  neutral: [
    { emoji: "😟", label: "Confused" },
    { emoji: "😰", label: "Anxious" },
    { emoji: "😔", label: "Insecure" },
    { emoji: "😟", label: "Worried" },
    { emoji: "😲", label: "Startled" },
    { emoji: "🌀", label: "Restless" },
    { emoji: "😳", label: "Embarrassed" },
    { emoji: "💤", label: "Tired" },
    { emoji: "😵", label: "Disoriented" },
    { emoji: "🤨", label: "Judgmental" },
    { emoji: "😵‍💫", label: "Overstimulated" },
    { emoji: "🔍", label: "Disconnected" },
  ],
  heavy: [
    { emoji: "😞", label: "Sad" },
    { emoji: "😠", label: "Frustrated" },
    { emoji: "💔", label: "Hopeless" },
    { emoji: "😔", label: "Guilty" },
    { emoji: "😔", label: "Lonely" },
    { emoji: "😡", label: "Angry" },
    { emoji: "❌", label: "Hurt" },
    { emoji: "🙇‍♀️", label: "Helpless" },
    { emoji: "🤢", label: "Repulsed" },
    { emoji: "🔥", label: "Furious" },
    { emoji: "😒", label: "Jealous" },
    { emoji: "🤢", label: "Nauseated" },
    { emoji: "😠", label: "Hostile" },
    { emoji: "😔", label: "Depressed" },
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
    return stored ? JSON.parse(stored) : defaultMoodOptions;
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
