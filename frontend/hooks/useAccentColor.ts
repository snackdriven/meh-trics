import { useEffect, useState } from "react";

/**
 * Manages the accent color theme.
 */
export function useAccentColor() {
  const [color, setColor] = useState<string>(() => {
    return localStorage.getItem("accentColor") || "#8b5cf6";
  });

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", color);
    localStorage.setItem("accentColor", color);
  }, [color]);

  return { color, setColor };
}
