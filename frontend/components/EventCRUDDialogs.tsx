/**
 * Modern Event CRUD Dialogs
 * 
 * This component replaces the old CreateEventDialog and EditEventDialog components
 * using the new Universal CRUD Dialog framework. It maintains the same API
 * for compatibility while providing a unified implementation.
 */

import { useState } from "react";
import backend from "~backend/client";
import { useToast } from "../hooks/useToast";
import { UniversalCRUDDialog } from "./crud";
import { createEventDialogConfig, editEventDialogConfig, formatEventForEdit } from "./crud/eventDialogConfig";
import type { CRUDDialogConfig } from "./crud/types";

// Simplified CalendarEvent interface (can be replaced with proper import when types are fixed)
interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  color?: string;
  recurrence?: "none" | "daily" | "weekly" | "monthly" | "yearly";
  recurrenceEndDate?: Date;
  tags?: string[];
}

// ============================================================================
// CREATE EVENT DIALOG
// ============================================================================

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated: (event: CalendarEvent) => void;
}

export function CreateEventDialog({ open, onOpenChange, onEventCreated }: CreateEventDialogProps) {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Prepare the event data
      let startDateTime: Date;
      let endDateTime: Date;

      if (data.isAllDay) {
        startDateTime = new Date(`${data.startDate}T00:00:00`);
        endDateTime = new Date(`${data.endDate}T23:59:59`);
      } else {
        startDateTime = new Date(`${data.startDate}T${data.startTime}`);
        endDateTime = new Date(`${data.endDate}T${data.endTime}`);
      }      // Create the event
      const event = await backend.task.createCalendarEvent({
        title: data.title,
        description: data.description || undefined,
        location: data.location || undefined,
        startTime: startDateTime,
        endTime: endDateTime,
        isAllDay: data.isAllDay || false,
        color: data.color || "blue",
        recurrence: data.recurrence || "none",
        recurrenceEndDate: data.recurrenceEndDate ? new Date(data.recurrenceEndDate) : undefined,
        tags: data.tags || [],
      });

      // Notify parent
      onEventCreated(event);
      
      // Show success message
      showSuccess("Event created successfully");
      
      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create event:", error);
      showError("Failed to create event");
      throw error; // Re-throw to keep dialog open
    } finally {
      setIsLoading(false);
    }
  };

  const config: CRUDDialogConfig = {
    ...createEventDialogConfig,
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
// EDIT EVENT DIALOG
// ============================================================================

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent;
  onEventUpdated: (event: CalendarEvent) => void;
}

export function EditEventDialog({ open, onOpenChange, event, onEventUpdated }: EditEventDialogProps) {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Prepare the event data
      let startDateTime: Date;
      let endDateTime: Date;

      if (data.isAllDay) {
        startDateTime = new Date(`${data.startDate}T00:00:00`);
        endDateTime = new Date(`${data.endDate}T23:59:59`);
      } else {
        startDateTime = new Date(`${data.startDate}T${data.startTime}`);
        endDateTime = new Date(`${data.endDate}T${data.endTime}`);
      }      // Update the event
      const updatedEvent = await backend.task.updateCalendarEvent({
        id: event.id,
        title: data.title,
        description: data.description || undefined,
        location: data.location || undefined,
        startTime: startDateTime,
        endTime: endDateTime,
        isAllDay: data.isAllDay || false,
        color: data.color || "blue",
        recurrence: data.recurrence || "none",
        recurrenceEndDate: data.recurrenceEndDate ? new Date(data.recurrenceEndDate) : undefined,
        tags: data.tags || [],
      });

      // Notify parent
      onEventUpdated(updatedEvent);
      
      // Show success message
      showSuccess("Event updated successfully");
      
      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update event:", error);
      showError("Failed to update event");
      throw error; // Re-throw to keep dialog open
    } finally {
      setIsLoading(false);
    }
  };

  const config: CRUDDialogConfig = {
    ...editEventDialogConfig,
    initialData: formatEventForEdit(event),
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

export function useCreateEventDialog(onEventCreated: (event: CalendarEvent) => void) {
  const [open, setOpen] = useState(false);

  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);

  const dialog = (
    <CreateEventDialog
      open={open}
      onOpenChange={setOpen}
      onEventCreated={(event) => {
        onEventCreated(event);
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

export function useEditEventDialog(onEventUpdated: (event: CalendarEvent) => void) {
  const [open, setOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);

  const openDialog = (event: CalendarEvent) => {
    setEventToEdit(event);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEventToEdit(null);
  };

  const dialog = eventToEdit ? (
    <EditEventDialog
      open={open}
      onOpenChange={setOpen}
      event={eventToEdit}
      onEventUpdated={(event) => {
        onEventUpdated(event);
        closeDialog();
      }}
    />
  ) : null;

  return {
    openDialog,
    closeDialog,
    dialog,
    isOpen: open,
    eventToEdit,
  };
}
