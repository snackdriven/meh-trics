/**
 * Typography System for Compassionate Design
 *
 * Design Philosophy:
 * - Readable and accessible
 * - Warm and friendly
 * - Consistent hierarchy
 * - Responsive scaling
 */

// Font family definitions
export const fontFamilies = {
  // Sans-serif with warmth and readability
  sans: [
    "Inter Variable",
    "Inter",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "Noto Sans",
    "sans-serif",
  ].join(", "),

  // Monospace for code and data
  mono: [
    "JetBrains Mono Variable",
    "JetBrains Mono",
    "Fira Code",
    "Monaco",
    "Cascadia Code",
    "Segoe UI Mono",
    "Roboto Mono",
    "Oxygen Mono",
    "Ubuntu Monospace",
    "Source Code Pro",
    "Fira Mono",
    "Droid Sans Mono",
    "Courier New",
    "monospace",
  ].join(", "),
} as const;

// Font size scale (using rem for scalability)
export const fontSizes = {
  xs: "0.75rem", // 12px
  sm: "0.875rem", // 14px
  base: "1rem", // 16px (base size)
  lg: "1.125rem", // 18px
  xl: "1.25rem", // 20px
  "2xl": "1.5rem", // 24px
  "3xl": "1.875rem", // 30px
  "4xl": "2.25rem", // 36px
  "5xl": "3rem", // 48px
  "6xl": "3.75rem", // 60px
  "7xl": "4.5rem", // 72px
  "8xl": "6rem", // 96px
  "9xl": "8rem", // 128px
} as const;

// Font weights
export const fontWeights = {
  thin: "100",
  extralight: "200",
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
} as const;

// Line heights for optimal readability
export const lineHeights = {
  none: "1",
  tight: "1.25",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
  loose: "2",
} as const;

// Letter spacing for different use cases
export const letterSpacing = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0em",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em",
} as const;

