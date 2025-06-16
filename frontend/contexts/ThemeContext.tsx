/**
 * Theme Context Provider
 * 
 * Provides theme management functionality throughout the application.
 * Handles theme switching, persistence, and real-time updates.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ThemeConfig, ThemeSettings, ThemeMode, ColorToken } from '../types/theme';
import { cssColorTokens } from '../tokens/colors';

interface ThemeContextValue {
  /** Current theme settings */
  settings: ThemeSettings;
  /** Available themes */
  themes: ThemeConfig[];
  /** Current theme configuration */
  currentTheme: ThemeConfig | null;
  /** Switch to a different theme */
  switchTheme: (themeId: string) => void;
  /** Set theme mode (light/dark/auto) */
  setThemeMode: (mode: ThemeMode) => void;
  /** Create a new custom theme */
  createTheme: (name: string, baseThemeId?: string) => ThemeConfig;
  /** Update a theme's colors */
  updateTheme: (themeId: string, updates: Partial<ThemeConfig>) => void;
  /** Delete a custom theme */
  deleteTheme: (themeId: string) => void;
  /** Update a specific color token */
  updateColorToken: (themeId: string, tokenName: string, value: string) => void;
  /** Export theme configuration */
  exportTheme: (themeId: string) => string;
  /** Import theme configuration */
  importTheme: (themeData: string) => ThemeConfig;
  /** Reset to default theme */
  resetToDefault: () => void;
  
  // Enhanced Phase 2 features
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
  
  // Compatibility with old ThemeProvider interface
  /** @deprecated Use switchTheme instead */
  setTheme: (themeId: string) => void;
  /** Current theme name (light/dark/auto) */
  theme: 'light' | 'dark' | 'auto';
  /** Resolved theme (light/dark) */
  resolvedTheme: 'light' | 'dark';
  /** Toggle between light/dark */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'meh-trics-theme-settings';

