import { useEffect, useState } from "react";
import backend from "~backend/client";

export function useAutoTags() {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const resp = await backend.tagging.getAutoTags();
        if (!cancelled) setTags(resp.tags);
      } catch {
        // ignore errors for suggestions
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return tags;
}
