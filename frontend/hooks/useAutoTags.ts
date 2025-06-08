import { useCallback, useEffect, useState } from "react";
import backend from "~backend/client";

export function useAutoTags() {
  const [tags, setTags] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const resp = await backend.tagging.getAutoTags();
      setTags(resp.tags);
    } catch {
      // ignore errors for suggestions
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { tags, refresh: load };
}
