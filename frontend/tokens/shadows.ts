/**
 * Shadow System for Compassionate Design
 * 
 * Design Philosophy:
 * - Soft and gentle elevations
 * - Natural depth perception
 * - Subtle but effective
 * - Multiple light sources for warmth
 */

// Shadow scale with warm, soft appearances
export const shadows = {
  // No shadow
  none: 'none',

  // Subtle shadows for gentle elevation
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // Inner shadows for recessed elements
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  'inner-lg': 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.1)',

  // Glow effects for focus and celebration states
  glow: '0 0 0 3px rgba(14, 165, 233, 0.15)',
  'glow-success': '0 0 0 3px rgba(34, 197, 94, 0.15)',
  'glow-warning': '0 0 0 3px rgba(249, 115, 22, 0.15)',
  'glow-error': '0 0 0 3px rgba(239, 68, 68, 0.15)',
  'glow-celebration': '0 0 0 3px rgba(168, 85, 247, 0.15)'
} as const;

// Semantic shadow tokens for specific use cases
export const semanticShadows = {
  // Component shadows
  component: {
    // Card elevations
    'card-resting': 'var(--shadow-component-card-resting)',
    'card-hover': 'var(--shadow-component-card-hover)',
    'card-pressed': 'var(--shadow-component-card-pressed)',
    
    // Button elevations
    'button-resting': 'var(--shadow-component-button-resting)',
    'button-hover': 'var(--shadow-component-button-hover)',
    'button-pressed': 'var(--shadow-component-button-pressed)',
    
    // Input field shadows
    'input-resting': 'var(--shadow-component-input-resting)',
    'input-focus': 'var(--shadow-component-input-focus)',
    'input-error': 'var(--shadow-component-input-error)'
  },

  // Layout shadows
  layout: {
    // Navigation and headers
    'header': 'var(--shadow-layout-header)',
    'navigation': 'var(--shadow-layout-navigation)',
    
    // Modals and overlays
    'modal': 'var(--shadow-layout-modal)',
    'popover': 'var(--shadow-layout-popover)',
    'tooltip': 'var(--shadow-layout-tooltip)',
    
    // Content sections
    'section': 'var(--shadow-layout-section)',
    'sidebar': 'var(--shadow-layout-sidebar)'
  },

  // Interactive shadows
  interactive: {
    // Focus states
    'focus-ring': 'var(--shadow-interactive-focus-ring)',
    'focus-success': 'var(--shadow-interactive-focus-success)',
    'focus-warning': 'var(--shadow-interactive-focus-warning)',
    'focus-error': 'var(--shadow-interactive-focus-error)',
    
    // Celebration effects
    'celebration-gentle': 'var(--shadow-interactive-celebration-gentle)',
    'celebration-sparkles': 'var(--shadow-interactive-celebration-sparkles)',
    'celebration-confetti': 'var(--shadow-interactive-celebration-confetti)'
  }
} as const;

// CSS Custom Property Definitions for Shadows
export const cssShadowTokens = {
  // Component shadows
  '--shadow-component-card-resting': shadows.sm,
  '--shadow-component-card-hover': shadows.md,
  '--shadow-component-card-pressed': shadows.xs,
  
  '--shadow-component-button-resting': shadows.xs,
  '--shadow-component-button-hover': shadows.sm,
  '--shadow-component-button-pressed': shadows.inner,
  
  '--shadow-component-input-resting': shadows.inner,
  '--shadow-component-input-focus': `${shadows.inner}, ${shadows.glow}`,
  '--shadow-component-input-error': `${shadows.inner}, ${shadows['glow-error']}`,

  // Layout shadows
  '--shadow-layout-header': shadows.sm,
  '--shadow-layout-navigation': shadows.md,
  '--shadow-layout-modal': shadows['2xl'],
  '--shadow-layout-popover': shadows.lg,
  '--shadow-layout-tooltip': shadows.md,
  '--shadow-layout-section': shadows.xs,
  '--shadow-layout-sidebar': shadows.lg,

  // Interactive shadows
  '--shadow-interactive-focus-ring': shadows.glow,
  '--shadow-interactive-focus-success': shadows['glow-success'],
  '--shadow-interactive-focus-warning': shadows['glow-warning'],
  '--shadow-interactive-focus-error': shadows['glow-error'],
  '--shadow-interactive-celebration-gentle': `${shadows.md}, 0 0 20px rgba(34, 197, 94, 0.1)`,
  '--shadow-interactive-celebration-sparkles': `${shadows.lg}, 0 0 30px rgba(168, 85, 247, 0.15)`,
  '--shadow-interactive-celebration-confetti': `${shadows.xl}, 0 0 40px rgba(249, 115, 22, 0.2)`
} as const;

// Dark mode shadow adjustments
export const darkModeShadowTokens = {
  // Darker, more subtle shadows for dark backgrounds
  '--shadow-component-card-resting': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
  '--shadow-component-card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
  '--shadow-component-card-pressed': '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
  
  '--shadow-component-button-resting': '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
  '--shadow-component-button-hover': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
  '--shadow-component-button-pressed': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
  
  '--shadow-layout-modal': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  '--shadow-layout-popover': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
  
  // Enhanced glow effects for better visibility in dark mode
  '--shadow-interactive-celebration-gentle': `0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 0 25px rgba(34, 197, 94, 0.2)`,
  '--shadow-interactive-celebration-sparkles': `0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 0 35px rgba(168, 85, 247, 0.25)`,
  '--shadow-interactive-celebration-confetti': `0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 0 45px rgba(249, 115, 22, 0.3)`
} as const;