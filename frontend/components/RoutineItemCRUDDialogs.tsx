import { useState } from "react";
import backend from "~backend/client";
import { useToast } from "../hooks/useToast";
import { UniversalCRUDDialog } from "./crud/UniversalCRUDDialog";
import {
  createRoutineItemDialogConfig,
  editRoutineItemDialogConfig,
} from "./crud/routineItemDialogConfig";

// Types for routine items (simplified for UI)
interface RoutineItem {
  id: number;
  name: string;
  emoji: string;
  groupName?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
}

interface CreateRoutineItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoutineItemCreated: (item: RoutineItem) => void;
}

interface EditRoutineItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routineItem: RoutineItem;
  onRoutineItemUpdated: (item: RoutineItem) => void;
}

export function CreateRoutineItemDialog({
  open,
  onOpenChange,
  onRoutineItemCreated,
}: CreateRoutineItemDialogProps) {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Create the routine item
      const createdItem = await backend.task.createRoutineItem({
        name: data.name,
        emoji: data.emoji || "✅",
        isActive: data.isActive ?? true,
        groupName: data.groupName || undefined,
      });

      // Notify parent
      onRoutineItemCreated(createdItem);

      // Show success message
      showSuccess("Routine item created successfully");

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create routine item:", error);
      showError("Failed to create routine item");
    } finally {
      setIsLoading(false);
    }
  };

  const config = {
    ...createRoutineItemDialogConfig,
    onSubmit: handleSubmit,
    showSubmitSpinner: isLoading,
  };

  return <UniversalCRUDDialog open={open} onOpenChange={onOpenChange} config={config} />;
}

export function EditRoutineItemDialog({
  open,
  onOpenChange,
  routineItem,
  onRoutineItemUpdated,
}: EditRoutineItemDialogProps) {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Update the routine item
      const updatedItem = await backend.task.updateRoutineItem({
        id: routineItem.id,
        name: data.name,
        emoji: data.emoji,
        isActive: data.isActive,
        groupName: data.groupName || undefined,
        sortOrder: data.sortOrder,
      });

      // Notify parent
      onRoutineItemUpdated(updatedItem);

      // Show success message
      showSuccess("Routine item updated successfully");

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update routine item:", error);
      showError("Failed to update routine item");
    } finally {
      setIsLoading(false);
    }
  };

  const config = {
    ...editRoutineItemDialogConfig,
    onSubmit: handleSubmit,
    showSubmitSpinner: isLoading,
  };

  const initialData = {
    name: routineItem.name,
    emoji: routineItem.emoji,
    groupName: routineItem.groupName || "",
    isActive: routineItem.isActive,
    sortOrder: routineItem.sortOrder,
  };

  return (
    <UniversalCRUDDialog
      open={open}
      onOpenChange={onOpenChange}
      config={config}
      initialData={initialData}
    />
  );
}
