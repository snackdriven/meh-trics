import { useState, useEffect, useCallback } from "react";

export function useCollapse(key: string, defaultValue = false) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return defaultValue;
    const stored = localStorage.getItem(`collapse_${key}`);
    return stored === null ? defaultValue : stored === "true";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(`collapse_${key}`, collapsed ? "true" : "false");
  }, [key, collapsed]);

  const toggle = useCallback(() => setCollapsed((c) => !c), []);

  return { collapsed, toggle, setCollapsed };
}
