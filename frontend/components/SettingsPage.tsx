import { Button } from "@/components/ui/button";
import { useState } from "react";
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

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">Settings</h2>
      <div>
        <Button variant="outline" onClick={() => setTabsDialogOpen(true)}>
          Edit Tabs
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
      <FeaturesList />
    </div>
  );
}
