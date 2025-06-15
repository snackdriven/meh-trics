import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Palette, 
  Type, 
  Calendar, 
  Keyboard,
  Download, 
  Upload, 
  RotateCcw,
  Eye,
  Zap,
  Database
} from "lucide-react";

// Import existing customization components
import { SimpleThemeCustomizer } from "./SimpleThemeCustomizer";
import { CopyEditingDialog } from "./CopyEditingDialog";
import { CalendarCustomizationDialog } from "./CalendarCustomizationDialog";
import { EditTabsDialog, type TabPref } from "./EditTabsDialog";

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
  onTabsSave 
}: UnifiedCustomizationHubProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [childDialogOpen, setChildDialogOpen] = useState<string | null>(null);
  const [settingsStats, setSettingsStats] = useState<SettingsSection[]>([]);

  // Load customization statistics
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
        lastModified: localStorage.getItem('theme-last-modified')
      },
      {
        id: "content",
        title: "Content & Copy",
        description: "Text, moods, tags, and labels",
        icon: <Type className="h-5 w-5" />,
        customizations: getContentCustomizations(),
        lastModified: localStorage.getItem('copy-editing-last-modified')
      },
      {
        id: "calendar",
        title: "Calendar Settings",
        description: "Views, formats, and display options",
        icon: <Calendar className="h-5 w-5" />,
        customizations: getCalendarCustomizations(),
        lastModified: localStorage.getItem('calendar-customization-last-modified')
      },
      {
        id: "behavior",
        title: "Behavior & Interaction",
        description: "Shortcuts, notifications, and workflows",
        icon: <Keyboard className="h-5 w-5" />,
        customizations: getBehaviorCustomizations(),
        lastModified: localStorage.getItem('behavior-last-modified')
      },
      {
        id: "navigation",
        title: "Tabs & Navigation",
        description: "Tab order, visibility, and labels",
        icon: <Eye className="h-5 w-5" />,
        customizations: getNavigationCustomizations(),
        lastModified: localStorage.getItem('tabs-last-modified')
      },
      {
        id: "data",
        title: "Data & Export",
        description: "Backup, export, and data management",
        icon: <Database className="h-5 w-5" />,
        customizations: 0, // Always 0 as these are actions, not customizations
      }
    ];
    setSettingsStats(stats);
  };

  // Helper functions to count customizations
  const getAppearanceCustomizations = (): number => {
    const theme = localStorage.getItem('theme-preferences');
    const advanced = localStorage.getItem('advanced-theme-settings');
    return (theme ? 1 : 0) + (advanced ? 1 : 0);
  };

  const getContentCustomizations = (): number => {
    const copyData = localStorage.getItem('copy-editing-data');
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
    const calendarSettings = localStorage.getItem('calendar-customization');
    return calendarSettings ? 1 : 0;
  };

  const getBehaviorCustomizations = (): number => {
    const shortcuts = localStorage.getItem('keyboard-shortcuts');
    const notifications = localStorage.getItem('notification-settings');
    return (shortcuts ? 1 : 0) + (notifications ? 1 : 0);
  };

  const getNavigationCustomizations = (): number => {
    const hasCustomTabs = Object.keys(tabPrefs).some(key => 
      tabPrefs[key].hidden || tabPrefs[key].label !== key
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
        theme: localStorage.getItem('theme-preferences'),
        advanced: localStorage.getItem('advanced-theme-settings'),
      },
      content: localStorage.getItem('copy-editing-data'),
      calendar: localStorage.getItem('calendar-customization'),
      behavior: {
        shortcuts: localStorage.getItem('keyboard-shortcuts'),
        notifications: localStorage.getItem('notification-settings'),
      },
      navigation: {
        tabPrefs,
        tabOrder,
      },
      exportDate: new Date().toISOString(),
      version: "1.0.0"
    };

    const blob = new Blob([JSON.stringify(allSettings, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meh-trics-settings-${new Date().toISOString().split('T')[0]}.json`;
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
            localStorage.setItem('theme-preferences', settings.appearance.theme);
          }
          if (settings.appearance.advanced) {
            localStorage.setItem('advanced-theme-settings', settings.appearance.advanced);
          }
        }
        
        if (settings.content) {
          localStorage.setItem('copy-editing-data', settings.content);
        }
        
        if (settings.calendar) {
          localStorage.setItem('calendar-customization', settings.calendar);
        }
        
        if (settings.behavior) {
          if (settings.behavior.shortcuts) {
            localStorage.setItem('keyboard-shortcuts', settings.behavior.shortcuts);
          }
          if (settings.behavior.notifications) {
            localStorage.setItem('notification-settings', settings.behavior.notifications);
          }
        }
        
        if (settings.navigation) {
          onTabsSave(settings.navigation.tabPrefs, settings.navigation.tabOrder);
        }
        
        // Refresh stats and UI
        loadSettingsStats();
        window.location.reload(); // Reload to apply all changes
        
      } catch (error) {
        console.error('Failed to import settings:', error);
        alert('Failed to import settings. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const resetAllSettings = () => {
    if (confirm('Are you sure you want to reset all customizations? This cannot be undone.')) {
      // Clear all customization data
      const keysToRemove = [
        'theme-preferences',
        'advanced-theme-settings',
        'copy-editing-data',
        'calendar-customization',
        'keyboard-shortcuts',
        'notification-settings'
      ];
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Reset tabs to defaults (would need default values)
      // onTabsSave(defaultTabPrefs, defaultTabOrder);
      
      loadSettingsStats();
      window.location.reload();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Customization Hub
              {getTotalCustomizations() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getTotalCustomizations()} customizations
                </Badge>
              )}
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportAllSettings}>
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="settings-import" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </label>
              </Button>
              <input
                id="settings-import"
                type="file"
                accept=".json"
                className="hidden"
                onChange={importSettings}
              />
              <Button variant="outline" size="sm" onClick={resetAllSettings}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full">
          {/* Sidebar Navigation */}
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

          {/* Content Area */}
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
                            <Badge variant="secondary">
                              {section.customizations}
                            </Badge>
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
                    <Button onClick={() => setChildDialogOpen('copy-editing')}>
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
                    <Button onClick={() => setChildDialogOpen('calendar-customization')}>
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
                    <Button onClick={() => setChildDialogOpen('edit-tabs')}>
                      Edit Tabs
                    </Button>
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
                      <Button variant="destructive" onClick={resetAllSettings} className="w-full">
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

        {/* Child Dialogs */}
        <CopyEditingDialog
          open={childDialogOpen === 'copy-editing'}
          onOpenChange={(open) => !open && setChildDialogOpen(null)}
          onSave={() => {
            setChildDialogOpen(null);
            loadSettingsStats();
          }}
        />

        <CalendarCustomizationDialog
          open={childDialogOpen === 'calendar-customization'}
          onOpenChange={(open) => !open && setChildDialogOpen(null)}
          onSave={() => {
            setChildDialogOpen(null);
            loadSettingsStats();
          }}
        />

        <EditTabsDialog
          open={childDialogOpen === 'edit-tabs'}
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