/**
 * Spacing System for Compassionate Design
 * 
 * Design Philosophy:
 * - Generous breathing room
 * - Consistent rhythm
 * - Comfortable density
 * - Accessible touch targets
 */

// Base spacing scale (4px base unit)
const baseUnit = 4; // 4px

export const spacing = {
  // Primitive scale
  px: '1px',
  0: '0',
  0.5: `${baseUnit * 0.5}px`,  // 2px
  1: `${baseUnit * 1}px`,      // 4px
  1.5: `${baseUnit * 1.5}px`,  // 6px
  2: `${baseUnit * 2}px`,      // 8px
  2.5: `${baseUnit * 2.5}px`,  // 10px
  3: `${baseUnit * 3}px`,      // 12px
  3.5: `${baseUnit * 3.5}px`,  // 14px
  4: `${baseUnit * 4}px`,      // 16px
  5: `${baseUnit * 5}px`,      // 20px
  6: `${baseUnit * 6}px`,      // 24px
  7: `${baseUnit * 7}px`,      // 28px
  8: `${baseUnit * 8}px`,      // 32px
  9: `${baseUnit * 9}px`,      // 36px
  10: `${baseUnit * 10}px`,    // 40px
  11: `${baseUnit * 11}px`,    // 44px
  12: `${baseUnit * 12}px`,    // 48px
  14: `${baseUnit * 14}px`,    // 56px
  16: `${baseUnit * 16}px`,    // 64px
  18: `${baseUnit * 18}px`,    // 72px
  20: `${baseUnit * 20}px`,    // 80px
  24: `${baseUnit * 24}px`,    // 96px
  28: `${baseUnit * 28}px`,    // 112px
  32: `${baseUnit * 32}px`,    // 128px
  36: `${baseUnit * 36}px`,    // 144px
  40: `${baseUnit * 40}px`,    // 160px
  44: `${baseUnit * 44}px`,    // 176px
  48: `${baseUnit * 48}px`,    // 192px
  52: `${baseUnit * 52}px`,    // 208px
  56: `${baseUnit * 56}px`,    // 224px
  60: `${baseUnit * 60}px`,    // 240px
  64: `${baseUnit * 64}px`,    // 256px
  72: `${baseUnit * 72}px`,    // 288px
  80: `${baseUnit * 80}px`,    // 320px
  96: `${baseUnit * 96}px`     // 384px
} as const;

// Semantic spacing tokens
export const semanticSpacing = {
  // Component-specific spacing
  component: {
    // Button internal spacing
    'button-padding-x': 'var(--space-component-button-padding-x)',
    'button-padding-y': 'var(--space-component-button-padding-y)',
    'button-gap': 'var(--space-component-button-gap)',
    
    // Card spacing
    'card-padding': 'var(--space-component-card-padding)',
    'card-gap': 'var(--space-component-card-gap)',
    
    // Form spacing
    'form-field-gap': 'var(--space-component-form-field-gap)',
    'form-label-gap': 'var(--space-component-form-label-gap)',
    
    // List spacing
    'list-item-gap': 'var(--space-component-list-item-gap)',
    'list-item-padding': 'var(--space-component-list-item-padding)'
  },

  // Layout spacing
  layout: {
    // Page-level spacing
    'page-padding-x': 'var(--space-layout-page-padding-x)',
    'page-padding-y': 'var(--space-layout-page-padding-y)',
    'page-gap': 'var(--space-layout-page-gap)',
    
    // Section spacing
    'section-gap': 'var(--space-layout-section-gap)',
    'section-padding': 'var(--space-layout-section-padding)',
    
    // Container spacing
    'container-padding-x': 'var(--space-layout-container-padding-x)',
    'container-gap': 'var(--space-layout-container-gap)',
    
    // Grid spacing
    'grid-gap': 'var(--space-layout-grid-gap)',
    'grid-item-gap': 'var(--space-layout-grid-item-gap)'
  },

  // Interactive spacing
  interactive: {
    // Touch targets
    'touch-target': 'var(--space-interactive-touch-target)', // 44px minimum
    'focus-ring': 'var(--space-interactive-focus-ring)',
    
    // Hover states
    'hover-padding': 'var(--space-interactive-hover-padding)',
    
    // Modal/dialog spacing
    'modal-padding': 'var(--space-interactive-modal-padding)',
    'modal-gap': 'var(--space-interactive-modal-gap)'
  }
} as const;

// CSS Custom Property Definitions for Spacing
export const cssSpacingTokens = {
  // Component spacing
  '--space-component-button-padding-x': spacing[4],      // 16px
  '--space-component-button-padding-y': spacing[2.5],    // 10px
  '--space-component-button-gap': spacing[2],            // 8px
  
  '--space-component-card-padding': spacing[6],          // 24px
  '--space-component-card-gap': spacing[4],              // 16px
  
  '--space-component-form-field-gap': spacing[4],        // 16px
  '--space-component-form-label-gap': spacing[1.5],      // 6px
  
  '--space-component-list-item-gap': spacing[3],         // 12px
  '--space-component-list-item-padding': spacing[4],     // 16px

  // Layout spacing
  '--space-layout-page-padding-x': spacing[4],           // 16px (mobile)
  '--space-layout-page-padding-y': spacing[6],           // 24px
  '--space-layout-page-gap': spacing[8],                 // 32px
  
  '--space-layout-section-gap': spacing[12],             // 48px
  '--space-layout-section-padding': spacing[6],          // 24px
  
  '--space-layout-container-padding-x': spacing[4],      // 16px
  '--space-layout-container-gap': spacing[6],            // 24px
  
  '--space-layout-grid-gap': spacing[4],                 // 16px
  '--space-layout-grid-item-gap': spacing[3],            // 12px

  // Interactive spacing
  '--space-interactive-touch-target': spacing[11],       // 44px
  '--space-interactive-focus-ring': spacing[0.5],        // 2px
  '--space-interactive-hover-padding': spacing[1],       // 4px
  '--space-interactive-modal-padding': spacing[6],       // 24px
  '--space-interactive-modal-gap': spacing[4]            // 16px
} as const;

// Responsive spacing adjustments
export const responsiveSpacingTokens = {
  // Tablet and larger adjustments
  tablet: {
    '--space-layout-page-padding-x': spacing[8],         // 32px
    '--space-layout-page-gap': spacing[12],              // 48px
    '--space-component-card-padding': spacing[8],        // 32px
    '--space-layout-container-padding-x': spacing[6]     // 24px
  },
  
  // Desktop adjustments
  desktop: {
    '--space-layout-page-padding-x': spacing[12],        // 48px
    '--space-layout-page-gap': spacing[16],              // 64px
    '--space-component-card-padding': spacing[10],       // 40px
    '--space-layout-container-padding-x': spacing[8]     // 32px
  }
} as const;