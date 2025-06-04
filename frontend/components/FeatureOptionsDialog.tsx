import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFeatureOptionsContext } from "../contexts/FeatureOptionsContext";

interface FeatureOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeatureOptionsDialog({ open, onOpenChange }: FeatureOptionsDialogProps) {
  const { options, setOptions } = useFeatureOptionsContext();

  const handleChange = (key: "enableEditing" | "enableDragAndDrop", value: boolean) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Feature Options</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="edit-enabled">Enable Editing</Label>
            <Switch
              id="edit-enabled"
              checked={options.enableEditing}
              onCheckedChange={v => handleChange("enableEditing", !!v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="dnd-enabled">Enable Drag &amp; Drop</Label>
            <Switch
              id="dnd-enabled"
              checked={options.enableDragAndDrop}
              onCheckedChange={v => handleChange("enableDragAndDrop", !!v)}
            />
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
