/**
 * Unified Theme Provider
 *
 * Consolidates the simple ThemeProvider and advanced ThemeContext into a single,
 * cohesive system. Provides both basic light/dark switching and advanced theme
 * customization capabilities.
 */

import type React from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { cssColorTokens } from "../tokens/colors";
import type { ColorToken, ThemeConfig, ThemeMode, ThemeSettings } from "../types/theme";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface UnifiedThemeContextValue {
  // === BASIC THEME API (compatible with old ThemeProvider) ===
  /** Current theme mode */
  theme: "light" | "dark" | "system";
  /** Resolved theme (light or dark) */
  resolvedTheme: "light" | "dark";
  /** Set theme mode */
  setTheme: (theme: "light" | "dark" | "system") => void;
  /** Toggle between light and dark */
  toggleTheme: () => void;

  // === ADVANCED THEME API (from ThemeContext) ===
  /** Current theme settings */
  settings: ThemeSettings;
  /** Available themes */
  themes: ThemeConfig[];
  /** Available themes as object (for quick lookup) */
  availableThemes: Record<string, ThemeConfig>;
  /** Current theme configuration */
  currentTheme: ThemeConfig | null;

  // Theme management
  /** Switch to a different theme */
  switchTheme: (themeId: string) => void;
  /** Set theme mode (light/dark/auto) */
  setThemeMode: (mode: ThemeMode) => void;
  /** Create a new custom theme */
  createTheme: (name: string, baseThemeId?: string) => ThemeConfig;
  /** Update a theme's configuration */
  updateTheme: (themeId: string, updates: Partial<ThemeConfig>) => void;
  /** Delete a custom theme */
  deleteTheme: (themeId: string) => void;
  /** Update a specific color token */
  updateColorToken: (themeId: string, tokenName: string, value: string) => void;

  // Import/Export
  /** Export theme configuration */
  exportTheme: (themeId: string) => string;
  /** Import theme configuration */
  importTheme: (themeData: string) => ThemeConfig;
  /** Reset to default theme */
  resetToDefault: () => void;

  // Enhanced features
  /** Enable/disable smooth transitions */
  setTransitionsEnabled: (enabled: boolean) => void;
  /** Apply theme with transition animation */
  switchThemeWithTransition: (themeId: string, duration?: number) => Promise<void>;
  /** Validate theme configuration */
  validateTheme: (theme: Partial<ThemeConfig>) => { isValid: boolean; errors: string[] };
  /** Generate high contrast version of current theme */
  generateHighContrastTheme: () => ThemeConfig;
  /** Check if current theme meets accessibility standards */
  checkAccessibility: () => { passed: boolean; issues: string[] };
  /** Get CSS custom properties as object */
  getCSSProperties: () => Record<string, string>;
  /** Merge themes with inheritance */
  mergeThemes: (baseThemeId: string, overrideThemeId: string) => ThemeConfig;
  /** Create theme preset from current settings */
  createPreset: (name: string) => void;
  /** Apply theme preset */
  applyPreset: (presetName: string) => void;
  /** Get theme inheritance chain */
  getThemeInheritance: (themeId: string) => string[];
}

const UnifiedThemeContext = createContext<UnifiedThemeContextValue | null>(null);

// ============================================================================
// CONSTANTS & DEFAULTS
// ============================================================================

const STORAGE_KEY = "meh-trics-theme-settings";

