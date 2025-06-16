/**
 * Semantic Color System for Compassionate Productivity
 *
 * Design Philosophy:
 * - Encouraging over demanding
 * - Soft over harsh
 * - Warm over cold
 * - Inclusive over exclusive
 */

// Base Color Palettes
const palette = {
  // Neutral - Soft grays with warmth
  neutral: {
    50: "#fafaf9", // Almost white with warmth
    100: "#f5f5f4", // Very light warm gray
    200: "#e7e5e4", // Light warm gray
    300: "#d6d3d1", // Light-medium gray
    400: "#a8a29e", // Medium gray
    500: "#78716c", // Base gray
    600: "#57534e", // Dark-medium gray
    700: "#44403c", // Dark gray
    800: "#292524", // Very dark gray
    900: "#1c1917", // Almost black with warmth
    950: "#0c0a09", // Deep warm black
  },

  // Encouragement - Warm greens for success
  encouragement: {
    50: "#f0fdf4", // Very light success green
    100: "#dcfce7", // Light success green
    200: "#bbf7d0", // Soft success green
    300: "#86efac", // Medium-light success
    400: "#4ade80", // Medium success
    500: "#22c55e", // Base success (primary green)
    600: "#16a34a", // Dark-medium success
    700: "#15803d", // Dark success
    800: "#166534", // Very dark success
    900: "#14532d", // Deep success
    950: "#052e16", // Deepest success
  },

  // Gentle - Soft blues for calm actions
  gentle: {
    50: "#f0f9ff", // Very light blue
    100: "#e0f2fe", // Light blue
    200: "#bae6fd", // Soft blue
    300: "#7dd3fc", // Medium-light blue
    400: "#38bdf8", // Medium blue
    500: "#0ea5e9", // Base blue
    600: "#0284c7", // Dark-medium blue
    700: "#0369a1", // Dark blue
    800: "#075985", // Very dark blue
    900: "#0c4a6e", // Deep blue
    950: "#082f49", // Deepest blue
  },

  // Celebration - Warm purples for achievements
  celebration: {
    50: "#faf5ff", // Very light purple
    100: "#f3e8ff", // Light purple
    200: "#e9d5ff", // Soft purple
    300: "#d8b4fe", // Medium-light purple
    400: "#c084fc", // Medium purple
    500: "#a855f7", // Base purple
    600: "#9333ea", // Dark-medium purple
    700: "#7c3aed", // Dark purple
    800: "#6b21a8", // Very dark purple
    900: "#581c87", // Deep purple
    950: "#3b0764", // Deepest purple
  },

  // Wisdom - Warm oranges for insights
  wisdom: {
    50: "#fefaf0", // Very light orange
    100: "#fef3c7", // Light orange
    200: "#fed7aa", // Soft orange
    300: "#fdba74", // Medium-light orange
    400: "#fb923c", // Medium orange
    500: "#f97316", // Base orange
    600: "#ea580c", // Dark-medium orange
    700: "#c2410c", // Dark orange
    800: "#9a3412", // Very dark orange
    900: "#7c2d12", // Deep orange
    950: "#431407", // Deepest orange
  },

  // Caution - Soft reds for gentle warnings
  caution: {
    50: "#fef2f2", // Very light red
    100: "#fee2e2", // Light red
    200: "#fecaca", // Soft red
    300: "#fca5a5", // Medium-light red
    400: "#f87171", // Medium red
    500: "#ef4444", // Base red
    600: "#dc2626", // Dark-medium red
    700: "#b91c1c", // Dark red
    800: "#991b1b", // Very dark red
    900: "#7f1d1d", // Deep red
    950: "#450a0a", // Deepest red
  },
} as const;

