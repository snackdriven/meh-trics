import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUserName } from "@/hooks/useUserName";
import { useCopyEditing } from "@/hooks/useCopyEditing";
import { useState } from "react";
import backend from "~backend/client";
import { EditTabsDialog, type TabPref } from "./EditTabsDialog";
import { CopyEditingDialog } from "./CopyEditingDialog";
import { UnifiedCustomizationHub } from "./UnifiedCustomizationHub";
import { SimpleThemeCustomizer } from "./SimpleThemeCustomizer";
import { defaultMoodOptions } from "@/constants/moods";
import { commonTags } from "@/constants/tags";
import { uiText } from "@/constants/uiText";

interface SettingsPageProps {
  tabPrefs: Record<string, TabPref>;
  tabOrder: string[];
  onTabsSave: (prefs: Record<string, TabPref>, order: string[]) => void;
}

export function SettingsPage({
  tabPrefs,
  tabOrder,
  onTabsSave,
}: SettingsPageProps) {
  const [tabsDialogOpen, setTabsDialogOpen] = useState(false);
  const [copyEditingOpen, setCopyEditingOpen] = useState(false);
  const [unifiedHubOpen, setUnifiedHubOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { name, setName } = useUserName();
  const [nameInput, setNameInput] = useState(name);
  const { saveCopyData, resetToDefaults } = useCopyEditing();

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
      console.error("Export failed", err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Settings</h2>
        <Button onClick={() => setUnifiedHubOpen(true)}>
          Open Customization Hub
        </Button>
      </div>
      
      <div className="space-x-2">
        <Button variant="outline" onClick={() => setTabsDialogOpen(true)}>
          Edit Tabs
        </Button>
        <Button variant="outline" onClick={() => setCopyEditingOpen(true)}>
          Edit Content & Copy
        </Button>
        <Button variant="outline" onClick={handleExport} disabled={exporting}>
          {exporting ? "Exporting..." : "Export Data"}
        </Button>
        
        {/* Legacy dialogs - to be phased out */}
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
        
        {/* New unified hub */}
        <UnifiedCustomizationHub
          open={unifiedHubOpen}
          onOpenChange={setUnifiedHubOpen}
          tabPrefs={tabPrefs}
          tabOrder={tabOrder}
          onTabsSave={onTabsSave}
        />
      </div>
      <div className="space-y-2 max-w-xs">
        <Label htmlFor="userName">Your Name</Label>
        <div className="flex space-x-2">
          <Input
            id="userName"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
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
      
      <Separator />
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Appearance</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Customize your app's colors and theme
            </p>
          </div>
          <SimpleThemeCustomizer />
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Content & Copy</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Customize all text, moods, tags, and labels in the app
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCopyEditingOpen(true)}>
              Edit Content
            </Button>
            <Button variant="outline" size="sm" onClick={resetToDefaults}>
              Reset All
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">          <div className="p-3 bg-[var(--color-bg-secondary)] rounded">
            <h4 className="font-medium mb-2">Mood Options</h4>
            <p className="text-[var(--color-text-secondary)]">
              {(() => {
                try {
                  const data = JSON.parse(localStorage.getItem('copy-editing-data') || '{}');
                  const moodOptions = data?.moodOptions;
                  if (moodOptions && typeof moodOptions === 'object') {
                    return Object.values(moodOptions).flat().length;
                  }
                  return Object.values(defaultMoodOptions).flat().length;
                } catch {
                  return Object.values(defaultMoodOptions).flat().length;
                }
              })()} mood options configured
            </p>
          </div>
          
          <div className="p-3 bg-[var(--color-bg-secondary)] rounded">
            <h4 className="font-medium mb-2">Available Tags</h4>
            <p className="text-[var(--color-text-secondary)]">
              {(() => {
                try {
                  const data = JSON.parse(localStorage.getItem('copy-editing-data') || '{}');
                  const tags = data?.tags;
                  if (Array.isArray(tags)) {
                    return tags.length;
                  }
                  return commonTags.length;
                } catch {
                  return commonTags.length;
                }
              })()} tags available
            </p>
          </div>
          
          <div className="p-3 bg-[var(--color-bg-secondary)] rounded">
            <h4 className="font-medium mb-2">UI Text</h4>
            <p className="text-[var(--color-text-secondary)]">
              {(() => {
                try {
                  const data = JSON.parse(localStorage.getItem('copy-editing-data') || '{}');
                  const uiTextData = data?.uiText;
                  if (uiTextData && typeof uiTextData === 'object') {
                    return Object.keys(uiTextData).length;
                  }
                  return Object.keys(uiText).length;
                } catch {
                  return Object.keys(uiText).length;
                }
              })()} text sections customizable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
