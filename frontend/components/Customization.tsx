import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "./DarkModeToggle";
import { EditTabsDialog, TabPref } from "./EditTabsDialog";
import { EditMoodOptionsDialog } from "./EditMoodOptionsDialog";

interface CustomizationProps {
  prefs: Record<string, TabPref>;
  order: string[];
  onSaveTabs: (prefs: Record<string, TabPref>, order: string[]) => void;
}

export function Customization({ prefs, order, onSaveTabs }: CustomizationProps) {
  const [tabsOpen, setTabsOpen] = useState(false);
  const [moodsOpen, setMoodsOpen] = useState(false);

  return (
    <>
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Customization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Appearance</h3>
            <DarkModeToggle />
          </div>
          <div className="space-x-2">
            <Button onClick={() => setTabsOpen(true)}>Edit Navigation</Button>
            <Button variant="outline" onClick={() => setMoodsOpen(true)}>
              Edit Mood Options
            </Button>
          </div>
        </CardContent>
      </Card>
      <EditTabsDialog
        open={tabsOpen}
        onOpenChange={setTabsOpen}
        prefs={prefs}
        order={order}
        onSave={onSaveTabs}
      />
      <EditMoodOptionsDialog open={moodsOpen} onOpenChange={setMoodsOpen} />
    </>
  );
}
