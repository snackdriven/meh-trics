/**
 * Theme Context Provider
 * 
 * Provides theme management functionality throughout the application.
 * Handles theme switching, persistence, and real-time updates.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ThemeConfig, ThemeSettings, ThemeMode, ColorToken } from '../types/theme';

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
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'meh-trics-theme-settings';

// Default color tokens based on current design system
const defaultLightColors: Record<string, ColorToken> = {
  'color-primary': {
    name: 'Primary',
    variable: '--color-primary',
    value: '#9333ea',
    description: 'Main brand color for primary actions',
    category: 'primary'
  },
  'color-primary-hover': {
    name: 'Primary Hover',
    variable: '--color-primary-hover',
    value: '#7c3aed',
    description: 'Primary color on hover',
    category: 'primary'
  },
  'color-background-primary': {
    name: 'Background Primary',
    variable: '--color-background-primary',
    value: '#ffffff',
    description: 'Main background color',
    category: 'background'
  },
  'color-background-secondary': {
    name: 'Background Secondary',
    variable: '--color-background-secondary',
    value: '#f8fafc',
    description: 'Secondary background color',
    category: 'background'
  },
  'color-text-primary': {
    name: 'Text Primary',
    variable: '--color-text-primary',
    value: '#1e293b',
    description: 'Primary text color',
    category: 'text'
  },
  'color-compassionate-celebration': {
    name: 'Compassionate Celebration',
    variable: '--color-compassionate-celebration',
    value: '#9333ea',
    description: 'Celebration and achievement color',
    category: 'compassionate'
  },
  'color-semantic-success-bg': {
    name: 'Success Background',
    variable: '--color-semantic-success-bg',
    value: '#dcfce7',
    description: 'Success state background',
    category: 'semantic'
  },
  'color-semantic-error-bg': {
    name: 'Error Background',
    variable: '--color-semantic-error-bg',
    value: '#fef2f2',
    description: 'Error state background',
    category: 'semantic'
  }
};

const defaultDarkColors: Record<string, ColorToken> = {
  ...defaultLightColors,
  'color-background-primary': {
    ...defaultLightColors['color-background-primary'],
    value: '#0f172a'
  },
  'color-background-secondary': {
    ...defaultLightColors['color-background-secondary'],
    value: '#1e293b'
  },
  'color-text-primary': {
    ...defaultLightColors['color-text-primary'],
    value: '#f1f5f9'
  }
};

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
    return [...defaultThemes, ...settings.customThemes];
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
    if (currentTheme) {
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
    resetToDefault
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