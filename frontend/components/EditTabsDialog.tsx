import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmojiPicker } from "@/components/EmojiPicker";
import { Label } from "@/components/ui/label";

export interface TabPref {
  key: string;
  label: string;
  emoji: string;
}

interface EditTabsDialogProps {
  prefs: Record<string, TabPref>;
  order: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (prefs: Record<string, TabPref>, order: string[]) => void;
}

export function EditTabsDialog({ prefs, order, open, onOpenChange, onSave }: EditTabsDialogProps) {
  const [localPrefs, setLocalPrefs] = useState<Record<string, TabPref>>({});
  const [localOrder, setLocalOrder] = useState<string[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    setLocalPrefs(prefs);
    setLocalOrder(order);
  }, [prefs, order]);

  const handleChange = (key: string, field: "label" | "emoji", value: string) => {
    setLocalPrefs(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleDragStart = (key: string) => {
    setDragging(key);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const overKey = localOrder[index];
    if (dragging === overKey) return;
  };

  const handleDrop = (index: number) => {
    if (!dragging) return;
    const dragIndex = localOrder.indexOf(dragging);
    if (dragIndex === index) return;
    const newOrder = [...localOrder];
    newOrder.splice(dragIndex, 1);
    newOrder.splice(index, 0, dragging);
    setLocalOrder(newOrder);
    setDragging(null);
  };

  const handleDragEnd = () => setDragging(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localPrefs, localOrder);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Navigation Tabs</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {localOrder.map((key, index) => {
            const pref = localPrefs[key];
            return (
              <div
                key={key}
                className="grid grid-cols-2 gap-2 cursor-move"
                draggable
                onDragStart={() => handleDragStart(key)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
              >
                <div>
                  <Label htmlFor={`emoji-${pref.key}`}>Emoji</Label>
                  <EmojiPicker id={`emoji-${pref.key}`} value={pref.emoji} onChange={(v) => handleChange(pref.key, "emoji", v)} />
                </div>
                <div>
                  <Label htmlFor={`label-${pref.key}`}>Label</Label>
                  <Input id={`label-${pref.key}`} value={pref.label} onChange={e => handleChange(pref.key, "label", e.target.value)} required />
                </div>
              </div>
            );
          })}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
