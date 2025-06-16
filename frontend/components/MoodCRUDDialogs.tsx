import { useState } from "react";
import backend from "~backend/client";
import { useToast } from "../hooks/useToast";
import { UniversalCRUDDialog } from "./crud/UniversalCRUDDialog";
import { createMoodDialogConfig, editMoodDialogConfig } from "./crud/moodDialogConfig";

// Types for mood entries (simplified for UI)
interface MoodEntry {
  id: number;
  date: Date;
  tier: "uplifted" | "neutral" | "heavy";
  emoji: string;
  label: string;
  secondaryTier?: "uplifted" | "neutral" | "heavy";
  secondaryEmoji?: string;
  secondaryLabel?: string;
  tags?: string[];
  notes?: string;
  createdAt: Date;
}

interface CreateMoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMoodCreated: (mood: MoodEntry) => void;
  initialDate?: Date;
}

interface EditMoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mood: MoodEntry;
  onMoodUpdated: (mood: MoodEntry) => void;
}

export function CreateMoodDialog({
  open,
  onOpenChange,
  onMoodCreated,
  initialDate,
}: CreateMoodDialogProps) {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Create the mood entry
      const createdMood = await backend.mood.createMoodEntry({
        date: data.date || initialDate || new Date(),
        tier: data.tier,
        emoji: data.emoji,
        label: data.label,
        secondaryTier: data.secondaryTier || undefined,
        secondaryEmoji: data.secondaryEmoji || undefined,
        secondaryLabel: data.secondaryLabel || undefined,
        tags: data.tags || [],
        notes: data.notes || undefined,
      });

      // Notify parent
      onMoodCreated(createdMood);

      // Show success message
      showSuccess("Mood entry created successfully");

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create mood:", error);
      showError("Failed to create mood entry");
    } finally {
      setIsLoading(false);
    }
  };

  const config = {
    ...createMoodDialogConfig,
    onSubmit: handleSubmit,
    showSubmitSpinner: isLoading,
  };

  const initialData = initialDate ? { date: initialDate } : undefined;

  return (
    <UniversalCRUDDialog
      open={open}
      onOpenChange={onOpenChange}
      config={config}
      initialData={initialData}
    />
  );
}

export function EditMoodDialog({ open, onOpenChange, mood, onMoodUpdated }: EditMoodDialogProps) {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Create a new mood entry (update by creating new one)
      const updatedMood = await backend.mood.createMoodEntry({
        date: data.date || mood.date,
        tier: data.tier,
        emoji: data.emoji,
        label: data.label,
        secondaryTier: data.secondaryTier || undefined,
        secondaryEmoji: data.secondaryEmoji || undefined,
        secondaryLabel: data.secondaryLabel || undefined,
        tags: data.tags || [],
        notes: data.notes || undefined,
      });

      // Notify parent
      onMoodUpdated(updatedMood);

      // Show success message
      showSuccess("Mood entry updated successfully");

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update mood:", error);
      showError("Failed to update mood entry");
    } finally {
      setIsLoading(false);
    }
  };

  const config = {
    ...editMoodDialogConfig,
    onSubmit: handleSubmit,
    showSubmitSpinner: isLoading,
  };

  const initialData = {
    date: mood.date,
    tier: mood.tier,
    emoji: mood.emoji,
    label: mood.label,
    secondaryTier: mood.secondaryTier || "",
    secondaryEmoji: mood.secondaryEmoji || "",
    secondaryLabel: mood.secondaryLabel || "",
    tags: mood.tags || [],
    notes: mood.notes || "",
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