// Semantic typography tokens
export const typography = {
  // Display text (hero sections, landing pages)
  display: {
    "2xl": {
      fontSize: fontSizes["8xl"],
      lineHeight: lineHeights.none,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.tighter,
    },
    xl: {
      fontSize: fontSizes["7xl"],
      lineHeight: lineHeights.none,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.tighter,
    },
    lg: {
      fontSize: fontSizes["6xl"],
      lineHeight: lineHeights.none,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.tight,
    },
    md: {
      fontSize: fontSizes["5xl"],
      lineHeight: lineHeights.tight,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.tight,
    },
    sm: {
      fontSize: fontSizes["4xl"],
      lineHeight: lineHeights.tight,
      fontWeight: fontWeights.semibold,
      letterSpacing: letterSpacing.normal,
    },
  },

  // Headings (page/section titles)
  heading: {
    h1: {
      fontSize: fontSizes["3xl"],
      lineHeight: lineHeights.tight,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.tight,
    },
    h2: {
      fontSize: fontSizes["2xl"],
      lineHeight: lineHeights.snug,
      fontWeight: fontWeights.semibold,
      letterSpacing: letterSpacing.normal,
    },
    h3: {
      fontSize: fontSizes.xl,
      lineHeight: lineHeights.snug,
      fontWeight: fontWeights.semibold,
      letterSpacing: letterSpacing.normal,
    },
    h4: {
      fontSize: fontSizes.lg,
      lineHeight: lineHeights.normal,
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.normal,
    },
    h5: {
      fontSize: fontSizes.base,
      lineHeight: lineHeights.normal,
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.normal,
    },
    h6: {
      fontSize: fontSizes.sm,
      lineHeight: lineHeights.normal,
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.wide,
    },
  },

  // Body text
  body: {
    lg: {
      fontSize: fontSizes.lg,
      lineHeight: lineHeights.relaxed,
      fontWeight: fontWeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    md: {
      fontSize: fontSizes.base,
      lineHeight: lineHeights.normal,
      fontWeight: fontWeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    sm: {
      fontSize: fontSizes.sm,
      lineHeight: lineHeights.normal,
      fontWeight: fontWeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    xs: {
      fontSize: fontSizes.xs,
      lineHeight: lineHeights.normal,
      fontWeight: fontWeights.normal,
      letterSpacing: letterSpacing.wide,
    },
  },

  // UI text (buttons, labels, captions)
  ui: {
    button: {
      fontSize: fontSizes.sm,
      lineHeight: lineHeights.none,
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.normal,
    },
    label: {
      fontSize: fontSizes.sm,
      lineHeight: lineHeights.normal,
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.normal,
    },
    caption: {
      fontSize: fontSizes.xs,
      lineHeight: lineHeights.normal,
      fontWeight: fontWeights.normal,
      letterSpacing: letterSpacing.wide,
    },
    overline: {
      fontSize: fontSizes.xs,
      lineHeight: lineHeights.normal,
      fontWeight: fontWeights.semibold,
      letterSpacing: letterSpacing.widest,
      textTransform: "uppercase" as const,
    },
  },

  // Code and monospace text
  code: {
    inline: {
      fontSize: fontSizes.sm,
      lineHeight: lineHeights.normal,
      fontWeight: fontWeights.normal,
      fontFamily: fontFamilies.mono,
    },
    block: {
      fontSize: fontSizes.sm,
      lineHeight: lineHeights.relaxed,
      fontWeight: fontWeights.normal,
      fontFamily: fontFamilies.mono,
    },
  },
} as const;

// CSS Custom Property Definitions for Typography
export const cssTypographyTokens = {
  // Font families
  "--font-family-sans": fontFamilies.sans,
  "--font-family-mono": fontFamilies.mono,

  // Base text styles
  "--text-color-primary": "var(--color-text-primary)",
  "--text-color-secondary": "var(--color-text-secondary)",
  "--text-color-tertiary": "var(--color-text-tertiary)",

  // Display styles
  "--text-display-2xl-size": typography.display["2xl"].fontSize,
  "--text-display-2xl-height": typography.display["2xl"].lineHeight,
  "--text-display-2xl-weight": typography.display["2xl"].fontWeight,
  "--text-display-2xl-spacing": typography.display["2xl"].letterSpacing,

  "--text-display-xl-size": typography.display.xl.fontSize,
  "--text-display-xl-height": typography.display.xl.lineHeight,
  "--text-display-xl-weight": typography.display.xl.fontWeight,
  "--text-display-xl-spacing": typography.display.xl.letterSpacing,

  // Heading styles
  "--text-h1-size": typography.heading.h1.fontSize,
  "--text-h1-height": typography.heading.h1.lineHeight,
  "--text-h1-weight": typography.heading.h1.fontWeight,
  "--text-h1-spacing": typography.heading.h1.letterSpacing,

  "--text-h2-size": typography.heading.h2.fontSize,
  "--text-h2-height": typography.heading.h2.lineHeight,
  "--text-h2-weight": typography.heading.h2.fontWeight,
  "--text-h2-spacing": typography.heading.h2.letterSpacing,

  "--text-h3-size": typography.heading.h3.fontSize,
  "--text-h3-height": typography.heading.h3.lineHeight,
  "--text-h3-weight": typography.heading.h3.fontWeight,
  "--text-h3-spacing": typography.heading.h3.letterSpacing,

  // Body styles
  "--text-body-lg-size": typography.body.lg.fontSize,
  "--text-body-lg-height": typography.body.lg.lineHeight,
  "--text-body-lg-weight": typography.body.lg.fontWeight,

  "--text-body-md-size": typography.body.md.fontSize,
  "--text-body-md-height": typography.body.md.lineHeight,
  "--text-body-md-weight": typography.body.md.fontWeight,

  "--text-body-sm-size": typography.body.sm.fontSize,
  "--text-body-sm-height": typography.body.sm.lineHeight,
  "--text-body-sm-weight": typography.body.sm.fontWeight,

  // UI styles
  "--text-button-size": typography.ui.button.fontSize,
  "--text-button-height": typography.ui.button.lineHeight,
  "--text-button-weight": typography.ui.button.fontWeight,
  "--text-button-spacing": typography.ui.button.letterSpacing,

  "--text-label-size": typography.ui.label.fontSize,
  "--text-label-height": typography.ui.label.lineHeight,
  "--text-label-weight": typography.ui.label.fontWeight,

  "--text-caption-size": typography.ui.caption.fontSize,
  "--text-caption-height": typography.ui.caption.lineHeight,
  "--text-caption-weight": typography.ui.caption.fontWeight,
  "--text-caption-spacing": typography.ui.caption.letterSpacing,
} as const;
