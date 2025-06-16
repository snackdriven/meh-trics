/**
 * Habit Dialog Configuration
 * 
 * This demonstrates how to configure the UniversalCRUDDialog for habit creation/editing.
 * This replaces the old CreateHabitDialog component.
 */

import type { CRUDDialogConfig, FieldConfig } from "./types";

// Define the habit form fields
export const habitFormFields: FieldConfig[] = [
  {
    id: "name",
    label: "Habit Name",
    type: "text",
    placeholder: "e.g., Drink 8 glasses of water",
    required: true,
    validation: {
      min: 1,
      max: 100,
    },
  },
  {
    id: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Add details about this habit...",
    rows: 2,
    validation: {
      max: 500,
    },
  },
  {
    id: "emoji",
    label: "Emoji",
    type: "emoji",
    defaultValue: "💪",
    description: "Choose an emoji to represent this habit",
  },
  {
    id: "frequency",
    label: "Frequency",
    type: "frequency",
    defaultValue: "daily",
    required: true,
    description: "How often do you want to do this habit?",
  },
  {
    id: "tags",
    label: "Tags",
    type: "tags",
    description: "Categorize your habit",
    defaultValue: [],
  },
  {
    id: "targetCount",
    label: "Target Count",
    type: "number",
    defaultValue: 1,
    min: 1,
    max: 100,
    description: "How many times per frequency period?",
  },
  {
    id: "startDate",
    label: "Start Date",
    type: "date",
    description: "When do you want to start this habit?",
  },
  {
    id: "active",
    label: "Currently active",
    type: "checkbox",
    defaultValue: true,
    showWhen: (formData) => {
      // Only show this option when editing an existing habit
      return !!formData.id;
    },
  },
];

// Habit creation dialog configuration
export const createHabitDialogConfig: CRUDDialogConfig = {
  title: "Create New Habit",
  description: "Start building a positive habit",
  submitButtonText: "Create Habit",
  fields: habitFormFields.filter(f => f.id !== "active"), // Don't show active field when creating
  sections: [
    {
      title: "Basic Information",
      fields: ["name", "description"],
    },
    {
      title: "Habit Details",
      fields: ["emoji", "frequency"],
      columns: 2,
    },
    {
      title: "Goals & Timing",
      fields: ["targetCount", "startDate"],
      columns: 2,
    },
    {
      title: "Organization",
      fields: ["tags"],
    },
  ],
  onSubmit: async (_data) => {
    // This will be implemented by the component using this config
    throw new Error("onSubmit must be implemented by the consuming component");
  },
};

// Habit editing dialog configuration
export const editHabitDialogConfig: CRUDDialogConfig = {
  title: "Edit Habit",
  description: "Update your habit details",
  submitButtonText: "Save Changes",
  fields: habitFormFields, // Include all fields when editing
  sections: [
    {
      title: "Basic Information",
      fields: ["name", "description"],
    },
    {
      title: "Habit Details",
      fields: ["emoji", "frequency"],
      columns: 2,
    },
    {
      title: "Goals & Timing",
      fields: ["targetCount", "startDate"],
      columns: 2,
    },
    {
      title: "Organization",
      fields: ["tags"],
    },
    {
      title: "Status",
      fields: ["active"],
    },
  ],
  onSubmit: async (_data) => {
    // This will be implemented by the component using this config
    throw new Error("onSubmit must be implemented by the consuming component");
  },
};

// Usage example:
/*
import { UniversalCRUDDialog, useCRUDDialog } from "./crud/UniversalCRUDDialog";
import { createHabitDialogConfig } from "./crud/habitDialogConfig";

function HabitManager() {
  const { open, loading, openDialog, closeDialog, handleSubmit } = useCRUDDialog();

  const config: CRUDDialogConfig = {
    ...createHabitDialogConfig,
    onSubmit: handleSubmit(async (data) => {
      // Your API call here
      await createHabit(data);
    }),
  };

  return (
    <>
      <Button onClick={openDialog}>Create Habit</Button>
      <UniversalCRUDDialog
        config={config}
        open={open}
        onOpenChange={closeDialog}
        loading={loading}
      />
    </>
  );
}
*/
