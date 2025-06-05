import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "../hooks/useToast";
import backend from "~backend/client";

export function SettingsPage() {
  const { showSuccess, showError } = useToast();
  const [importing, setImporting] = useState(false);

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

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">Settings</h2>
      <div>
        <Button asChild disabled={importing}>
          <label className="cursor-pointer">
            Import iCal
            <input
              type="file"
              accept=".ics,text/calendar"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </Button>
      </div>
    </div>
  );
}
