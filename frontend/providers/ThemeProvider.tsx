import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeProviderContext {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeProviderContext = createContext<ThemeProviderContext | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

/**
 * Theme Provider for Compassionate Productivity
 *
 * Features:
 * - System preference detection
 * - Persistent theme storage
 * - Smooth theme transitions
 * - No flash of wrong theme
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "meh-trics-theme",
  attribute = "data-theme",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Get initial theme from storage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;

    if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
      setThemeState(storedTheme);
    } else if (enableSystem) {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setThemeState("system");
      setResolvedTheme(prefersDark ? "dark" : "light");
    }
  }, [storageKey, enableSystem]);

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    setResolvedTheme(mediaQuery.matches ? "dark" : "light");

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, enableSystem]);

  // Update resolved theme when theme changes
  useEffect(() => {
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setResolvedTheme(prefersDark ? "dark" : "light");
    } else {
      setResolvedTheme(theme as "light" | "dark");
    }
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Disable transitions during theme change to prevent flash
    if (disableTransitionOnChange) {
      const css = document.createElement("style");
      css.appendChild(
        document.createTextNode(
          `* {
            -webkit-transition: none !important;
            -moz-transition: none !important;
            -o-transition: none !important;
            -ms-transition: none !important;
            transition: none !important;
          }`
        )
      );
      document.head.appendChild(css);

      // Re-enable transitions after a frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.head.removeChild(css);
        });
      });
    }

    // Remove existing theme attributes
    root.removeAttribute("data-theme");
    root.classList.remove("light", "dark");

    // Apply new theme
    if (attribute === "class") {
      root.classList.add(resolvedTheme);
    } else {
      root.setAttribute(attribute, resolvedTheme);
    }

    // Also add class for CSS selector flexibility
    root.classList.add(resolvedTheme);

    // Update color-scheme for better system integration
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme, attribute, disableTransitionOnChange]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    if (theme === "system") {
      // If system, toggle to opposite of current resolved theme
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    } else {
      // Toggle between light and dark
      setTheme(theme === "light" ? "dark" : "light");
    }
  };

  const value: ThemeProviderContext = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

/**
 * Hook to access theme context
 */
export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}

/**
 * Hook to get current resolved theme without full context
 */
export function useResolvedTheme() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme;
}

/**
 * Hook to check if current theme is dark
 */
export function useIsDark() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark";
}

/**
 * Hook to get theme-aware class names
 */
export function useThemeClasses(lightClass: string, darkClass: string) {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark" ? darkClass : lightClass;
}

/**
 * Utility function to get system preference without provider
 */
export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Script to inject for preventing flash of wrong theme
 * Add this to your HTML head before any content
 */
export const themeScript = `
  (function() {
    try {
      const theme = localStorage.getItem('meh-trics-theme') || 'system';
      const resolved = theme === 'system' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;
      
      document.documentElement.setAttribute('data-theme', resolved);
      document.documentElement.classList.add(resolved);
      document.documentElement.style.colorScheme = resolved;
    } catch (e) {
      // Fallback to light theme
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
    }
  })();
`;
