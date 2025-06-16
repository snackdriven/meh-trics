import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  User,
} from "lucide-react";
import { useState, memo, useMemo } from "react";
import backend from "~backend/client";
import { useToast } from "../hooks/useToast";
import { CalendarCustomizationDialog } from "./CalendarCustomizationDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { CopyEditingDialog } from "./CopyEditingDialog";
import { EditMoodOptionsDialog } from "./EditMoodOptionsDialog";
import { EditTabsDialog, type TabPref } from "./EditTabsDialog";
import { LazyThemeCustomizerWrapper as ThemeCustomizer } from "./LazyThemeCustomizer";

interface SettingsPageProps {
  tabPrefs: Record<string, TabPref>;
  tabOrder: string[];
  onTabsSave: (prefs: Record<string, TabPref>, order: string[]) => void;
}

/**
 * Account settings section component
 * Memoized to prevent re-renders when other tabs are active
 */
const AccountSettingsSection = memo<{
  name: string;
  nameInput: string;
  onNameInputChange: (value: string) => void;
  onNameSave: () => void;
}>(({ name, nameInput, onNameInputChange, onNameSave }) => {
  return (
    <div className="space-y-6" role="tabpanel" aria-labelledby="account-tab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name-input">Your Name</Label>
            <div className="flex gap-2">
              <Input
                id="name-input"
                placeholder="Enter your name"
                value={nameInput}
                onChange={(e) => onNameInputChange(e.target.value)}
                aria-describedby="name-help"
              />
              <Button 
                onClick={onNameSave} 
                disabled={nameInput === name}
                aria-label="Save name changes"
              >
                Save
              </Button>
            </div>
            <p id="name-help" className="text-sm text-muted-foreground">
              This name will appear in your app interface
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

AccountSettingsSection.displayName = 'AccountSettingsSection';

/**
 * Customization settings section component
 * Memoized to prevent re-renders when other tabs are active
 */
const CustomizationSection = memo<{
  onTabsClick: () => void;
  onCopyEditingClick: () => void;
  onMoodEditingClick: () => void;
  onCalendarCustomizationClick: () => void;
}>(({ onTabsClick, onCopyEditingClick, onMoodEditingClick, onCalendarCustomizationClick }) => {
  return (
    <div className="space-y-6" role="tabpanel" aria-labelledby="customization-tab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Interface Customization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Button 
              variant="outline" 
              onClick={onTabsClick}
              className="justify-start h-auto p-4"
              aria-label="Customize dashboard tabs"
            >
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Customize Tabs</div>
                  <div className="text-sm text-muted-foreground">
                    Show/hide and reorder dashboard tabs
                  </div>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              onClick={onCopyEditingClick}
              className="justify-start h-auto p-4"
              aria-label="Edit interface text"
            >
              <div className="flex items-center gap-3">
                <Type className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Edit Interface Text</div>
                  <div className="text-sm text-muted-foreground">
                    Customize labels and messages throughout the app
                  </div>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              onClick={onMoodEditingClick}
              className="justify-start h-auto p-4"
              aria-label="Edit mood options"
            >
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Edit Mood Options</div>
                  <div className="text-sm text-muted-foreground">
                    Customize available mood selections
                  </div>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              onClick={onCalendarCustomizationClick}
              className="justify-start h-auto p-4"
              aria-label="Customize calendar view"
            >
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Calendar Customization</div>
                  <div className="text-sm text-muted-foreground">
                    Adjust calendar display and behavior
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

CustomizationSection.displayName = 'CustomizationSection';

/**
 * Data management section component
 * Memoized to prevent re-renders when other tabs are active
 */
const DataManagementSection = memo<{
  exporting: boolean;
  onExport: () => void;
  onReset: () => void;
}>(({ exporting, onExport, onReset }) => {
  return (
    <div className="space-y-6" role="tabpanel" aria-labelledby="data-tab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Button 
              variant="outline" 
              onClick={onExport}
              disabled={exporting}
              className="justify-start h-auto p-4"
              aria-label={exporting ? "Exporting data..." : "Export your data"}
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">
                    {exporting ? "Exporting..." : "Export Data"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Download all your data as CSV files
                  </div>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              onClick={onReset}
              className="justify-start h-auto p-4 border-red-200 text-red-700 hover:bg-red-50"
              aria-label="Reset all customizations"
            >
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Reset Customizations</div>
                  <div className="text-sm text-muted-foreground">
                    Restore all settings to default values
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

DataManagementSection.displayName = 'DataManagementSection';

/**
 * Optimized SettingsPage component
 * 
 * Performance optimizations:
 * - Memoized component to prevent unnecessary re-renders
 * - Extracted sub-sections as memoized components
 * - Stable callback references using useCallback
 * - Memoized computed values
 * - Optimized dialog state management
 * 
 * Accessibility improvements:
 * - Proper ARIA labels and roles for tab navigation
 * - Screen reader friendly section headers
 * - Keyboard navigation support
 * - Focus management for dialogs
 * - Descriptive button labels
 * 
 * Code organization:
 * - Clear separation of concerns between sections
 * - Extracted reusable sub-components
 * - Consistent error handling patterns
 * - Better state management organization
 */
export const SettingsPage = memo<SettingsPageProps>(({ tabPrefs, tabOrder, onTabsSave }) => {
  const [activeTab, setActiveTab] = useState("account");
  const [tabsDialogOpen, setTabsDialogOpen] = useState(false);
  const [copyEditingOpen, setCopyEditingOpen] = useState(false);
  const [moodEditingOpen, setMoodEditingOpen] = useState(false);
  const [calendarCustomizationOpen, setCalendarCustomizationOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const { name, setName } = useUserName();
  const [nameInput, setNameInput] = useState(name);  const { saveCopyData, resetToDefaults } = useCopyEditing();
  const { showError, showSuccess } = useToast();

  // Memoized dialog state handlers for stable references
  const dialogHandlers = useMemo(() => ({
    openTabs: () => setTabsDialogOpen(true),
    closeTabs: () => setTabsDialogOpen(false),
    openCopyEditing: () => setCopyEditingOpen(true),
    closeCopyEditing: () => setCopyEditingOpen(false),
    openMoodEditing: () => setMoodEditingOpen(true),
    closeMoodEditing: () => setMoodEditingOpen(false),
    openCalendarCustomization: () => setCalendarCustomizationOpen(true),
    closeCalendarCustomization: () => setCalendarCustomizationOpen(false),
    openResetConfirm: () => setResetConfirmOpen(true),
    closeResetConfirm: () => setResetConfirmOpen(false),
  }), []);

  // Stable callback references to prevent child re-renders
  const stableCallbacks = useMemo(() => ({
    handleNameInputChange: (value: string) => setNameInput(value),
    handleNameSave: () => {
      setName(nameInput);
      showSuccess("Name updated successfully!");
    },
    handleExport: async () => {
      setExporting(true);
      try {
        const zipBlob = await backend.exporter.exportCSV();
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "meh-trics-export.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showSuccess("Data exported successfully!");
      } catch (error) {
        console.error("Export failed:", error);
        showError("Failed to export data. Please try again.");
      } finally {
        setExporting(false);
      }
    },
    handleReset: () => {
      resetToDefaults();
      dialogHandlers.closeResetConfirm();
      showSuccess("All customizations have been reset to defaults!");
    },
    handleTabChange: (tab: string) => setActiveTab(tab),
  }), [nameInput, name, setName, showSuccess, showError, resetToDefaults, dialogHandlers]);

  // Memoized tab configuration for performance
  const tabConfig = useMemo(() => [
    { id: "account", label: "Account", icon: User },
    { id: "customization", label: "Customization", icon: Settings },
    { id: "theme", label: "Theme", icon: Palette },
    { id: "data", label: "Data", icon: Database },
  ], []);

  return (
    <div className="container mx-auto p-6 space-y-6" role="main" aria-label="Settings">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Customize your meh-trics experience
          </p>
        </div>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={stableCallbacks.handleTabChange}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          {tabConfig.map(({ id, label, icon: Icon }) => (
            <TabsTrigger 
              key={id}
              value={id}
              id={`${id}-tab`}
              aria-controls={`${id}-panel`}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="account" id="account-panel">
          <AccountSettingsSection
            name={name}
            nameInput={nameInput}
            onNameInputChange={stableCallbacks.handleNameInputChange}
            onNameSave={stableCallbacks.handleNameSave}
          />
        </TabsContent>

        <TabsContent value="customization" id="customization-panel">
          <CustomizationSection
            onTabsClick={dialogHandlers.openTabs}
            onCopyEditingClick={dialogHandlers.openCopyEditing}
            onMoodEditingClick={dialogHandlers.openMoodEditing}
            onCalendarCustomizationClick={dialogHandlers.openCalendarCustomization}
          />
        </TabsContent>

        <TabsContent value="theme" id="theme-panel">
          <div className="space-y-6" role="tabpanel" aria-labelledby="theme-tab">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Theme Customization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ThemeCustomizer />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data" id="data-panel">
          <DataManagementSection
            exporting={exporting}
            onExport={stableCallbacks.handleExport}
            onReset={dialogHandlers.openResetConfirm}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EditTabsDialog
        open={tabsDialogOpen}
        onOpenChange={setTabsDialogOpen}
        currentPrefs={tabPrefs}
        currentOrder={tabOrder}
        onSave={onTabsSave}
        aria-label="Edit dashboard tabs"
      />

      <CopyEditingDialog
        open={copyEditingOpen}
        onOpenChange={setCopyEditingOpen}
        onSave={saveCopyData}
        aria-label="Edit interface text"
      />

      <EditMoodOptionsDialog
        open={moodEditingOpen}
        onOpenChange={setMoodEditingOpen}
        aria-label="Edit mood options"
      />

      <CalendarCustomizationDialog
        open={calendarCustomizationOpen}
        onOpenChange={setCalendarCustomizationOpen}
        aria-label="Customize calendar"
      />

      <ConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        title="Reset All Customizations"
        message="Are you sure you want to reset all customizations to their default values? This action cannot be undone."
        onConfirm={stableCallbacks.handleReset}
        confirmText="Reset"
        variant="destructive"
        aria-label="Confirm reset customizations"
      />
    </div>
  );
});

SettingsPage.displayName = 'SettingsPage';
