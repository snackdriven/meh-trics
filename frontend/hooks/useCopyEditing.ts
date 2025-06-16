import { useState, useEffect } from "react";
import {
  defaultMoodOptions,
  defaultTierInfo,
  type MoodOptions,
  type TierInfo,
} from "@/constants/moods";
import { commonTags } from "@/constants/tags";
import { uiText, type UiText } from "@/constants/uiText";
import type { CopyEditingData } from "@/components/CopyEditingDialog";

const STORAGE_KEY = "copy-editing-data";

export function useCopyEditing() {
  const [moodOptions, setMoodOptions] = useState<MoodOptions>(defaultMoodOptions);
  const [tierInfo, setTierInfo] = useState<TierInfo>(defaultTierInfo);
  const [tags, setTags] = useState<string[]>(commonTags);
  const [customUiText, setCustomUiText] = useState<UiText>(uiText);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed: CopyEditingData = JSON.parse(savedData);
        setMoodOptions(parsed.moodOptions || defaultMoodOptions);
        setTierInfo(parsed.tierInfo || defaultTierInfo);
        setTags(parsed.tags || commonTags);
        setCustomUiText(parsed.uiText || uiText);
      } catch (e) {
        console.error("Failed to load copy editing data:", e);
      }
    }
  }, []);

  const saveCopyData = (data: CopyEditingData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setMoodOptions(data.moodOptions);
    setTierInfo(data.tierInfo);
    setTags(data.tags);
    setCustomUiText(data.uiText);
  };

  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMoodOptions(defaultMoodOptions);
    setTierInfo(defaultTierInfo);
    setTags(commonTags);
    setCustomUiText(uiText);
  };

  // Helper function to get text with fallback to default
  const getText = (section: keyof UiText, key: string): string => {
    return (customUiText[section] as any)?.[key] || (uiText[section] as any)?.[key] || key;
  };

  return {
    moodOptions,
    tierInfo,
    tags,
    uiText: customUiText,
    getText,
    saveCopyData,
    resetToDefaults,
  };
}
