/**
 * Simple Theme Customizer
 *
 * Quick access to basic theme customization using the new Phase 2 theme system.
 * Provides a simplified interface for common theme operations.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Palette, Settings, Sparkles } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import { useTheme } from "@/theme";
import { ThemeToggle } from "./ui/theme-toggle";

export function SimpleThemeCustomizer() {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();
  const {
    currentTheme,
    availableThemes,
    switchTheme,
    switchThemeWithTransition,
    checkAccessibility,
  } = useTheme();

  const handleThemeSwitch = async (themeId: string) => {
    await switchThemeWithTransition(themeId, 300);
  };

  const builtInThemes = Object.values(availableThemes).filter((theme) => theme.isBuiltIn);
  const customThemes = Object.values(availableThemes).filter((theme) => !theme.isBuiltIn);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="h-4 w-4 mr-2" />
          Theme
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Quick Theme Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Theme Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Current Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{currentTheme?.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={currentTheme?.isDark ? "secondary" : "default"}
                      className="text-xs"
                    >
                      {currentTheme?.isDark ? "Dark" : "Light"}
                    </Badge>
                    {!currentTheme?.isBuiltIn && (
                      <Badge variant="outline" className="text-xs">
                        Custom
                      </Badge>
                    )}
                  </div>
                </div>
                <ThemeToggle variant="icon" size="md" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Theme Switcher */}
          <div>
            <h4 className="text-sm font-medium mb-3">Built-in Themes</h4>
            <div className="grid grid-cols-2 gap-2">
              {builtInThemes.map((theme) => (
                <Button
                  key={theme.id}
                  variant={currentTheme?.id === theme.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleThemeSwitch(theme.id)}
                  className="h-auto p-3 flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-8 h-5 rounded border ${
                      theme.isDark ? "bg-slate-800 border-slate-600" : "bg-white border-slate-300"
                    }`}
                  />
                  <span className="text-xs">{theme.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Themes */}
          {customThemes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Custom Themes</h4>
              <div className="space-y-2">
                {customThemes.map((theme) => (
                  <Button
                    key={theme.id}
                    variant={currentTheme?.id === theme.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleThemeSwitch(theme.id)}
                    className="w-full justify-start"
                  >
                    <div
                      className={`w-4 h-4 rounded-full mr-2 ${
                        theme.isDark ? "bg-slate-700" : "bg-slate-200"
                      }`}
                    />
                    {theme.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const result = checkAccessibility();
                showToast(
                  result.passed
                    ? "Current theme passes accessibility checks!"
                    : `Accessibility issues found: ${result.issues.join(", ")}`,
                  result.passed ? "success" : "error"
                );
              }}
              className="w-full justify-start"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Check Accessibility
            </Button>
          </div>

          {/* Advanced Settings */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">Need more options?</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen(false);
                // This could open the full customization hub
                showToast("Advanced theme settings coming soon!", "info");
              }}
              className="text-xs"
            >
              <Settings className="h-3 w-3 mr-1" />
              Advanced Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
