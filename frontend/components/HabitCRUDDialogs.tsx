/**
 * Modern Habit CRUD Dialogs
 *
 * This component replaces the old CreateHabitDialog and EditHabitDialog components
 * using the new Universal CRUD Dialog framework. It maintains the same API
 * for compatibility while providing a unified implementation.
 */

import { useState } from "react";
import backend from "~backend/client";
import { useToast } from "../hooks/useToast";
import { UniversalCRUDDialog } from "./crud";
import { createHabitDialogConfig, editHabitDialogConfig } from "./crud/habitDialogConfig";
import type { CRUDDialogConfig } from "./crud/types";

// Simplified Habit interface (can be replaced with proper import when types are fixed)
interface Habit {
  id: number;
  name: string;
  emoji: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly";
  targetCount: number;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

// ============================================================================
// CREATE HABIT DIALOG
// ============================================================================

interface CreateHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHabitCreated: (habit: Habit) => void;
}

export function CreateHabitDialog({ open, onOpenChange, onHabitCreated }: CreateHabitDialogProps) {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Create the habit
      const habit = await backend.habits.createHabit({
        name: data.name,
        emoji: data.icon || "🎯",
        description: data.description || undefined,
        frequency: data.frequency || "daily",
        targetCount: data.targetValue || 1,
        startDate: new Date(),
        endDate: undefined,
      });

      // Notify parent
      onHabitCreated(habit);

      // Show success message
      showSuccess("Habit created successfully");

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create habit:", error);
      showError("Failed to create habit");
      throw error; // Re-throw to keep dialog open
    } finally {
      setIsLoading(false);
    }
  };

  const config: CRUDDialogConfig = {
    ...createHabitDialogConfig,
    onSubmit: handleSubmit,
  };

  return (
    <UniversalCRUDDialog
      open={open}
      onOpenChange={onOpenChange}
      config={config}
      loading={isLoading}
    />
  );
}

// ============================================================================
// EDIT HABIT DIALOG
// ============================================================================

interface EditHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: Habit;
  onHabitUpdated: (habit: Habit) => void;
}

export function EditHabitDialog({
  open,
  onOpenChange,
  habit,
  onHabitUpdated,
}: EditHabitDialogProps) {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Update the habit
      const updatedHabit = await backend.habits.updateHabit(habit.id, {
        id: habit.id,
        name: data.name,
        emoji: data.icon || "🎯",
        description: data.description || undefined,
        frequency: data.frequency || "daily",
        targetCount: data.targetValue || 1,
        startDate: new Date(), // Could be enhanced to use existing startDate
        endDate: undefined, // Could be enhanced to use existing endDate
      });

      // Notify parent
      onHabitUpdated(updatedHabit);

      // Show success message
      showSuccess("Habit updated successfully");

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update habit:", error);
      showError("Failed to update habit");
      throw error; // Re-throw to keep dialog open
    } finally {
      setIsLoading(false);
    }
  };

  const config: CRUDDialogConfig = {
    ...editHabitDialogConfig,
    initialData: {
      name: habit.name,
      description: habit.description || "",
      frequency: habit.frequency,
      targetValue: habit.targetCount || 1,
      icon: habit.emoji || "🎯",
    },
    onSubmit: handleSubmit,
  };

  return (
    <UniversalCRUDDialog
      open={open}
      onOpenChange={onOpenChange}
      config={config}
      loading={isLoading}
    />
  );
}

// ============================================================================
// HOOKS FOR EASIER INTEGRATION
// ============================================================================

export function useCreateHabitDialog(onHabitCreated: (habit: Habit) => void) {
  const [open, setOpen] = useState(false);

  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);

  const dialog = (
    <CreateHabitDialog
      open={open}
      onOpenChange={setOpen}
      onHabitCreated={(habit) => {
        onHabitCreated(habit);
        closeDialog();
      }}
    />
  );

  return {
    openDialog,
    closeDialog,
    dialog,
    isOpen: open,
  };
}

export function useEditHabitDialog(onHabitUpdated: (habit: Habit) => void) {
  const [open, setOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  const openDialog = (habit: Habit) => {
    setHabitToEdit(habit);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setHabitToEdit(null);
  };

  const dialog = habitToEdit ? (
    <EditHabitDialog
      open={open}
      onOpenChange={setOpen}
      habit={habitToEdit}
      onHabitUpdated={(habit) => {
        onHabitUpdated(habit);
        closeDialog();
      }}
    />
  ) : null;

  return {
    openDialog,
    closeDialog,
    dialog,
    isOpen: open,
    habitToEdit,
  };
}
