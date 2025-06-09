import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserName } from "@/hooks/useUserName";
import { useState } from "react";
import backend from "~backend/client";
import { EditTabsDialog, type TabPref } from "./EditTabsDialog";
import { FeaturesList } from "./FeaturesList";

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
  const [exporting, setExporting] = useState(false);
  const { name, setName } = useUserName();
  const [nameInput, setNameInput] = useState(name);

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
      <h2 className="text-2xl font-bold">Settings</h2>
      <div className="space-x-2">
        <Button variant="outline" onClick={() => setTabsDialogOpen(true)}>
          Edit Tabs
        </Button>
        <Button variant="outline" onClick={handleExport} disabled={exporting}>
          {exporting ? "Exporting..." : "Export Data"}
        </Button>
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
      <FeaturesList />
    </div>
  );
}
