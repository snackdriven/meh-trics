/**
 * Theme System - Centralized Exports
 *
 * This file provides a centralized export point for the unified theme system.
 * Import from here to access theme providers, hooks, and utilities.
 */

// Main provider and hooks
export {
  UnifiedThemeProvider,
  useTheme,
  useSimpleTheme,
  useAdvancedTheme,
  useResolvedTheme,
  useIsDark,
  useThemeClasses,
  getSystemTheme,
  themeScript,
} from "./UnifiedThemeProvider";

// Re-export types for convenience
export type {
  ColorToken,
  ThemeConfig,
  ThemeMode,
  ThemeSettings,
  ThemePreset,
} from "../types/theme";
