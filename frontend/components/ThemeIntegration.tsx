/**
 * Theme Integration Example
 *
 * This file shows how to integrate the theme customizer into the main application.
 * Add this to your layout or navigation component.
 */

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Palette, Sun, Monitor } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { ThemeCustomizer } from "./ThemeCustomizer";

/**
 * Simple theme mode toggle button
 * Add this to your top navigation or header
 */
export function ThemeModeToggle() {
  const { settings, setThemeMode, currentTheme } = useTheme();

  const getModeIcon = () => {
    switch (settings.mode) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Theme Settings">
          {getModeIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Theme Mode</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setThemeMode("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemeMode("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemeMode("auto")}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Theme settings panel for navigation or settings page
 */
export function ThemeSettings() {
  const { currentTheme, themes, switchTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Appearance</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Customize your theme and appearance
          </p>
        </div>
        <ThemeCustomizer />
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Quick Themes</h4>
        <div className="grid grid-cols-2 gap-2">
          {themes
            .filter((t) => t.isBuiltIn)
            .map((theme) => (
              <Button
                key={theme.id}
                variant={currentTheme?.id === theme.id ? "default" : "outline"}
                size="sm"
                onClick={() => switchTheme(theme.id)}
                className="justify-start"
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {Object.values(theme.colors || {})
                      .slice(0, 2)
                      .map((token, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: token.value }}
                        />
                      ))}
                  </div>
                  {theme.name}
                </div>
              </Button>
            ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeModeToggle />
        <ThemeCustomizer />
      </div>
    </div>
  );
}

/**
 * Example of how to integrate into your App.tsx or main layout
 */
export function ExampleAppIntegration() {
  return `
// In your App.tsx or main layout file:

import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeModeToggle } from './components/ThemeIntegration';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--color-background-primary)]">
        <header className="border-b bg-[var(--color-background-secondary)]">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
              Meh-trics
            </h1>
            <div className="flex items-center gap-2">
              <ThemeModeToggle />
              {/* Other navigation items */}
            </div>
          </div>
        </header>
        
        <main className="container mx-auto p-4">
          {/* Your app content */}
        </main>
      </div>
    </ThemeProvider>
  );
}

// Or integrate into your settings page:

import { ThemeSettings } from './components/ThemeIntegration';

function SettingsPage() {
  return (
    <div className="space-y-6">
      <ThemeSettings />
      {/* Other settings */}
    </div>
  );
}
`;
}