// Helper function to create color tokens from CSS custom properties
function createColorTokens(cssTokens: Record<string, string>): Record<string, ColorToken> {
  const tokens: Record<string, ColorToken> = {};
  
  Object.entries(cssTokens).forEach(([variable, value]) => {
    const name = variable.replace('--color-', '').replace(/-/g, ' ');
    const category = variable.includes('background') ? 'background' :
                    variable.includes('text') ? 'text' :
                    variable.includes('border') ? 'border' :
                    variable.includes('interactive') ? 'interactive' :
                    variable.includes('semantic') ? 'semantic' :
                    variable.includes('compassionate') ? 'compassionate' : 'primary';
    
    tokens[variable] = {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      variable,
      value,
      description: `${name} color token`,
      category: category as ColorToken['category']
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
    id: 'default-light',
    name: 'Default Light',
    isDark: false,
    isBuiltIn: true,
    colors: defaultLightColors,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'default-dark',
    name: 'Default Dark',
    isDark: true,
    isBuiltIn: true,
    colors: defaultDarkColors,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    }
    
    return {
      mode: 'auto',
      activeThemeId: 'default-light',
      respectSystemPreference: true,
      customThemes: [],
      animations: true,
      reducedMotion: false
    };
  });
  const [themes, setThemes] = useState<ThemeConfig[]>(() => {
    return [...defaultThemes, ...(settings.customThemes || [])];
  });

  const currentTheme = themes.find(t => t.id === settings.activeThemeId) || defaultThemes[0];

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save theme settings:', error);
    }
  }, [settings]);
  // Apply CSS custom properties when theme changes
  useEffect(() => {
    if (currentTheme?.colors) {
      Object.values(currentTheme.colors).forEach(token => {
        document.documentElement.style.setProperty(token.variable, token.value);
      });
    }
  }, [currentTheme]);

  // Handle system preference changes
  useEffect(() => {
    if (settings.respectSystemPreference && settings.mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        const prefersDark = mediaQuery.matches;
        const themeId = prefersDark ? 'default-dark' : 'default-light';
        if (themes.find(t => t.id === themeId)) {
          setSettings(prev => ({ ...prev, activeThemeId: themeId }));
        }
      };

      handleChange();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.respectSystemPreference, settings.mode, themes]);

  const switchTheme = useCallback((themeId: string) => {
    setSettings(prev => ({ ...prev, activeThemeId: themeId }));
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setSettings(prev => ({ ...prev, mode }));
  }, []);

  const createTheme = useCallback((name: string, baseThemeId?: string) => {
    const baseTheme = baseThemeId ? themes.find(t => t.id === baseThemeId) : currentTheme;
    const newTheme: ThemeConfig = {
      id: `custom-${Date.now()}`,
      name,
      isDark: baseTheme?.isDark || false,
      isBuiltIn: false,
      colors: baseTheme ? { ...baseTheme.colors } : { ...defaultLightColors },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setThemes(prev => [...prev, newTheme]);
    setSettings(prev => ({
      ...prev,
      customThemes: [...prev.customThemes, newTheme],
      activeThemeId: newTheme.id
    }));

    return newTheme;
  }, [themes, currentTheme]);

  const updateTheme = useCallback((themeId: string, updates: Partial<ThemeConfig>) => {
    setThemes(prev => prev.map(theme => 
      theme.id === themeId 
        ? { ...theme, ...updates, updatedAt: new Date() }
        : theme
    ));

    if (!themes.find(t => t.id === themeId)?.isBuiltIn) {
      setSettings(prev => ({
        ...prev,
        customThemes: prev.customThemes.map(theme =>
          theme.id === themeId
            ? { ...theme, ...updates, updatedAt: new Date() }
            : theme
        )
      }));
    }
  }, [themes]);

  const updateColorToken = useCallback((themeId: string, tokenName: string, value: string) => {
    updateTheme(themeId, {
      colors: {
        ...themes.find(t => t.id === themeId)?.colors,
        [tokenName]: {
          ...themes.find(t => t.id === themeId)?.colors[tokenName],
          value
        }
      }
    });
  }, [themes, updateTheme]);

  const deleteTheme = useCallback((themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme?.isBuiltIn) return;

    setThemes(prev => prev.filter(t => t.id !== themeId));
    setSettings(prev => ({
      ...prev,
      customThemes: prev.customThemes.filter(t => t.id !== themeId),
      activeThemeId: prev.activeThemeId === themeId ? 'default-light' : prev.activeThemeId
    }));
  }, [themes]);

  const exportTheme = useCallback((themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) throw new Error('Theme not found');
    
    return JSON.stringify({
      name: theme.name,
      isDark: theme.isDark,
      colors: theme.colors,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }, [themes]);

  const importTheme = useCallback((themeData: string) => {
    try {
      const parsed = JSON.parse(themeData);
      const newTheme: ThemeConfig = {
        id: `imported-${Date.now()}`,
        name: parsed.name || 'Imported Theme',
        isDark: parsed.isDark || false,
        isBuiltIn: false,
        colors: parsed.colors || {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setThemes(prev => [...prev, newTheme]);
      setSettings(prev => ({
        ...prev,
        customThemes: [...prev.customThemes, newTheme]
      }));

      return newTheme;
    } catch (error) {
      throw new Error('Invalid theme data');
    }
  }, []);

  const resetToDefault = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      activeThemeId: 'default-light',
      mode: 'auto'
    }));
  }, []);

  // Enhanced Phase 2 functionality
  const setTransitionsEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, animations: enabled }));
    document.documentElement.style.setProperty('--theme-transition-enabled', enabled ? '1' : '0');
  }, []);

  const switchThemeWithTransition = useCallback(async (themeId: string, duration = 300): Promise<void> => {
    return new Promise((resolve) => {
      // Add transition class
      document.documentElement.classList.add('theme-transitioning');
      document.documentElement.style.setProperty('--theme-transition-duration', `${duration}ms`);
      
      // Switch theme
      switchTheme(themeId);
      
      // Remove transition class after animation
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
        resolve();
      }, duration);
    });
  }, [switchTheme]);

  const validateTheme = useCallback((theme: Partial<ThemeConfig>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!theme.name || theme.name.trim().length === 0) {
      errors.push('Theme name is required');
    }
    
    if (!theme.colors || Object.keys(theme.colors).length === 0) {
      errors.push('Theme must have at least one color defined');
    }
    
    // Validate color values
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, token]) => {
        if (!token.value || !isValidColor(token.value)) {
          errors.push(`Invalid color value for ${key}: ${token.value}`);
        }
      });
    }
    
    return { isValid: errors.length === 0, errors };
  }, []);

  const generateHighContrastTheme = useCallback((): ThemeConfig => {
    if (!currentTheme) throw new Error('No current theme to enhance');
    
    const highContrastColors = { ...currentTheme.colors };
    
    // Enhance contrast for text colors
    Object.keys(highContrastColors).forEach(key => {
      if (key.includes('text') || key.includes('foreground')) {
        highContrastColors[key] = {
          ...highContrastColors[key],
          value: currentTheme.isDark ? '#ffffff' : '#000000'
        };
      }
    });
    
    return {
      ...currentTheme,
      id: `${currentTheme.id}-high-contrast`,
      name: `${currentTheme.name} (High Contrast)`,
      colors: highContrastColors,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }, [currentTheme]);

  const checkAccessibility = useCallback((): { passed: boolean; issues: string[] } => {
    if (!currentTheme) return { passed: false, issues: ['No theme selected'] };
    
    const issues: string[] = [];
    
    // Check contrast ratios
    const bgColor = currentTheme.colors['color-background-primary']?.value;
    const textColor = currentTheme.colors['color-text-primary']?.value;
    
    if (bgColor && textColor) {
      const contrastRatio = calculateContrastRatio(bgColor, textColor);
      if (contrastRatio < 4.5) {
        issues.push(`Low contrast ratio: ${contrastRatio.toFixed(2)} (minimum 4.5)`);
      }
    }
    
    return { passed: issues.length === 0, issues };
  }, [currentTheme]);
  const getCSSProperties = useCallback((): Record<string, string> => {
    if (!currentTheme?.colors) return {};
    
    const properties: Record<string, string> = {};
    Object.values(currentTheme.colors).forEach(token => {
      properties[token.variable] = token.value;
    });
    return properties;
  }, [currentTheme]);

  const mergeThemes = useCallback((baseThemeId: string, overrideThemeId: string): ThemeConfig => {
    const baseTheme = themes.find(t => t.id === baseThemeId);
    const overrideTheme = themes.find(t => t.id === overrideThemeId);
    
    if (!baseTheme) throw new Error(`Base theme not found: ${baseThemeId}`);
    if (!overrideTheme) throw new Error(`Override theme not found: ${overrideThemeId}`);
    
    return {
      ...baseTheme,
      id: `merged-${Date.now()}`,
      name: `${baseTheme.name} + ${overrideTheme.name}`,
      colors: { ...baseTheme.colors, ...overrideTheme.colors },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }, [themes]);
  const createPreset = useCallback((name: string) => {
    if (!currentTheme?.colors) return;
    
    const preset = {
      name,
      description: `Preset based on ${currentTheme.name}`,
      colors: Object.fromEntries(
        Object.entries(currentTheme.colors).map(([key, token]) => [key, token.value])
      )
    };
    
    // Save preset to localStorage
    const savedPresets = JSON.parse(localStorage.getItem('theme-presets') || '[]');
    savedPresets.push(preset);
    localStorage.setItem('theme-presets', JSON.stringify(savedPresets));
  }, [currentTheme]);

  const applyPreset = useCallback((presetName: string) => {
    const savedPresets = JSON.parse(localStorage.getItem('theme-presets') || '[]');
    const preset = savedPresets.find((p: any) => p.name === presetName);
    
    if (!preset || !currentTheme) return;
    
    const updatedColors = { ...currentTheme.colors };
    Object.entries(preset.colors).forEach(([key, value]) => {
      if (updatedColors[key]) {
        updatedColors[key] = { ...updatedColors[key], value: value as string };
      }
    });
    
    updateTheme(currentTheme.id, { colors: updatedColors });
  }, [currentTheme, updateTheme]);

  const getThemeInheritance = useCallback((themeId: string): string[] => {
    // For now, return simple inheritance chain
    // In the future, this could support complex inheritance hierarchies
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return [];
    
    if (theme.isBuiltIn) return [themeId];
    return ['default-light', themeId];
  }, [themes]);

  const value: ThemeContextValue = {
    settings,
    themes,
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
    
    // Compatibility methods
    setTheme: switchTheme,
    theme: currentTheme?.isDark ? 'dark' : 'light',
    resolvedTheme: currentTheme?.isDark ? 'dark' : 'light',
    toggleTheme: () => {
      const newThemeId = currentTheme?.isDark ? 'default-light' : 'default-dark';
      switchTheme(newThemeId);
    }
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Utility functions
function isValidColor(color: string): boolean {
  // Check if it's a valid hex color
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return true;
  }
  
  // Check if it's a valid rgb/rgba color
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/.test(color)) {
    return true;
  }
  
  // Check if it's a valid hsl/hsla color
  if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)?\s*\)$/.test(color)) {
    return true;
  }
  
  // Check if it's a named color (basic check)
  const namedColors = ['transparent', 'currentColor', 'inherit', 'initial', 'unset'];
  return namedColors.includes(color.toLowerCase());
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}