// Semantic Color Tokens
export const colors = {
  // Background colors
  background: {
    primary: "var(--color-background-primary)", // Main app background
    secondary: "var(--color-background-secondary)", // Card backgrounds
    tertiary: "var(--color-background-tertiary)", // Subtle sections
    overlay: "var(--color-background-overlay)", // Modal overlays
    inverse: "var(--color-background-inverse)", // Dark backgrounds in light mode
  },

  // Text colors
  text: {
    primary: "var(--color-text-primary)", // Main text
    secondary: "var(--color-text-secondary)", // Secondary text
    tertiary: "var(--color-text-tertiary)", // Muted text
    inverse: "var(--color-text-inverse)", // Text on dark backgrounds
    placeholder: "var(--color-text-placeholder)", // Form placeholders
  },

  // Border colors
  border: {
    primary: "var(--color-border-primary)", // Default borders
    secondary: "var(--color-border-secondary)", // Subtle borders
    focus: "var(--color-border-focus)", // Focus rings
    error: "var(--color-border-error)", // Error states
  },

  // Interactive colors
  interactive: {
    primary: "var(--color-interactive-primary)", // Primary buttons
    "primary-hover": "var(--color-interactive-primary-hover)",
    secondary: "var(--color-interactive-secondary)", // Secondary buttons
    "secondary-hover": "var(--color-interactive-secondary-hover)",
    tertiary: "var(--color-interactive-tertiary)", // Tertiary buttons
    "tertiary-hover": "var(--color-interactive-tertiary-hover)",
  },

  // Semantic state colors
  semantic: {
    // Success states - encouraging greens
    success: "var(--color-semantic-success)",
    "success-bg": "var(--color-semantic-success-bg)",
    "success-border": "var(--color-semantic-success-border)",
    "success-text": "var(--color-semantic-success-text)",

    // Warning states - gentle oranges
    warning: "var(--color-semantic-warning)",
    "warning-bg": "var(--color-semantic-warning-bg)",
    "warning-border": "var(--color-semantic-warning-border)",
    "warning-text": "var(--color-semantic-warning-text)",

    // Error states - soft reds
    error: "var(--color-semantic-error)",
    "error-bg": "var(--color-semantic-error-bg)",
    "error-border": "var(--color-semantic-error-border)",
    "error-text": "var(--color-semantic-error-text)",

    // Info states - calm blues
    info: "var(--color-semantic-info)",
    "info-bg": "var(--color-semantic-info-bg)",
    "info-border": "var(--color-semantic-info-border)",
    "info-text": "var(--color-semantic-info-text)",
  },

  // Compassionate productivity specific colors
  compassionate: {
    // Encouragement colors for positive reinforcement
    encouragement: "var(--color-compassionate-encouragement)",
    "encouragement-subtle": "var(--color-compassionate-encouragement-subtle)",

    // Gentle colors for soft interactions
    gentle: "var(--color-compassionate-gentle)",
    "gentle-subtle": "var(--color-compassionate-gentle-subtle)",

    // Celebration colors for achievements
    celebration: "var(--color-compassionate-celebration)",
    "celebration-subtle": "var(--color-compassionate-celebration-subtle)",

    // Wisdom colors for insights
    wisdom: "var(--color-compassionate-wisdom)",
    "wisdom-subtle": "var(--color-compassionate-wisdom-subtle)",

    // Recovery colors for rest/break states
    recovery: "var(--color-compassionate-recovery)",
    "recovery-subtle": "var(--color-compassionate-recovery-subtle)",
  },
} as const;

