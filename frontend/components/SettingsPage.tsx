import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { defaultMoodOptions } from "@/constants/moods";
import { commonTags } from "@/constants/tags";
import { uiText } from "@/constants/uiText";
import { useCopyEditing } from "@/hooks/useCopyEditing";
import { useUserName } from "@/hooks/useUserName";
import {
  CalendarIcon,
  Database,
  Download,
  Eye,
  Palette,
  RotateCcw,
  Settings,
  Type,
  Upload,
  User,
} from "lucide-react";
import { useState } from "react";
import backend from "~backend/client";
import { useTheme } from "../theme";
import { useToast } from "../hooks/useToast";
import { CalendarCustomizationDialog } from "./CalendarCustomizationDialog";
import { CopyEditingDialog } from "./CopyEditingDialog";
import { EditMoodOptionsDialog } from "./EditMoodOptionsDialog";
import { EditTabsDialog, type TabPref } from "./EditTabsDialog";
import { SimpleThemeCustomizer } from "./SimpleThemeCustomizer";

interface SettingsPageProps {
  tabPrefs: Record<string, TabPref>;
  tabOrder: string[];
  onTabsSave: (prefs: Record<string, TabPref>, order: string[]) => void;
}

export function SettingsPage({ tabPrefs, tabOrder, onTabsSave }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState("account");
  const [tabsDialogOpen, setTabsDialogOpen] = useState(false);
  const [copyEditingOpen, setCopyEditingOpen] = useState(false);
  const [moodEditingOpen, setMoodEditingOpen] = useState(false);
  const [calendarCustomizationOpen, setCalendarCustomizationOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { name, setName } = useUserName();
  const [nameInput, setNameInput] = useState(name);
  const { saveCopyData, resetToDefaults } = useCopyEditing();
  const { showToast } = useToast();
  const {
    currentTheme,
    themes,
    switchTheme,
    setTransitionsEnabled,
    checkAccessibility,
    settings: themeSettings,
  } = useTheme();

  async function handleExport() {
    setExporting(true);
    try {
      const resp = await backend.exporter.exportCSV();
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "meh-trics-export.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast("Export failed. Please try again.", "error");
    } finally {
      setExporting(false);
    }
  }

  const exportAllSettings = () => {
    const allSettings = {
      appearance: {
        theme: currentTheme?.id,
        animations: themeSettings.animations,
      },
      content: localStorage.getItem("copy-editing-data"),
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

  const resetAllSettings = () => {
    if (confirm("Are you sure you want to reset all customizations? This cannot be undone.")) {
      const keysToRemove = [
        "theme-preferences",
        "copy-editing-data",
        "calendar-customization",
      ];

      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }

      window.location.reload();
    }
  };

  const getCustomizationCounts = () => {
    const moodCount = (() => {
      try {
        const data = JSON.parse(localStorage.getItem("copy-editing-data") || "{}");
        const moodOptions = data?.moodOptions;
        if (moodOptions && typeof moodOptions === "object") {
          return Object.values(moodOptions).flat().length;
        }
        return Object.values(defaultMoodOptions).flat().length;
      } catch {
        return Object.values(defaultMoodOptions).flat().length;
      }
    })();

    const tagCount = (() => {
      try {
        const data = JSON.parse(localStorage.getItem("copy-editing-data") || "{}");
        const tags = data?.tags;
        if (Array.isArray(tags)) {
          return tags.length;
        }
        return commonTags.length;
      } catch {
        return commonTags.length;
      }
    })();

    const uiTextCount = (() => {
      try {
        const data = JSON.parse(localStorage.getItem("copy-editing-data") || "{}");
        const uiTextData = data?.uiText;
        if (uiTextData && typeof uiTextData === "object") {
          return Object.keys(uiTextData).length;
        }
        return Object.keys(uiText).length;
      } catch {
        return Object.keys(uiText).length;
      }
    })();

    return { moodCount, tagCount, uiTextCount };
  };

  const { moodCount, tagCount, uiTextCount } = getCustomizationCounts();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Settings
          </h2>
          <p className="text-muted-foreground mt-1">Customize your app experience</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex">
        <TabsList className="flex flex-col h-full w-64 bg-muted/50 p-2 space-y-1">
          <TabsTrigger value="account" className="w-full justify-start">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="appearance" className="w-full justify-start">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="content" className="w-full justify-start">
            <Type className="h-4 w-4 mr-2" />
            Content & Copy
          </TabsTrigger>
          <TabsTrigger value="navigation" className="w-full justify-start">
            <Eye className="h-4 w-4 mr-2" />
            Navigation
          </TabsTrigger>
          <TabsTrigger value="calendar" className="w-full justify-start">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="data" className="w-full justify-start">
            <Database className="h-4 w-4 mr-2" />
            Data
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-6">
          <TabsContent value="account" className="mt-0">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Account Settings</h3>
                <p className="text-muted-foreground mb-4">
                  Manage your personal information and preferences
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 max-w-xs">
                    <Label htmlFor="userName">Your Name</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="userName"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Enter your name"
                      />
                      <Button
                        variant="outline"
                        onClick={() => setName(nameInput)}
                        disabled={nameInput === name}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="mt-0">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Appearance & Theme</h3>
                <p className="text-muted-foreground mb-4">
                  Customize colors, layout, and visual preferences
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Theme Settings
                    <Badge variant="secondary">
                      {currentTheme?.name || "Default"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleThemeCustomizer />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Theme Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {themes.map((theme) => (
                      <Button
                        key={theme.id}
                        variant={currentTheme?.id === theme.id ? "default" : "outline"}
                        className="h-auto p-3 flex flex-col items-start"
                        onClick={() => switchTheme(theme.id)}
                      >
                        <span className="font-medium">{theme.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {theme.isDark ? "Dark" : "Light"} theme
                        </span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Animation Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Smooth Transitions</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable animated theme transitions
                      </p>
                    </div>
                    <Button
                      variant={themeSettings.animations ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTransitionsEnabled(!themeSettings.animations)}
                    >
                      {themeSettings.animations ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="mt-0">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Content & Copy</h3>
                <p className="text-muted-foreground mb-4">
                  Customize text, moods, tags, and labels throughout the app
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      Mood Options
                      <Badge variant="outline">{moodCount}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Customize available mood choices and categories
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMoodEditingOpen(true)}
                      className="w-full"
                    >
                      Edit Moods
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      Tags & Labels
                      <Badge variant="outline">{tagCount}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Customize available tags and organizational labels
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCopyEditingOpen(true)}
                      className="w-full"
                    >
                      Edit Tags
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      UI Text
                      <Badge variant="outline">{uiTextCount}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Customize button text, labels, and interface copy
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCopyEditingOpen(true)}
                      className="w-full"
                    >
                      Edit Text
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCopyEditingOpen(true)}>
                      <Type className="h-4 w-4 mr-2" />
                      Edit All Content
                    </Button>
                    <Button variant="outline" onClick={resetToDefaults}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset to Defaults
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="navigation" className="mt-0">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Navigation & Tabs</h3>
                <p className="text-muted-foreground mb-4">
                  Customize tab order, visibility, and labels
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Tab Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Reorder tabs, hide unused sections, and customize labels
                  </p>
                  <Button onClick={() => setTabsDialogOpen(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Edit Tabs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Calendar Settings</h3>
                <p className="text-muted-foreground mb-4">
                  Configure calendar views, formats, and display options
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Calendar Display</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Customize calendar views, formatting, and behavior
                  </p>
                  <Button onClick={() => setCalendarCustomizationOpen(true)}>
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Calendar Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="data" className="mt-0">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Data Management</h3>
                <p className="text-muted-foreground mb-4">
                  Export data, backup settings, and manage your information
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Export Data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={handleExport} disabled={exporting} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      {exporting ? "Exporting..." : "Export CSV Data"}
                    </Button>
                    <Button onClick={exportAllSettings} variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Reset & Cleanup</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="destructive"
                      onClick={resetAllSettings}
                      className="w-full"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset All Settings
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      This will reset all customizations to defaults
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Dialogs */}
      <EditTabsDialog
        prefs={tabPrefs}
        order={tabOrder}
        open={tabsDialogOpen}
        onOpenChange={setTabsDialogOpen}
        onSave={(prefs, order) => {
          onTabsSave(prefs, order);
          setTabsDialogOpen(false);
        }}
      />
      
      <CopyEditingDialog
        open={copyEditingOpen}
        onOpenChange={setCopyEditingOpen}
        onSave={saveCopyData}
      />
      
      <EditMoodOptionsDialog
        open={moodEditingOpen}
        onOpenChange={setMoodEditingOpen}
      />
      
      <CalendarCustomizationDialog
        open={calendarCustomizationOpen}
        onOpenChange={setCalendarCustomizationOpen}
        onSave={() => setCalendarCustomizationOpen(false)}
      />
    </div>
  );
}
