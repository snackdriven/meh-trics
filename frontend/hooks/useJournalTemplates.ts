import { useEffect, useState } from "react";
import backend from "~backend/client";
import type { JournalTemplate } from "~backend/task/types";

export function useJournalTemplates() {
  const [templates, setTemplates] = useState<JournalTemplate[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await backend.task.listJournalTemplates();
        if (!cancelled) setTemplates(res.templates);
      } catch {
        // ignore errors when loading templates
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return templates;
}