// CSS Custom Property Definitions
export const cssColorTokens = {
  light: {
    // Backgrounds
    "--color-background-primary": palette.neutral[50],
    "--color-background-secondary": "#ffffff",
    "--color-background-tertiary": palette.neutral[100],
    "--color-background-overlay": "rgba(0, 0, 0, 0.5)",
    "--color-background-inverse": palette.neutral[900],

    // Text
    "--color-text-primary": palette.neutral[900],
    "--color-text-secondary": palette.neutral[700],
    "--color-text-tertiary": palette.neutral[500],
    "--color-text-inverse": palette.neutral[50],
    "--color-text-placeholder": palette.neutral[400],

    // Borders
    "--color-border-primary": palette.neutral[200],
    "--color-border-secondary": palette.neutral[100],
    "--color-border-focus": palette.gentle[500],
    "--color-border-error": palette.caution[300],

    // Interactive
    "--color-interactive-primary": palette.encouragement[500],
    "--color-interactive-primary-hover": palette.encouragement[600],
    "--color-interactive-secondary": palette.gentle[500],
    "--color-interactive-secondary-hover": palette.gentle[600],
    "--color-interactive-tertiary": palette.neutral[100],
    "--color-interactive-tertiary-hover": palette.neutral[200],

    // Semantic states
    "--color-semantic-success": palette.encouragement[500],
    "--color-semantic-success-bg": palette.encouragement[50],
    "--color-semantic-success-border": palette.encouragement[200],
    "--color-semantic-success-text": palette.encouragement[700],

    "--color-semantic-warning": palette.wisdom[500],
    "--color-semantic-warning-bg": palette.wisdom[50],
    "--color-semantic-warning-border": palette.wisdom[200],
    "--color-semantic-warning-text": palette.wisdom[700],

    "--color-semantic-error": palette.caution[500],
    "--color-semantic-error-bg": palette.caution[50],
    "--color-semantic-error-border": palette.caution[200],
    "--color-semantic-error-text": palette.caution[700],

    "--color-semantic-info": palette.gentle[500],
    "--color-semantic-info-bg": palette.gentle[50],
    "--color-semantic-info-border": palette.gentle[200],
    "--color-semantic-info-text": palette.gentle[700],

    // Compassionate colors
    "--color-compassionate-encouragement": palette.encouragement[500],
    "--color-compassionate-encouragement-subtle": palette.encouragement[100],
    "--color-compassionate-gentle": palette.gentle[500],
    "--color-compassionate-gentle-subtle": palette.gentle[100],
    "--color-compassionate-celebration": palette.celebration[500],
    "--color-compassionate-celebration-subtle": palette.celebration[100],
    "--color-compassionate-wisdom": palette.wisdom[500],
    "--color-compassionate-wisdom-subtle": palette.wisdom[100],
    "--color-compassionate-recovery": palette.neutral[400],
    "--color-compassionate-recovery-subtle": palette.neutral[100],
  },

  dark: {
    // Backgrounds
    "--color-background-primary": palette.neutral[950],
    "--color-background-secondary": palette.neutral[900],
    "--color-background-tertiary": palette.neutral[800],
    "--color-background-overlay": "rgba(0, 0, 0, 0.8)",
    "--color-background-inverse": palette.neutral[50],

    // Text
    "--color-text-primary": palette.neutral[50],
    "--color-text-secondary": palette.neutral[300],
    "--color-text-tertiary": palette.neutral[400],
    "--color-text-inverse": palette.neutral[900],
    "--color-text-placeholder": palette.neutral[500],

    // Borders
    "--color-border-primary": palette.neutral[700],
    "--color-border-secondary": palette.neutral[800],
    "--color-border-focus": palette.gentle[400],
    "--color-border-error": palette.caution[600],

    // Interactive
    "--color-interactive-primary": palette.encouragement[400],
    "--color-interactive-primary-hover": palette.encouragement[300],
    "--color-interactive-secondary": palette.gentle[400],
    "--color-interactive-secondary-hover": palette.gentle[300],
    "--color-interactive-tertiary": palette.neutral[800],
    "--color-interactive-tertiary-hover": palette.neutral[700],

    // Semantic states
    "--color-semantic-success": palette.encouragement[400],
    "--color-semantic-success-bg": "rgba(34, 197, 94, 0.1)",
    "--color-semantic-success-border": palette.encouragement[700],
    "--color-semantic-success-text": palette.encouragement[300],

    "--color-semantic-warning": palette.wisdom[400],
    "--color-semantic-warning-bg": "rgba(249, 115, 22, 0.1)",
    "--color-semantic-warning-border": palette.wisdom[700],
    "--color-semantic-warning-text": palette.wisdom[300],

    "--color-semantic-error": palette.caution[400],
    "--color-semantic-error-bg": "rgba(239, 68, 68, 0.1)",
    "--color-semantic-error-border": palette.caution[700],
    "--color-semantic-error-text": palette.caution[300],

    "--color-semantic-info": palette.gentle[400],
    "--color-semantic-info-bg": "rgba(14, 165, 233, 0.1)",
    "--color-semantic-info-border": palette.gentle[700],
    "--color-semantic-info-text": palette.gentle[300],

    // Compassionate colors (adjusted for dark mode)
    "--color-compassionate-encouragement": palette.encouragement[400],
    "--color-compassionate-encouragement-subtle": "rgba(34, 197, 94, 0.15)",
    "--color-compassionate-gentle": palette.gentle[400],
    "--color-compassionate-gentle-subtle": "rgba(14, 165, 233, 0.15)",
    "--color-compassionate-celebration": palette.celebration[400],
    "--color-compassionate-celebration-subtle": "rgba(168, 85, 247, 0.15)",
    "--color-compassionate-wisdom": palette.wisdom[400],
    "--color-compassionate-wisdom-subtle": "rgba(249, 115, 22, 0.15)",
    "--color-compassionate-recovery": palette.neutral[500],
    "--color-compassionate-recovery-subtle": "rgba(120, 113, 108, 0.15)",
  },
} as const;

export { palette };
