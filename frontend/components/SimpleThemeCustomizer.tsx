/**
 * Simple Theme Customizer
 * 
 * Works with the existing theme system by directly updating CSS custom properties.
 * Provides a user-friendly interface for customizing colors without complex state management.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Palette,
  RotateCcw,
  Upload,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "../hooks/useToast";

interface ColorConfig {
  name: string;
  variable: string;
  description: string;
  defaultLight: string;
  defaultDark: string;
  category: 'primary' | 'background' | 'text' | 'semantic' | 'border';
}

// Color configuration based on existing CSS custom properties
const colorConfigs: ColorConfig[] = [
  // Primary colors
  {
    name: "Primary",
    variable: "--color-primary",
    description: "Main brand color for buttons and links",
    defaultLight: "#9333ea",
    defaultDark: "#a855f7",
    category: "primary"
  },
  {
    name: "Primary Hover",
    variable: "--color-primary-hover", 
    description: "Primary color on hover",
    defaultLight: "#7c3aed",
    defaultDark: "#9333ea",
    category: "primary"
  },
  
  // Background colors
  {
    name: "Background Primary",
    variable: "--color-background-primary",
    description: "Main page background",
    defaultLight: "#ffffff",
    defaultDark: "#0f172a",
    category: "background"
  },
  {
    name: "Background Secondary", 
    variable: "--color-background-secondary",
    description: "Card and panel backgrounds",
    defaultLight: "#f8fafc",
    defaultDark: "#1e293b",
    category: "background"
  },
  {
    name: "Background Tertiary",
    variable: "--color-background-tertiary", 
    description: "Subtle background elements",
    defaultLight: "#f1f5f9",
    defaultDark: "#334155",
    category: "background"
  },
  
  // Text colors
  {
    name: "Text Primary",
    variable: "--color-text-primary",
    description: "Main text color",
    defaultLight: "#1e293b",
    defaultDark: "#f1f5f9", 
    category: "text"
  },
  {
    name: "Text Secondary",
    variable: "--color-text-secondary",
    description: "Secondary text and labels",
    defaultLight: "#64748b",
    defaultDark: "#94a3b8",
    category: "text"
  },
  {
    name: "Text Tertiary",
    variable: "--color-text-tertiary",
    description: "Muted text and hints",
    defaultLight: "#94a3b8",
    defaultDark: "#64748b",
    category: "text"
  },
  
  // Semantic colors
  {
    name: "Success Background",
    variable: "--color-semantic-success-bg",
    description: "Success state background",
    defaultLight: "#dcfce7",
    defaultDark: "#14532d",
    category: "semantic"
  },
  {
    name: "Error Background", 
    variable: "--color-semantic-error-bg",
    description: "Error state background",
    defaultLight: "#fef2f2",
    defaultDark: "#7f1d1d",
    category: "semantic"
  },
  
  // Border colors
  {
    name: "Border Primary",
    variable: "--color-border-primary",
    description: "Default border color",
    defaultLight: "#e2e8f0",
    defaultDark: "#475569",
    category: "border"
  },
  
  // Compassionate colors
  {
    name: "Celebration",
    variable: "--color-compassionate-celebration",
    description: "Achievement and celebration color",
    defaultLight: "#9333ea",
    defaultDark: "#a855f7", 
    category: "primary"
  }
];

const STORAGE_KEY = 'meh-trics-custom-colors';

export function SimpleThemeCustomizer() {
  const { showSuccess, showError } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [customColors, setCustomColors] = useState<Record<string, { light: string; dark: string }>>({});
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  // Load custom colors from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCustomColors(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load custom colors:', error);
    }
  }, []);

  // Detect current theme
  useEffect(() => {
    const detectTheme = () => {
      const root = document.documentElement;
      const isDark = root.classList.contains('dark') || 
                    root.getAttribute('data-theme') === 'dark';
      setCurrentTheme(isDark ? 'dark' : 'light');
    };

    detectTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    return () => observer.disconnect();
  }, []);

  // Apply custom colors to CSS
  useEffect(() => {
    Object.entries(customColors).forEach(([variable, colors]) => {
      const colorValue = colors[currentTheme];
      if (colorValue) {
        document.documentElement.style.setProperty(variable, colorValue);
      }
    });
  }, [customColors, currentTheme]);

  const updateColor = (variable: string, value: string) => {
    const newCustomColors = {
      ...customColors,
      [variable]: {
        ...customColors[variable],
        [currentTheme]: value
      }
    };
    
    setCustomColors(newCustomColors);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCustomColors));
    
    // Apply immediately
    document.documentElement.style.setProperty(variable, value);
  };

  const resetColors = () => {
    // Clear custom colors
    setCustomColors({});
    localStorage.removeItem(STORAGE_KEY);
    
    // Reset CSS variables to defaults
    colorConfigs.forEach(config => {
      const defaultValue = currentTheme === 'dark' ? config.defaultDark : config.defaultLight;
      document.documentElement.style.setProperty(config.variable, defaultValue);
    });
    
    showSuccess("Colors reset to defaults!");
  };

  const exportColors = () => {
    try {
      const exportData = {
        colors: customColors,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meh-trics-theme.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess("Theme exported successfully!");
    } catch (error) {
      showError("Failed to export theme", "Export Error");
    }
  };

  const importColors = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.colors) {
          setCustomColors(data.colors);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.colors));
          showSuccess("Theme imported successfully!");
        } else {
          showError("Invalid theme file", "Import Error");
        }
      } catch (error) {
        showError("Failed to import theme", "Import Error");
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  const getCurrentColor = (config: ColorConfig) => {
    const customColor = customColors[config.variable]?.[currentTheme];
    return customColor || (currentTheme === 'dark' ? config.defaultDark : config.defaultLight);
  };

  const groupedConfigs = colorConfigs.reduce((groups, config) => {
    if (!groups[config.category]) {
      groups[config.category] = [];
    }
    groups[config.category].push(config);
    return groups;
  }, {} as Record<string, ColorConfig[]>);

  const categoryLabels = {
    primary: "🎨 Primary Colors",
    background: "🏠 Backgrounds", 
    text: "📝 Text Colors",
    semantic: "🚦 Status Colors",
    border: "🔲 Borders"
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Customize Theme">
          <Palette className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Customize Colors
          </DialogTitle>
          <DialogDescription>
            Personalize your app colors. Changes apply to {currentTheme} mode.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          </TabsList>

          <div className="max-h-[60vh] overflow-y-auto">
            <TabsContent value="colors" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Current Mode: {currentTheme}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Switch themes to customize colors for both modes
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={resetColors}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>

              {Object.entries(groupedConfigs).map(([category, configs]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {configs.map((config) => {
                      const currentColor = getCurrentColor(config);
                      return (
                        <div key={config.variable} className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={currentColor}
                              onChange={(e) => updateColor(config.variable, e.target.value)}
                              className="w-8 h-8 rounded border cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="font-medium">{config.name}</div>
                              <div className="text-sm text-[var(--color-text-secondary)]">
                                {config.description}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-mono bg-[var(--color-background-secondary)] px-2 py-1 rounded">
                            {currentColor}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="import-export" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export Theme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                    Save your custom colors to share or backup.
                  </p>
                  <Button onClick={exportColors}>
                    <Download className="h-4 w-4 mr-1" />
                    Export Colors
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Import Theme
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Load a previously exported theme file.
                  </p>
                  <div>
                    <Label htmlFor="import-file" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-1" />
                          Choose File
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="import-file"
                      type="file"
                      accept=".json"
                      onChange={importColors}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}