// Helper function to create color tokens from CSS custom properties
function createColorTokens(cssTokens: Record<string, string>): Record<string, ColorToken> {
  const tokens: Record<string, ColorToken> = {};

  Object.entries(cssTokens).forEach(([name, value]) => {
    const variable = name.startsWith("--") ? name : `--${name}`;
    tokens[name] = {
      name: name
        .replace(/^--/, "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      variable,
      value,
      description: `Semantic color for ${name.replace(/^--color-/, "").replace(/-/g, " ")}`,
      category: name.includes("background")
        ? "background"
        : name.includes("text")
          ? "text"
          : name.includes("primary") || name.includes("secondary")
            ? "primary"
            : name.includes("error") || name.includes("success") || name.includes("warning")
              ? "semantic"
              : name.includes("border")
                ? "border"
                : name.includes("interactive") || name.includes("hover") || name.includes("focus")
                  ? "interactive"
                  : "compassionate",
    };
  });

  return tokens;
}

// Create default color tokens from our design system
const defaultLightColors = createColorTokens(cssColorTokens.light);
const defaultDarkColors = createColorTokens(cssColorTokens.dark);

// Default themes
const defaultThemes: ThemeConfig[] = [
  {
    id: "default-light",
    name: "Default Light",
    isDark: false,
    isBuiltIn: true,
    colors: defaultLightColors,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "default-dark",
    name: "Default Dark",
    isDark: true,
    isBuiltIn: true,
    colors: defaultDarkColors,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ============================================================================
// UNIFIED THEME PROVIDER
// ============================================================================

interface UnifiedThemeProviderProps {
  children: React.ReactNode;
  /** Simple mode hides advanced features (defaults to false) */
  simpleMode?: boolean;
  /** Default theme for new users */
  defaultTheme?: "light" | "dark" | "system";
  /** Storage key for settings persistence */
  storageKey?: string;
}

export function UnifiedThemeProvider({
  children,
  simpleMode = false,
  defaultTheme = "system",
  storageKey = STORAGE_KEY,
}: UnifiedThemeProviderProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [settings, setSettings] = useState<ThemeSettings>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load theme settings:", error);
    }

    return {
      mode: defaultTheme === "system" ? "auto" : defaultTheme,
      activeThemeId: defaultTheme === "dark" ? "default-dark" : "default-light",
      respectSystemPreference: defaultTheme === "system",
      customThemes: [],
      animations: true,
      reducedMotion: false,
    };
  });

  const [themes, setThemes] = useState<ThemeConfig[]>(() => {
    return [...defaultThemes, ...(settings.customThemes || [])];
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  const currentTheme = themes.find((t) => t.id === settings.activeThemeId) || defaultThemes[0];
  const availableThemes = Object.fromEntries(themes.map((t) => [t.id, t]));

  // ============================================================================
  // PERSISTENCE & SYSTEM INTEGRATION
  // ============================================================================

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save theme settings:", error);
    }
  }, [settings, storageKey]);

  // Apply CSS custom properties when theme changes
  useEffect(() => {
    if (currentTheme?.colors) {
      Object.values(currentTheme.colors).forEach((token) => {
        document.documentElement.style.setProperty(token.variable, token.value);
      });
    }
  }, [currentTheme]);

  // Handle resolved theme calculation and system preference changes
  useEffect(() => {
    const calculateResolvedTheme = () => {
      if (settings.mode === "auto" && settings.respectSystemPreference) {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return prefersDark ? "dark" : "light";
      }
      if (settings.mode === "auto") {
        return currentTheme?.isDark ? "dark" : "light";
      }
      return settings.mode === "dark" ? "dark" : "light";
    };

    const newResolvedTheme = calculateResolvedTheme();
    setResolvedTheme(newResolvedTheme);

    // Apply theme to document
    const root = document.documentElement;
    root.removeAttribute("data-theme");
    root.classList.remove("light", "dark");
    root.classList.add(newResolvedTheme);
    root.setAttribute("data-theme", newResolvedTheme);
    root.style.colorScheme = newResolvedTheme;

    // Listen for system theme changes
    if (settings.mode === "auto" && settings.respectSystemPreference) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = () => {
        const prefersDark = mediaQuery.matches;
        const themeId = prefersDark ? "default-dark" : "default-light";
        if (themes.find((t) => t.id === themeId)) {
          setSettings((prev) => ({ ...prev, activeThemeId: themeId }));
        }
        setResolvedTheme(prefersDark ? "dark" : "light");
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [settings.mode, settings.respectSystemPreference, currentTheme, themes]);

  // ============================================================================
  // THEME MANAGEMENT FUNCTIONS
  // ============================================================================

  const switchTheme = useCallback((themeId: string) => {
    setSettings((prev) => ({ ...prev, activeThemeId: themeId }));
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setSettings((prev) => ({ ...prev, mode }));
  }, []);

  const createTheme = useCallback(
    (name: string, baseThemeId?: string) => {
      const baseTheme = baseThemeId ? themes.find((t) => t.id === baseThemeId) : currentTheme;
      const newTheme: ThemeConfig = {
        id: `custom-${Date.now()}`,
        name,
        isDark: baseTheme?.isDark || false,
        isBuiltIn: false,
        colors: baseTheme ? { ...baseTheme.colors } : { ...defaultLightColors },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setThemes((prev) => [...prev, newTheme]);
      setSettings((prev) => ({
        ...prev,
        customThemes: [...prev.customThemes, newTheme],
        activeThemeId: newTheme.id,
      }));

      return newTheme;
    },
    [themes, currentTheme]
  );

  const updateTheme = useCallback(
    (themeId: string, updates: Partial<ThemeConfig>) => {
      setThemes((prev) =>
        prev.map((theme) =>
          theme.id === themeId ? { ...theme, ...updates, updatedAt: new Date() } : theme
        )
      );

      if (!themes.find((t) => t.id === themeId)?.isBuiltIn) {
        setSettings((prev) => ({
          ...prev,
          customThemes: prev.customThemes.map((theme) =>
            theme.id === themeId ? { ...theme, ...updates, updatedAt: new Date() } : theme
          ),
        }));
      }
    },
    [themes]
  );

  const updateColorToken = useCallback(
    (themeId: string, tokenName: string, value: string) => {
      const theme = themes.find((t) => t.id === themeId);
      if (!theme) return;

      const existingToken = theme.colors[tokenName];
      if (!existingToken) return;

      updateTheme(themeId, {
        colors: {
          ...theme.colors,
          [tokenName]: {
            ...existingToken,
            value,
          } as ColorToken,
        },
      });
    },
    [themes, updateTheme]
  );

  const deleteTheme = useCallback(
    (themeId: string) => {
      const theme = themes.find((t) => t.id === themeId);
      if (theme?.isBuiltIn) return;

      setThemes((prev) => prev.filter((t) => t.id !== themeId));
      setSettings((prev) => ({
        ...prev,
        customThemes: prev.customThemes.filter((t) => t.id !== themeId),
        activeThemeId: prev.activeThemeId === themeId ? "default-light" : prev.activeThemeId,
      }));
    },
    [themes]
  );

  // ============================================================================
  // IMPORT/EXPORT FUNCTIONS
  // ============================================================================

  const exportTheme = useCallback(
    (themeId: string) => {
      const theme = themes.find((t) => t.id === themeId);
      if (!theme) throw new Error("Theme not found");

      return JSON.stringify(
        {
          name: theme.name,
          isDark: theme.isDark,
          colors: theme.colors,
          exportedAt: new Date().toISOString(),
          version: "1.0",
        },
        null,
        2
      );
    },
    [themes]
  );

  const importTheme = useCallback((themeData: string) => {
    try {
      const parsed = JSON.parse(themeData);
      const newTheme: ThemeConfig = {
        id: `imported-${Date.now()}`,
        name: parsed.name || "Imported Theme",
        isDark: parsed.isDark || false,
        isBuiltIn: false,
        colors: parsed.colors || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setThemes((prev) => [...prev, newTheme]);
      setSettings((prev) => ({
        ...prev,
        customThemes: [...prev.customThemes, newTheme],
      }));

      return newTheme;
    } catch (_error) {
      throw new Error("Invalid theme data");
    }
  }, []);

  const resetToDefault = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      activeThemeId: "default-light",
      mode: "auto",
    }));
  }, []);

  // ============================================================================
  // ENHANCED FEATURES
  // ============================================================================

  const setTransitionsEnabled = useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, animations: enabled }));
    document.documentElement.style.setProperty("--theme-transition-enabled", enabled ? "1" : "0");
  }, []);

  const switchThemeWithTransition = useCallback(
    async (themeId: string, duration = 300): Promise<void> => {
      return new Promise((resolve) => {
        // Add transition class
        document.documentElement.classList.add("theme-transitioning");
        document.documentElement.style.setProperty("--theme-transition-duration", `${duration}ms`);

        // Switch theme
        switchTheme(themeId);

        // Remove transition class after animation
        setTimeout(() => {
          document.documentElement.classList.remove("theme-transitioning");
          resolve();
        }, duration);
      });
    },
    [switchTheme]
  );

  // Validation, accessibility, and utility functions
  const validateTheme = useCallback(
    (theme: Partial<ThemeConfig>): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      if (!theme.name || theme.name.trim().length === 0) {
        errors.push("Theme name is required");
      }

      if (!theme.colors || Object.keys(theme.colors).length === 0) {
        errors.push("Theme must have at least one color defined");
      }

      return { isValid: errors.length === 0, errors };
    },
    []
  );

  const generateHighContrastTheme = useCallback((): ThemeConfig => {
    if (!currentTheme) throw new Error("No current theme to enhance");

    const highContrastColors = { ...currentTheme.colors };

    // Enhance contrast for text colors
    Object.keys(highContrastColors).forEach((key) => {
      if (key.includes("text") || key.includes("foreground")) {
        highContrastColors[key] = {
          ...highContrastColors[key],
          value: currentTheme.isDark ? "#ffffff" : "#000000",
        };
      }
    });

    return {
      ...currentTheme,
      id: `${currentTheme.id}-high-contrast`,
      name: `${currentTheme.name} (High Contrast)`,
      colors: highContrastColors,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }, [currentTheme]);

  const checkAccessibility = useCallback((): { passed: boolean; issues: string[] } => {
    if (!currentTheme) return { passed: false, issues: ["No theme selected"] };

    const issues: string[] = [];
    // Add accessibility checking logic here
    // For now, return a basic check

    return { passed: issues.length === 0, issues };
  }, [currentTheme]);

  const getCSSProperties = useCallback((): Record<string, string> => {
    if (!currentTheme?.colors) return {};

    const properties: Record<string, string> = {};
    Object.values(currentTheme.colors).forEach((token) => {
      properties[token.variable] = token.value;
    });
    return properties;
  }, [currentTheme]);

  const mergeThemes = useCallback(
    (baseThemeId: string, overrideThemeId: string): ThemeConfig => {
      const baseTheme = themes.find((t) => t.id === baseThemeId);
      const overrideTheme = themes.find((t) => t.id === overrideThemeId);

      if (!baseTheme) throw new Error(`Base theme not found: ${baseThemeId}`);
      if (!overrideTheme) throw new Error(`Override theme not found: ${overrideThemeId}`);

      return {
        ...baseTheme,
        id: `merged-${Date.now()}`,
        name: `${baseTheme.name} + ${overrideTheme.name}`,
        colors: { ...baseTheme.colors, ...overrideTheme.colors },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    [themes]
  );

  const createPreset = useCallback(
    (name: string) => {
      if (!currentTheme?.colors) return;

      const preset = {
        name,
        description: `Preset based on ${currentTheme.name}`,
        colors: Object.fromEntries(
          Object.entries(currentTheme.colors).map(([key, token]) => [key, token.value])
        ),
      };

      // Save preset to localStorage
      const savedPresets = JSON.parse(localStorage.getItem("theme-presets") || "[]");
      savedPresets.push(preset);
      localStorage.setItem("theme-presets", JSON.stringify(savedPresets));
    },
    [currentTheme]
  );

  const applyPreset = useCallback(
    (presetName: string) => {
      const savedPresets = JSON.parse(localStorage.getItem("theme-presets") || "[]");
      const preset = savedPresets.find((p: any) => p.name === presetName);

      if (!preset || !currentTheme) return;

      const updatedColors = { ...currentTheme.colors };
      Object.entries(preset.colors).forEach(([key, value]) => {
        if (updatedColors[key]) {
          updatedColors[key] = { ...updatedColors[key], value: value as string };
        }
      });

      updateTheme(currentTheme.id, { colors: updatedColors });
    },
    [currentTheme, updateTheme]
  );

  const getThemeInheritance = useCallback(
    (themeId: string): string[] => {
      const theme = themes.find((t) => t.id === themeId);
      if (!theme) return [];
      if (theme.isBuiltIn) return [themeId];
      return ["default-light", themeId];
    },
    [themes]
  );

  // ============================================================================
  // SIMPLE API COMPATIBILITY LAYER
  // ============================================================================

  const setTheme = useCallback(
    (theme: "light" | "dark" | "system") => {
      if (theme === "system") {
        setThemeMode("auto");
        setSettings((prev) => ({ ...prev, respectSystemPreference: true }));
      } else {
        setThemeMode(theme);
        const themeId = theme === "dark" ? "default-dark" : "default-light";
        switchTheme(themeId);
      }
    },
    [setThemeMode, switchTheme]
  );

  const toggleTheme = useCallback(() => {
    if (settings.mode === "auto") {
      // If auto, toggle to opposite of current resolved theme
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    } else {
      // Toggle between light and dark
      setTheme(settings.mode === "light" ? "dark" : "light");
    }
  }, [settings.mode, resolvedTheme, setTheme]);

  // Map mode to simple theme value
  const simpleTheme: "light" | "dark" | "system" =
    settings.respectSystemPreference && settings.mode === "auto"
      ? "system"
      : settings.mode === "auto"
        ? currentTheme?.isDark
          ? "dark"
          : "light"
        : settings.mode;

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: UnifiedThemeContextValue = {
    // Simple API (backward compatible)
    theme: simpleTheme,
    resolvedTheme,
    setTheme,
    toggleTheme,

    // Advanced API
    settings,
    themes,
    availableThemes,
    currentTheme,
    switchTheme,
    setThemeMode,
    createTheme,
    updateTheme,
    deleteTheme,
    updateColorToken,
    exportTheme,
    importTheme,
    resetToDefault,
    setTransitionsEnabled,
    switchThemeWithTransition,
    validateTheme,
    generateHighContrastTheme,
    checkAccessibility,
    getCSSProperties,
    mergeThemes,
    createPreset,
    applyPreset,
    getThemeInheritance,
  };

  return <UnifiedThemeContext.Provider value={value}>{children}</UnifiedThemeContext.Provider>;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Main theme hook - provides access to all theme functionality
 */
export function useTheme() {
  const context = useContext(UnifiedThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a UnifiedThemeProvider");
  }
  return context;
}

/**
 * Simple hook for basic theme functionality (backward compatible)
 */
export function useSimpleTheme() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  return { theme, resolvedTheme, setTheme, toggleTheme };
}

/**
 * Hook for advanced theme functionality
 */
export function useAdvancedTheme() {
  const context = useTheme();
  const { theme, resolvedTheme, setTheme, toggleTheme, ...advancedFeatures } = context;
  return advancedFeatures;
}

/**
 * Get current resolved theme without full context
 */
export function useResolvedTheme() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme;
}

/**
 * Check if current theme is dark
 */
export function useIsDark() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark";
}

/**
 * Get theme-aware class names
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
 */
export const themeScript = `
  (function() {
    try {
      const settings = JSON.parse(localStorage.getItem('meh-trics-theme-settings') || '{}');
      const theme = settings.mode || 'auto';
      const resolved = theme === 'auto' && settings.respectSystemPreference
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme === 'auto' 
          ? 'light'
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
