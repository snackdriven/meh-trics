import { EmojiPicker } from "@/components/EmojiPicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import backend from "~backend/client";
import type { RoutineItem } from "~backend/task/types";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
import { LoadingSpinner } from "./LoadingSpinner";

interface CreateRoutineItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemCreated: (item: RoutineItem) => void;
}

export function CreateRoutineItemDialog({
  open,
  onOpenChange,
  onItemCreated,
}: CreateRoutineItemDialogProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("\u{1F331}");
  const { showSuccess, showError } = useToast();

  const { loading: submitting, execute: createItem } = useAsyncOperation(
    async () => {
      if (!name.trim()) {
        throw new Error("Name is required");
      }
      const item = await backend.task.createRoutineItem({
        name: name.trim(),
        emoji: emoji.trim(),
      });
      onItemCreated(item);
      setName("");
      setEmoji("\u{1F331}");
      return item;
    },
    () => {
      showSuccess("Routine item created!");
      onOpenChange(false);
    },
    (error) => showError(error, "Failed to Create Item"),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createItem();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create Routine Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="routineEmoji">Emoji</Label>
            <EmojiPicker id="routineEmoji" value={emoji} onChange={setEmoji} />
          </div>
          <div>
            <Label htmlFor="routineName">Name</Label>
            <Input
              id="routineName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
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
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
