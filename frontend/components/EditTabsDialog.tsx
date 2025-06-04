import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface TabPref {
  key: string;
  label: string;
  emoji: string;
}

interface EditTabsDialogProps {
  prefs: Record<string, TabPref>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (prefs: Record<string, TabPref>) => void;
}

export function EditTabsDialog({ prefs, open, onOpenChange, onSave }: EditTabsDialogProps) {
  const [localPrefs, setLocalPrefs] = useState<Record<string, TabPref>>({});

  useEffect(() => {
    setLocalPrefs(prefs);
  }, [prefs]);

  const handleChange = (key: string, field: "label" | "emoji", value: string) => {
    setLocalPrefs(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localPrefs);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Navigation Tabs</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.values(localPrefs).map(pref => (
            <div key={pref.key} className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor={`emoji-${pref.key}`}>Emoji</Label>
                <Input id={`emoji-${pref.key}`} value={pref.emoji} onChange={e => handleChange(pref.key, "emoji", e.target.value)} maxLength={2} required />
              </div>
              <div>
                <Label htmlFor={`label-${pref.key}`}>Label</Label>
                <Input id={`label-${pref.key}`} value={pref.label} onChange={e => handleChange(pref.key, "label", e.target.value)} required />
              </div>
            </div>
          ))}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
