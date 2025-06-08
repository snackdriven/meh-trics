import { useEffect, useState } from "react";
import backend from "~backend/client";

export function useReflectionPrompts() {
  const [prompts, setPrompts] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await backend.task.getReflectionPrompts();
        if (!cancelled) setPrompts(res.prompts);
      } catch {
        // ignore errors when loading prompts
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return prompts;
}
