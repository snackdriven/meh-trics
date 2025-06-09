import { EmojiPicker } from "@/components/EmojiPicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import backend from "~backend/client";
import type { RoutineItem } from "~backend/task/types";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
import { LoadingSpinner } from "./LoadingSpinner";

interface EditRoutineItemDialogProps {
  item: RoutineItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemUpdated: (item: RoutineItem) => void;
}

export function EditRoutineItemDialog({
  item,
  open,
  onOpenChange,
  onItemUpdated,
}: EditRoutineItemDialogProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("\u{1F4A1}");
  const [groupName, setGroupName] = useState("");

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (item) {
      setName(item.name);
      setEmoji(item.emoji);
      setGroupName(item.groupName || "");
    }
  }, [item]);

  const { loading: submitting, execute: updateItem } = useAsyncOperation(
    async () => {
      if (!name.trim()) {
        throw new Error("Name is required");
      }

      const updated = await (backend.task as any).updateRoutineItem({
        id: item.id,
        name: name.trim(),
        emoji: emoji.trim(),
        groupName: groupName.trim() || undefined,
      });

      onItemUpdated(updated);
      return updated;
    },
    () => {
      showSuccess("Routine item updated!");
      onOpenChange(false);
    },
    (error) => showError(error, "Failed to Update Item"),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateItem();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby="edit-routine-item-desc"
        className="sm:max-w-sm"
      >
        <DialogHeader>
          <DialogTitle>Edit Routine Item</DialogTitle>
        </DialogHeader>
        <DialogDescription id="edit-routine-item-desc" className="sr-only">
          Update this routine item.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="emoji">Emoji</Label>
            <EmojiPicker id="emoji" value={emoji} onChange={setEmoji} />
          </div>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="group">Group</Label>
            <Input
              id="group"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
