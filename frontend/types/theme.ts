/**
 * Theme Customization Types
 *
 * This file defines the TypeScript interfaces for the theme customization system.
 * It provides type safety for theme configuration and color management.
 */

export interface ColorToken {
  /** Human-readable name for the color */
  name: string;
  /** CSS custom property name (e.g., "--color-primary") */
  variable: string;
  /** Current color value (hex, rgb, hsl) */
  value: string;
  /** Description of what this color is used for */
  description: string;
  /** Category for organization */
  category:
    | "primary"
    | "semantic"
    | "compassionate"
    | "background"
    | "text"
    | "border"
    | "interactive";
}

export interface ThemeConfig {
  /** Unique identifier for the theme */
  id: string;
  /** Display name for the theme */
  name: string;
  /** Whether this is a dark mode theme */
  isDark: boolean;
  /** Whether this is a built-in theme */
  isBuiltIn: boolean;
  /** Color tokens for this theme */
  colors: Record<string, ColorToken>;
  /** Creation timestamp */
  createdAt: Date;
  /** Last modified timestamp */
  updatedAt: Date;
}

export interface ThemePreset {
  /** Preset name */
  name: string;
  /** Description */
  description: string;
  /** Color values to apply */
  colors: Record<string, string>;
  /** Preview image or gradient */
  preview?: string;
}

export interface ThemeCustomizerState {
  /** Currently active theme */
  activeTheme: ThemeConfig | null;
  /** Available themes */
  themes: ThemeConfig[];
  /** Available presets */
  presets: ThemePreset[];
  /** Whether customizer is open */
  isOpen: boolean;
  /** Currently editing theme */
  editingTheme: ThemeConfig | null;
  /** Preview mode active */
  previewMode: boolean;
}

export interface ColorCategory {
  /** Category name */
  name: string;
  /** Category description */
  description: string;
  /** Icon for the category */
  icon: string;
  /** Color tokens in this category */
  tokens: ColorToken[];
}

export type ThemeMode = "light" | "dark" | "auto";

export interface ThemeSettings {
  /** Current theme mode */
  mode: ThemeMode;
  /** Active theme ID */
  activeThemeId: string;
  /** Whether to respect system preference */
  respectSystemPreference: boolean;
  /** Custom theme configurations */
  customThemes: ThemeConfig[];
  /** Animation preferences */
  animations: boolean;
  /** Reduced motion preference */
  reducedMotion: boolean;
}
