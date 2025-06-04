import { useEffect, useState } from "react";

export const themes = ["violet", "emerald"] as const;
export type Theme = typeof themes[number];

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("violet");

  useEffect(() => {
    const stored = localStorage.getItem("colorTheme") as Theme | null;
    if (stored && themes.includes(stored)) {
      setTheme(stored);
      document.documentElement.dataset.theme = stored;
    } else {
      document.documentElement.dataset.theme = "violet";
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("colorTheme", theme);
  }, [theme]);

  return { theme, setTheme };
}
