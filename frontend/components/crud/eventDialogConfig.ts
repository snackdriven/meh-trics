/**
 * Event Dialog Configuration
 * 
 * Configuration for create/edit event dialogs using the Universal CRUD Dialog.
 * This replaces the old CreateEventDialog/EditEventDialog components.
 */

import type { CRUDDialogConfig, FieldConfig } from "./types";

// Define the event form fields
export const eventFormFields: FieldConfig[] = [
  {
    id: "title",
    type: "text",
    label: "Event Title",
    required: true,
    placeholder: "Enter event title...",
    validation: {
      min: 1,
      max: 100,
    }
  },
  {
    id: "description",
    type: "textarea",
    label: "Description",
    placeholder: "Event description (optional)...",
    validation: {
      max: 500,
    }
  },
  {
    id: "location",
    type: "text",
    label: "Location",
    placeholder: "Event location (optional)...",
    validation: {
      max: 200,
    }
  },
  {
    id: "isAllDay",
    type: "checkbox",
    label: "All day event",
    defaultValue: false,
  },
  {
    id: "startDate",
    type: "date",
    label: "Start Date",
    required: true,
    validation: {
      min: 1, // Will need custom validation for date logic
    }
  },
  {
    id: "startTime",
    type: "text",
    label: "Start Time",
    placeholder: "09:00",
    defaultValue: "09:00",
    showWhen: (formData) => !formData.isAllDay,
    validation: {
      pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    }
  },
  {
    id: "endDate",
    type: "date",
    label: "End Date",
    required: true,
    validation: {
      min: 1,
    }
  },
  {
    id: "endTime",
    type: "text",
    label: "End Time",
    placeholder: "10:00",
    defaultValue: "10:00",
    showWhen: (formData) => !formData.isAllDay,
    validation: {
      pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    }
  },
  {
    id: "color",
    type: "select",
    label: "Color",
    defaultValue: "blue",
    options: [
      { value: "blue", label: "Blue" },
      { value: "green", label: "Green" },
      { value: "red", label: "Red" },
      { value: "purple", label: "Purple" },
      { value: "yellow", label: "Yellow" },
      { value: "pink", label: "Pink" },
      { value: "orange", label: "Orange" },
      { value: "gray", label: "Gray" }
    ]
  },
  {
    id: "recurrence",
    type: "select",
    label: "Repeat",
    defaultValue: "none",
    options: [
      { value: "none", label: "No repeat" },
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
      { value: "yearly", label: "Yearly" }
    ]
  },
  {
    id: "recurrenceEndDate",
    type: "date",
    label: "Repeat Until",
    description: "When should the recurring event stop?",
    showWhen: (formData) => formData.recurrence !== "none"
  },
  {
    id: "tags",
    type: "tags",
    label: "Tags",
    description: "Add tags to categorize this event",
    defaultValue: []
  }
];

// Event creation dialog configuration
export const createEventDialogConfig: CRUDDialogConfig = {
  title: "Create Event",
  description: "Create a new calendar event",
  submitButtonText: "Create Event",
  fields: eventFormFields,
  
  sections: [
    {
      title: "Event Details",
      fields: ["title", "description", "location"]
    },
    {
      title: "Date & Time", 
      fields: ["isAllDay", "startDate", "startTime", "endDate", "endTime"]
    },
    {
      title: "Appearance & Recurrence",
      fields: ["color", "recurrence", "recurrenceEndDate", "tags"]
    }
  ],

  // Will be set by the component using this config
  onSubmit: async () => {
    throw new Error("onSubmit must be provided by component");
  }
};

export const editEventDialogConfig: CRUDDialogConfig = {
  ...createEventDialogConfig,
  title: "Edit Event",
  description: "Update event details",
  submitButtonText: "Update Event"
};

// Helper function to format initial data for edit dialog
export function formatEventForEdit(event: any) {
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  
  return {
    title: event.title,
    description: event.description || "",
    location: event.location || "",
    isAllDay: event.isAllDay || false,
    startDate: startDate.toISOString().split("T")[0],
    startTime: event.isAllDay ? "09:00" : startDate.toTimeString().slice(0, 5),
    endDate: endDate.toISOString().split("T")[0],
    endTime: event.isAllDay ? "10:00" : endDate.toTimeString().slice(0, 5),
    color: event.color || "blue",
    recurrence: event.recurrence || "none",
    recurrenceEndDate: event.recurrenceEndDate ? new Date(event.recurrenceEndDate).toISOString().split("T")[0] : "",
    tags: event.tags || []
  };
}
