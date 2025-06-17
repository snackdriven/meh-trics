import { useState } from "react";
import backend from "~backend/client";
import { useToast } from "@/hooks/useToast";
import { UniversalCRUDDialog } from "./crud/UniversalCRUDDialog";
import {
  createJournalEntryDialogConfig,
  editJournalEntryDialogConfig,
} from "./crud/journalEntryDialogConfig";

// Types for journal entries (simplified for UI)
interface JournalEntry {
  id: number;
  date?: Date;
  text: string;
  tags: string[];
  moodId?: number;
  taskId?: number;
  habitEntryId?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateJournalEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJournalEntryCreated: (entry: JournalEntry) => void;
  initialDate?: Date;
}

interface EditJournalEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  journalEntry: JournalEntry;
  onJournalEntryUpdated: (entry: JournalEntry) => void;
}

export function CreateJournalEntryDialog({
  open,
  onOpenChange,
  onJournalEntryCreated,
  initialDate,
}: CreateJournalEntryDialogProps) {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Create the journal entry
      const createdEntry = await backend.task.createJournalEntry({
        text: data.text,
        date: data.date || initialDate,
        tags: data.tags || [],
        moodId: data.moodId || undefined,
        taskId: data.taskId || undefined,
        habitEntryId: data.habitEntryId || undefined,
      });

      // Notify parent
      onJournalEntryCreated(createdEntry);

      // Show success message
      showSuccess("Journal entry created successfully");

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create journal entry:", error);
      showError("Failed to create journal entry");
    } finally {
      setIsLoading(false);
    }
  };

  const config = {
    ...createJournalEntryDialogConfig,
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

export function EditJournalEntryDialog({
  open,
  onOpenChange,
  journalEntry,
  onJournalEntryUpdated,
}: EditJournalEntryDialogProps) {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Update the journal entry
      const updatedEntry = await backend.task.updateJournalEntry(journalEntry.id, {
        text: data.text,
        tags: data.tags || [],
        moodId: data.moodId || undefined,
        taskId: data.taskId || undefined,
        habitEntryId: data.habitEntryId || undefined,
      });

      // Notify parent
      onJournalEntryUpdated(updatedEntry);

      // Show success message
      showSuccess("Journal entry updated successfully");

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update journal entry:", error);
      showError("Failed to update journal entry");
    } finally {
      setIsLoading(false);
    }
  };

  const config = {
    ...editJournalEntryDialogConfig,
    onSubmit: handleSubmit,
    showSubmitSpinner: isLoading,
  };

  const initialData = {
    text: journalEntry.text,
    date: journalEntry.date,
    tags: journalEntry.tags,
    moodId: journalEntry.moodId,
    taskId: journalEntry.taskId,
    habitEntryId: journalEntry.habitEntryId,
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
