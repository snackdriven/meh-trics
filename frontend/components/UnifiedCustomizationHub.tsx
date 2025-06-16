import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Database,
  Download,
  Eye,
  Keyboard,
  Palette,
  RotateCcw,
  Settings,
  Type,
  Upload,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
  ProgressiveSettingsPanel,
  type SettingCategory,
  type SettingItem,
  type SettingLevel,
} from "./ProgressiveSettingsPanel";

import { CalendarCustomizationDialog } from "./CalendarCustomizationDialog";
import { CopyEditingDialog } from "./CopyEditingDialog";
import { EditTabsDialog, type TabPref } from "./EditTabsDialog";
// Import existing customization components
import { SimpleThemeCustomizer } from "./SimpleThemeCustomizer";

interface UnifiedCustomizationHubProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Tab-related props
  tabPrefs: Record<string, TabPref>;
  tabOrder: string[];
  onTabsSave: (prefs: Record<string, TabPref>, order: string[]) => void;
}

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  customizations: number;
  lastModified?: string;
}

export function UnifiedCustomizationHub({
  open,
  onOpenChange,
  tabPrefs,
  tabOrder,
  onTabsSave,
}: UnifiedCustomizationHubProps) {
  const [userLevel, setUserLevel] = useState<SettingLevel>("intermediate");
  const [activeView, setActiveView] = useState<"progressive" | "legacy">("progressive");
  const [childDialogOpen, setChildDialogOpen] = useState<string | null>(null);
  const [settingsStats, setSettingsStats] = useState<SettingsSection[]>([]);

  const {
    currentTheme,
    availableThemes,
    switchTheme,
    switchThemeWithTransition,
    setTransitionsEnabled,
    validateTheme,
    createTheme,
    updateTheme,
    checkAccessibility,
    settings: themeSettings,
  } = useTheme();

  // Load user's preferred complexity level
  useEffect(() => {
    const savedLevel = localStorage.getItem("settings-complexity-level") as SettingLevel;
    if (savedLevel && ["beginner", "intermediate", "advanced", "expert"].includes(savedLevel)) {
      setUserLevel(savedLevel);
    }
  }, []);

  // Save user's complexity level preference
  const handleUserLevelChange = (level: SettingLevel) => {
    setUserLevel(level);
    localStorage.setItem("settings-complexity-level", level);
  };

  // Progressive settings configuration
  const settingsCategories = useMemo<SettingCategory[]>(
    () => [
      {
        id: "theme",
        name: "Theme & Appearance",
        description: "Customize colors, fonts, and visual styling",
        icon: <Palette className="h-4 w-4" />,
        level: "beginner",
        priority: 1,
        items: [
          {
            id: "active-theme",
            name: "Active Theme",
            description: "Choose your preferred color scheme",
            level: "beginner",
            type: "select",
            value: currentTheme?.id || "default-light",
            options: Object.values(availableThemes).map((theme) => ({
              value: theme.id,
              label: theme.name,
              description: theme.isDark ? "Dark theme" : "Light theme",
            })),
            category: "theme",
            tags: ["color", "appearance"],
            onChange: (themeId: string) => switchTheme(themeId),
          },
          {
            id: "smooth-transitions",
            name: "Smooth Transitions",
            description: "Enable animated theme transitions",
            level: "intermediate",
            type: "boolean",
            value: themeSettings.animations,
            category: "theme",
            tags: ["animation", "performance"],
            helpText:
              "Smooth transitions make theme changes more visually appealing but may impact performance on slower devices.",
            onChange: (enabled: boolean) => setTransitionsEnabled(enabled),
          },
          {
            id: "accessibility-check",
            name: "Accessibility Validation",
            description: "Check current theme for accessibility compliance",
            level: "advanced",
            type: "component",
            value: null,
            category: "theme",
            tags: ["accessibility", "validation"],
            helpText: "Validates color contrast ratios and other accessibility requirements.",
            component: ({ onChange }) => {
              const handleCheck = () => {
                const result = checkAccessibility();
                onChange(result);
              };
              return (
                <Button onClick={handleCheck} size="sm" variant="outline">
                  Check Accessibility
                </Button>
              );
            },
            onChange: (result: any) => {
              if (result?.issues?.length > 0) {
                console.warn("Accessibility issues found:", result.issues);
              }
            },
          },
        ],
      },

      {
        id: "calendar",
        name: "Calendar Settings",
        description: "Configure calendar display and behavior",
        icon: <Calendar className="h-4 w-4" />,
        level: "beginner",
        priority: 2,
        items: [
          {
            id: "calendar-customization",
            name: "Calendar Display",
            description: "Customize calendar views and formatting",
            level: "beginner",
            type: "component",
            value: null,
            category: "calendar",
            tags: ["calendar", "display"],
            component: ({ onChange }) => (
              <Button
                onClick={() => setChildDialogOpen("calendar-customization")}
                size="sm"
                variant="outline"
              >
                Open Calendar Settings
              </Button>
            ),
            onChange: () => {},
          },
        ],
      },

      {
        id: "content",
        name: "Content & Copy",
        description: "Edit text, labels, and content throughout the app",
        icon: <Type className="h-4 w-4" />,
        level: "intermediate",
        priority: 3,
        items: [
          {
            id: "copy-editing",
            name: "Text Customization",
            description: "Edit app text, mood options, and labels",
            level: "intermediate",
            type: "component",
            value: null,
            category: "content",
            tags: ["text", "labels", "moods"],
            component: ({ onChange }) => (
              <Button
                onClick={() => setChildDialogOpen("copy-editing")}
                size="sm"
                variant="outline"
              >
                Edit Content
              </Button>
            ),
            onChange: () => {},
          },
        ],
      },

      {
        id: "navigation",
        name: "Navigation & Tabs",
        description: "Customize tab order, visibility, and labels",
        icon: <Eye className="h-4 w-4" />,
        level: "intermediate",
        priority: 4,
        items: [
          {
            id: "tab-customization",
            name: "Tab Configuration",
            description: "Reorder tabs and change their visibility",
            level: "intermediate",
            type: "component",
            value: null,
            category: "navigation",
            tags: ["tabs", "navigation"],
            component: ({ onChange }) => (
              <Button onClick={() => setChildDialogOpen("edit-tabs")} size="sm" variant="outline">
                Edit Tabs
              </Button>
            ),
            onChange: () => {},
          },
        ],
      },

      {
        id: "advanced",
        name: "Advanced Settings",
        description: "Expert-level configuration options",
        icon: <Settings className="h-4 w-4" />,
        level: "advanced",
        priority: 5,
        items: [
          {
            id: "theme-validation",
            name: "Theme Validation",
            description: "Validate custom theme configurations",
            level: "advanced",
            type: "boolean",
            value: true,
            category: "advanced",
            tags: ["validation", "themes"],
            warningText:
              "Disabling theme validation may cause visual issues with invalid color values.",
            onChange: (enabled: boolean) => {
              localStorage.setItem("theme-validation-enabled", enabled.toString());
            },
          },
          {
            id: "debug-mode",
            name: "Debug Information",
            description: "Show debug information for troubleshooting",
            level: "expert",
            type: "boolean",
            value: false,
            category: "advanced",
            tags: ["debug", "troubleshooting"],
            helpText: "Displays technical information helpful for debugging issues.",
            warningText: "Debug mode may impact performance and is intended for developers.",
            onChange: (enabled: boolean) => {
              document.documentElement.classList.toggle("debug-mode", enabled);
            },
          },
        ],
      },

      {
        id: "data",
        name: "Data Management",
        description: "Import, export, and backup your settings",
        icon: <Database className="h-4 w-4" />,
        level: "intermediate",
        priority: 6,
        items: [
          {
            id: "export-settings",
            name: "Export All Settings",
            description: "Download all your customizations as a backup",
            level: "intermediate",
            type: "component",
            value: null,
            category: "data",
            tags: ["export", "backup"],
            component: ({ onChange }) => (
              <Button onClick={exportAllSettings} size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Settings
              </Button>
            ),
            onChange: () => {},
          },
          {
            id: "import-settings",
            name: "Import Settings",
            description: "Restore settings from a backup file",
            level: "intermediate",
            type: "component",
            value: null,
            category: "data",
            tags: ["import", "restore"],
            component: ({ onChange }) => (
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="settings-import" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Settings
                </label>
              </Button>
            ),
            onChange: () => {},
          },
          {
            id: "reset-all",
            name: "Reset Everything",
            description: "Reset all customizations to default values",
            level: "advanced",
            type: "component",
            value: null,
            category: "data",
            tags: ["reset", "default"],
            warningText: "This action cannot be undone. All your customizations will be lost.",
            component: ({ onChange }) => (
              <Button onClick={resetAllSettings} size="sm" variant="destructive">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All
              </Button>
            ),
            onChange: () => {},
          },
        ],
      },
    ],
    [
      currentTheme,
      availableThemes,
      themeSettings,
      switchTheme,
      setTransitionsEnabled,
      checkAccessibility,
    ]
  );

  // Load customization statistics for legacy view
  useEffect(() => {
    if (open) {
      loadSettingsStats();
    }
  }, [open]);

  const loadSettingsStats = () => {
    const stats: SettingsSection[] = [
      {
        id: "appearance",
        title: "Appearance & Theme",
        description: "Colors, layout, and visual preferences",
        icon: <Palette className="h-5 w-5" />,
        customizations: getAppearanceCustomizations(),
        lastModified: localStorage.getItem("theme-last-modified"),
      },
      {
        id: "content",
        title: "Content & Copy",
        description: "Text, moods, tags, and labels",
        icon: <Type className="h-5 w-5" />,
        customizations: getContentCustomizations(),
        lastModified: localStorage.getItem("copy-editing-last-modified"),
      },
      {
        id: "calendar",
        title: "Calendar Settings",
        description: "Views, formats, and display options",
        icon: <Calendar className="h-5 w-5" />,
        customizations: getCalendarCustomizations(),
        lastModified: localStorage.getItem("calendar-customization-last-modified"),
      },
      {
        id: "behavior",
        title: "Behavior & Interaction",
        description: "Shortcuts, notifications, and workflows",
        icon: <Keyboard className="h-5 w-5" />,
        customizations: getBehaviorCustomizations(),
        lastModified: localStorage.getItem("behavior-last-modified"),
      },
      {
        id: "navigation",
        title: "Tabs & Navigation",
        description: "Tab order, visibility, and labels",
        icon: <Eye className="h-5 w-5" />,
        customizations: getNavigationCustomizations(),
        lastModified: localStorage.getItem("tabs-last-modified"),
      },
      {
        id: "data",
        title: "Data & Export",
        description: "Backup, export, and data management",
        icon: <Database className="h-5 w-5" />,
        customizations: 0, // Always 0 as these are actions, not customizations
      },
    ];
    setSettingsStats(stats);
  };

  // Helper functions to count customizations
  const getAppearanceCustomizations = (): number => {
    const theme = localStorage.getItem("theme-preferences");
    const advanced = localStorage.getItem("advanced-theme-settings");
    return (theme ? 1 : 0) + (advanced ? 1 : 0);
  };

  const getContentCustomizations = (): number => {
    const copyData = localStorage.getItem("copy-editing-data");
    if (!copyData) return 0;

    try {
      const parsed = JSON.parse(copyData);
      let count = 0;
      if (parsed.moodOptions) count++;
      if (parsed.tags && parsed.tags.length > 0) count++;
      if (parsed.uiText) count++;
      return count;
    } catch {
      return 0;
    }
  };

  const getCalendarCustomizations = (): number => {
    const calendarSettings = localStorage.getItem("calendar-customization");
    return calendarSettings ? 1 : 0;
  };

  const getBehaviorCustomizations = (): number => {
    const shortcuts = localStorage.getItem("keyboard-shortcuts");
    const notifications = localStorage.getItem("notification-settings");
    return (shortcuts ? 1 : 0) + (notifications ? 1 : 0);
  };

  const getNavigationCustomizations = (): number => {
    const hasCustomTabs = Object.keys(tabPrefs).some(
      (key) => tabPrefs[key].hidden || tabPrefs[key].label !== key
    );
    const isReordered = JSON.stringify(tabOrder) !== JSON.stringify(Object.keys(tabPrefs).sort());
    return (hasCustomTabs ? 1 : 0) + (isReordered ? 1 : 0);
  };

  const getTotalCustomizations = (): number => {
    return settingsStats.reduce((total, section) => total + section.customizations, 0);
  };

  const exportAllSettings = () => {
    const allSettings = {
      appearance: {
        theme: localStorage.getItem("theme-preferences"),
        advanced: localStorage.getItem("advanced-theme-settings"),
      },
      content: localStorage.getItem("copy-editing-data"),
      calendar: localStorage.getItem("calendar-customization"),
      behavior: {
        shortcuts: localStorage.getItem("keyboard-shortcuts"),
        notifications: localStorage.getItem("notification-settings"),
      },
      navigation: {
        tabPrefs,
        tabOrder,
      },
      exportDate: new Date().toISOString(),
      version: "1.0.0",
    };

    const blob = new Blob([JSON.stringify(allSettings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `meh-trics-settings-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);

        // Import each section
        if (settings.appearance) {
          if (settings.appearance.theme) {
            localStorage.setItem("theme-preferences", settings.appearance.theme);
          }
          if (settings.appearance.advanced) {
            localStorage.setItem("advanced-theme-settings", settings.appearance.advanced);
          }
        }

        if (settings.content) {
          localStorage.setItem("copy-editing-data", settings.content);
        }

        if (settings.calendar) {
          localStorage.setItem("calendar-customization", settings.calendar);
        }

        if (settings.behavior) {
          if (settings.behavior.shortcuts) {
            localStorage.setItem("keyboard-shortcuts", settings.behavior.shortcuts);
          }
          if (settings.behavior.notifications) {
            localStorage.setItem("notification-settings", settings.behavior.notifications);
          }
        }

        if (settings.navigation) {
          onTabsSave(settings.navigation.tabPrefs, settings.navigation.tabOrder);
        }

        // Refresh stats and UI
        loadSettingsStats();
        window.location.reload(); // Reload to apply all changes
      } catch (error) {
        console.error("Failed to import settings:", error);
        alert("Failed to import settings. Please check the file format.");
      }
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset input
  };

  const resetAllSettings = () => {
    if (confirm("Are you sure you want to reset all customizations? This cannot be undone.")) {
      // Clear all customization data
      const keysToRemove = [
        "theme-preferences",
        "advanced-theme-settings",
        "copy-editing-data",
        "calendar-customization",
        "keyboard-shortcuts",
        "notification-settings",
      ];

      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // Reset tabs to defaults (would need default values)
      // onTabsSave(defaultTabPrefs, defaultTabOrder);

      loadSettingsStats();
      window.location.reload();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Customization Hub
              <Badge variant="secondary" className="ml-2">
                {userLevel} mode
              </Badge>
              {getTotalCustomizations() > 0 && (
                <Badge variant="outline" className="ml-2">
                  {getTotalCustomizations()} customizations
                </Badge>
              )}
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant={activeView === "progressive" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("progressive")}
              >
                <Zap className="h-4 w-4 mr-2" />
                Smart Mode
              </Button>
              <Button
                variant={activeView === "legacy" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("legacy")}
              >
                <Eye className="h-4 w-4 mr-2" />
                Classic View
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeView === "progressive" ? (
            <ProgressiveSettingsPanel
              categories={settingsCategories}
              userLevel={userLevel}
              onUserLevelChange={handleUserLevelChange}
              showExpertMode={userLevel === "expert"}
              enableSearch={true}
              enableFiltering={true}
              className="h-full"
            />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full">
              {/* Legacy Sidebar Navigation */}
              <TabsList className="flex flex-col h-full w-64 bg-muted/50 p-2 space-y-1">
                <TabsTrigger value="overview" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>

                <Separator className="my-2" />

                {settingsStats.map((section) => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center">
                      {section.icon}
                      <span className="ml-2">{section.title}</span>
                    </div>
                    {section.customizations > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {section.customizations}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Legacy Content Area */}
              <div className="flex-1 overflow-y-auto p-6">
                <TabsContent value="overview" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Customization Overview</h2>
                      <p className="text-muted-foreground">
                        Manage all your app customizations from one central location.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {settingsStats.map((section) => (
                        <Card
                          key={section.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setActiveTab(section.id)}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {section.icon}
                                {section.title}
                              </div>
                              {section.customizations > 0 && (
                                <Badge variant="secondary">{section.customizations}</Badge>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-3">
                              {section.description}
                            </p>
                            {section.lastModified && (
                              <p className="text-xs text-muted-foreground">
                                Last modified: {new Date(section.lastModified).toLocaleDateString()}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5" />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Button variant="outline" onClick={exportAllSettings}>
                            <Download className="h-4 w-4 mr-2" />
                            Export Settings
                          </Button>
                          <Button variant="outline" asChild>
                            <label htmlFor="quick-import" className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              Import Settings
                            </label>
                          </Button>
                          <input
                            id="quick-import"
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={importSettings}
                          />
                          <Button variant="outline" onClick={resetAllSettings}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset Everything
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="appearance" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Appearance & Theme</h2>
                      <p className="text-muted-foreground">
                        Customize colors, layout, and visual preferences.
                      </p>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Theme Settings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <SimpleThemeCustomizer />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Content & Copy</h2>
                      <p className="text-muted-foreground">
                        Edit text, moods, tags, and labels throughout the app.
                      </p>
                    </div>

                    <Card>
                      <CardContent className="pt-6">
                        <Button onClick={() => setChildDialogOpen("copy-editing")}>
                          Open Content Editor
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="calendar" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Calendar Settings</h2>
                      <p className="text-muted-foreground">
                        Configure calendar views, formats, and display options.
                      </p>
                    </div>

                    <Card>
                      <CardContent className="pt-6">
                        <Button onClick={() => setChildDialogOpen("calendar-customization")}>
                          Open Calendar Settings
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="navigation" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Tabs & Navigation</h2>
                      <p className="text-muted-foreground">
                        Customize tab order, visibility, and labels.
                      </p>
                    </div>

                    <Card>
                      <CardContent className="pt-6">
                        <Button onClick={() => setChildDialogOpen("edit-tabs")}>Edit Tabs</Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="behavior" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Behavior & Interaction</h2>
                      <p className="text-muted-foreground">
                        Configure shortcuts, notifications, and workflows.
                      </p>
                    </div>

                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-muted-foreground">
                          Keyboard shortcuts and notification settings coming soon.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="data" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Data & Export</h2>
                      <p className="text-muted-foreground">
                        Manage your data, create backups, and export information.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Export Data</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Button onClick={exportAllSettings} className="w-full">
                            <Download className="h-4 w-4 mr-2" />
                            Export All Settings
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Reset Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Button
                            variant="destructive"
                            onClick={resetAllSettings}
                            className="w-full"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset All Customizations
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>

        {/* Child Dialogs - Available for both modes */}
        <input
          id="settings-import"
          type="file"
          accept=".json"
          className="hidden"
          onChange={importSettings}
        />
        <CopyEditingDialog
          open={childDialogOpen === "copy-editing"}
          onOpenChange={(open) => !open && setChildDialogOpen(null)}
          onSave={() => {
            setChildDialogOpen(null);
            loadSettingsStats();
          }}
        />

        <CalendarCustomizationDialog
          open={childDialogOpen === "calendar-customization"}
          onOpenChange={(open) => !open && setChildDialogOpen(null)}
          onSave={() => {
            setChildDialogOpen(null);
            loadSettingsStats();
          }}
        />

        <EditTabsDialog
          open={childDialogOpen === "edit-tabs"}
          onOpenChange={(open) => !open && setChildDialogOpen(null)}
          prefs={tabPrefs}
          order={tabOrder}
          onSave={(prefs, order) => {
            onTabsSave(prefs, order);
            setChildDialogOpen(null);
            loadSettingsStats();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
