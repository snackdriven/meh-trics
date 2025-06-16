/**
 * Theme Customizer Component
 *
 * Main interface for customizing application themes.
 * Provides color picking, theme management, and live preview.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Download,
  Eye,
  EyeOff,
  Moon,
  Palette,
  Plus,
  RotateCcw,
  Sun,
  Trash2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../hooks/useToast";
import type { ColorCategory, ThemeConfig } from "../types/theme";
import { ColorPicker } from "./ColorPicker";
import { ThemePreview } from "./ThemePreview";

export function ThemeCustomizer() {
  const {
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
  } = useTheme();

  const { showSuccess, showError } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");
  const [importData, setImportData] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeConfig | null>(null);

  // Organize colors by category
  const colorCategories: ColorCategory[] = [
    {
      name: "Primary Colors",
      description: "Main brand and interactive colors",
      icon: "🎨",
      tokens: Object.values(currentTheme?.colors || {}).filter(
        (token) => token.category === "primary"
      ),
    },
    {
      name: "Background Colors",
      description: "Page and component backgrounds",
      icon: "🏠",
      tokens: Object.values(currentTheme?.colors || {}).filter(
        (token) => token.category === "background"
      ),
    },
    {
      name: "Text Colors",
      description: "Typography and content colors",
      icon: "📝",
      tokens: Object.values(currentTheme?.colors || {}).filter(
        (token) => token.category === "text"
      ),
    },
    {
      name: "Semantic Colors",
      description: "Status and feedback colors",
      icon: "🚦",
      tokens: Object.values(currentTheme?.colors || {}).filter(
        (token) => token.category === "semantic"
      ),
    },
    {
      name: "Compassionate Colors",
      description: "Emotional and wellbeing colors",
      icon: "💜",
      tokens: Object.values(currentTheme?.colors || {}).filter(
        (token) => token.category === "compassionate"
      ),
    },
  ].filter((category) => category.tokens.length > 0);

  const handleCreateTheme = () => {
    if (!newThemeName.trim()) {
      showError("Please enter a theme name", "Invalid Input");
      return;
    }

    try {
      const theme = createTheme(newThemeName.trim(), currentTheme?.id);
      setEditingTheme(theme);
      setNewThemeName("");
      showSuccess(`Theme "${theme.name}" created successfully!`);
    } catch (error) {
      showError("Failed to create theme", "Creation Error");
    }
  };

  const handleExportTheme = () => {
    if (!currentTheme) return;

    try {
      const data = exportTheme(currentTheme.id);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentTheme.name.toLowerCase().replace(/\s+/g, "-")}-theme.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess("Theme exported successfully!");
    } catch (error) {
      showError("Failed to export theme", "Export Error");
    }
  };

  const handleImportTheme = () => {
    if (!importData.trim()) {
      showError("Please paste theme data", "Invalid Input");
      return;
    }

    try {
      const theme = importTheme(importData);
      setImportData("");
      showSuccess(`Theme "${theme.name}" imported successfully!`);
    } catch (error) {
      showError("Invalid theme data", "Import Error");
    }
  };

  const handleDeleteTheme = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (theme?.isBuiltIn) return;

    if (confirm(`Are you sure you want to delete "${theme?.name}"?`)) {
      deleteTheme(themeId);
      showSuccess("Theme deleted successfully!");
    }
  };

  const handleColorChange = (tokenName: string, value: string) => {
    if (editingTheme) {
      updateColorToken(editingTheme.id, tokenName, value);
    } else if (currentTheme && !currentTheme.isBuiltIn) {
      updateColorToken(currentTheme.id, tokenName, value);
    } else {
      // Create a copy of the current theme for editing
      const newTheme = createTheme(`${currentTheme?.name} (Custom)`, currentTheme?.id);
      setEditingTheme(newTheme);
      updateColorToken(newTheme.id, tokenName, value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Customize Theme">
          <Palette className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Customizer
          </DialogTitle>
          <DialogDescription>
            Customize colors and appearance to match your personal style.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="themes" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="themes">Themes</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          </TabsList>

          <div className="max-h-[60vh] overflow-y-auto">
            <TabsContent value="themes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Theme Selection</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={settings.mode === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setThemeMode("light")}
                    >
                      <Sun className="h-4 w-4 mr-1" />
                      Light
                    </Button>
                    <Button
                      variant={settings.mode === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setThemeMode("dark")}
                    >
                      <Moon className="h-4 w-4 mr-1" />
                      Dark
                    </Button>
                    <Button
                      variant={settings.mode === "auto" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setThemeMode("auto")}
                    >
                      Auto
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {themes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        currentTheme?.id === theme.id
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                          : "border-[var(--color-border-primary)]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {" "}
                          {Object.values(theme.colors || {})
                            .slice(0, 3)
                            .map((token, i) => (
                              <div
                                key={i}
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: token.value }}
                              />
                            ))}
                        </div>
                        <div>
                          <div className="font-medium">{theme.name}</div>
                          <div className="text-sm text-[var(--color-text-secondary)]">
                            {theme.isDark ? "Dark" : "Light"} theme
                            {theme.isBuiltIn && " • Built-in"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={currentTheme?.id === theme.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => switchTheme(theme.id)}
                        >
                          {currentTheme?.id === theme.id ? "Active" : "Select"}
                        </Button>
                        {!theme.isBuiltIn && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTheme(theme.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create New Theme</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Theme name..."
                      value={newThemeName}
                      onChange={(e) => setNewThemeName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateTheme()}
                    />
                    <Button onClick={handleCreateTheme}>
                      <Plus className="h-4 w-4 mr-1" />
                      Create
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Color Customization</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Editing: {editingTheme?.name || currentTheme?.name}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={resetToDefault}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>

              {colorCategories.map((category) => (
                <Card key={category.name}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.name}
                    </CardTitle>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {category.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {category.tokens.map((token) => (
                      <div key={token.variable} className="flex items-center gap-3">
                        <ColorPicker
                          value={token.value}
                          onChange={(value) =>
                            handleColorChange(token.variable.replace("--", ""), value)
                          }
                        />
                        <div className="flex-1">
                          <div className="font-medium">{token.name}</div>
                          <div className="text-sm text-[var(--color-text-secondary)]">
                            {token.description}
                          </div>
                          <div className="text-xs font-mono text-[var(--color-text-tertiary)]">
                            {token.variable}
                          </div>
                        </div>
                        <div className="text-sm font-mono bg-[var(--color-background-secondary)] px-2 py-1 rounded">
                          {token.value}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Theme Preview</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    See how your theme looks across different components
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
                  {previewMode ? (
                    <EyeOff className="h-4 w-4 mr-1" />
                  ) : (
                    <Eye className="h-4 w-4 mr-1" />
                  )}
                  {previewMode ? "Exit Preview" : "Preview Mode"}
                </Button>
              </div>

              <ThemePreview theme={editingTheme || currentTheme} />
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
                    Export your current theme to share or backup.
                  </p>
                  <Button onClick={handleExportTheme}>
                    <Download className="h-4 w-4 mr-1" />
                    Export Current Theme
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
                    Paste theme JSON data to import a custom theme.
                  </p>
                  <Textarea
                    placeholder="Paste theme JSON data here..."
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={4}
                  />
                  <Button onClick={handleImportTheme} disabled={!importData.trim()}>
                    <Upload className="h-4 w-4 mr-1" />
                    Import Theme
                  </Button>
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
