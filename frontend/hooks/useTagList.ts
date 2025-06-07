import { useState } from "react";

export interface TagList {
  tags: string[];
  customTag: string;
  setCustomTag: (value: string) => void;
  setTags: (tags: string[]) => void;
  toggleTag: (tag: string) => void;
  addCustomTag: () => void;
  removeTag: (tag: string) => void;
  reset: () => void;
}

export function useTagList(initialTags: string[] = []): TagList {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [customTag, setCustomTag] = useState("");

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags((prev) => [...prev, customTag.trim()]);
    }
    setCustomTag("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const reset = () => {
    setTags([]);
    setCustomTag("");
  };

  return {
    tags,
    customTag,
    setCustomTag,
    setTags,
    toggleTag,
    addCustomTag,
    removeTag,
    reset,
  };
}
