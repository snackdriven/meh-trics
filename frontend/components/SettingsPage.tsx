import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "../hooks/useToast";
import backend from "~backend/client";
import { EditTabsDialog, TabPref } from "./EditTabsDialog";

interface SettingsPageProps {
  tabPrefs: Record<string, TabPref>;
  tabOrder: string[];
  onTabsSave: (prefs: Record<string, TabPref>, order: string[]) => void;
}

interface SettingsCopy {
  title: string;
  importLabel: string;
}

const defaultCopy: SettingsCopy = {
  title: "Settings",
  importLabel: "Import iCal",
};

export function SettingsPage({ tabPrefs, tabOrder, onTabsSave }: SettingsPageProps) {
  const { showSuccess, showError } = useToast();
  const [importing, setImporting] = useState(false);
  const [copy, setCopy] = useState<SettingsCopy>(() => {
    const stored = localStorage.getItem("settingsCopy");
    return stored ? JSON.parse(stored) : defaultCopy;
  });
  const [editingCopy, setEditingCopy] = useState(false);
  const [tabsDialogOpen, setTabsDialogOpen] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const result = await backend.task.importCalendarEvents({ ics: text });
      showSuccess(`Imported ${result.imported} of ${result.total} events`);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to import events";
      showError(msg);
    } finally {
      setImporting(false);
      e.target.value = ""; // reset
    }
  };

  const handleCopyChange = (field: keyof SettingsCopy, value: string) => {
    setCopy(prev => ({ ...prev, [field]: value }));
  };

  const saveCopy = () => {
    localStorage.setItem("settingsCopy", JSON.stringify(copy));
    setEditingCopy(false);
  };

  return (
    <div className="space-y-4 p-4">
      {editingCopy ? (
        <div className="space-y-2">
          <Input
            value={copy.title}
            onChange={e => handleCopyChange("title", e.target.value)}
            className="text-2xl font-bold"
          />
          <Input
            value={copy.importLabel}
            onChange={e => handleCopyChange("importLabel", e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={saveCopy}>Save</Button>
            <Button variant="outline" onClick={() => setEditingCopy(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{copy.title}</h2>
          <Button variant="outline" size="sm" onClick={() => setEditingCopy(true)}>
            Edit Copy
          </Button>
        </div>
      )}
      <div>
        <Button asChild disabled={importing}>
          <label className="cursor-pointer">
            {copy.importLabel}
            <input
              type="file"
              accept=".ics,text/calendar"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </Button>
      </div>
      <div>
        <Button variant="outline" onClick={() => setTabsDialogOpen(true)}>
          Edit Tabs
        </Button>
        <EditTabsDialog
          prefs={tabPrefs}
          order={tabOrder}
          open={tabsDialogOpen}
          onOpenChange={setTabsDialogOpen}
          onSave={(p, o) => {
            onTabsSave(p, o);
            setTabsDialogOpen(false);
          }}
        />
      </div>
    </div>
  );
}
