import type { CRUDDialogConfig, FieldConfig } from "./types";

// Field configurations for journal entry forms
export const journalEntryFormFields: FieldConfig[] = [
  {
    id: "text",
    label: "Journal Entry",
    type: "textarea",
    required: true,
    rows: 10,
    placeholder: "What's on your mind? Share your thoughts, experiences, or reflections...",
    description: "Write your journal entry. Markdown formatting is supported.",
  },
  {
    id: "date",
    label: "Entry Date",
    type: "date",
    description: "The date for this journal entry (defaults to today)",
  },
  {
    id: "tags",
    label: "Tags",
    type: "tags",
    description: "Add tags to categorize this entry (e.g., work, personal, reflection)",
    defaultValue: [],
  },
  {
    id: "moodId",
    label: "Link to Mood Entry",
    type: "number",
    description: "Optionally link this journal entry to a specific mood entry",
  },
  {
    id: "taskId",
    label: "Link to Task",
    type: "number",
    description: "Optionally link this journal entry to a specific task",
  },
  {
    id: "habitEntryId",
    label: "Link to Habit Entry",
    type: "number",
    description: "Optionally link this journal entry to a specific habit entry",
  },
];

// Journal entry creation dialog configuration
export const createJournalEntryDialogConfig: CRUDDialogConfig = {
  title: "Create Journal Entry",
  description: "Record your thoughts and experiences",
  submitButtonText: "Save Entry",
  fields: journalEntryFormFields.filter(
    (f) => !["moodId", "taskId", "habitEntryId"].includes(f.id)
  ), // Hide linking fields in simple create
  sections: [
    {
      title: "Entry Content",
      fields: ["text"],
    },
    {
      title: "Entry Details",
      fields: ["date", "tags"],
      columns: 2,
    },
  ],
  onSubmit: async (_data) => {
    // This will be implemented by the component using this config
    throw new Error("onSubmit must be implemented by the consuming component");
  },
};

// Journal entry editing dialog configuration
export const editJournalEntryDialogConfig: CRUDDialogConfig = {
  title: "Edit Journal Entry",
  description: "Update your journal entry",
  submitButtonText: "Update Entry",
  fields: journalEntryFormFields,
  sections: [
    {
      title: "Entry Content",
      fields: ["text"],
    },
    {
      title: "Entry Details",
      fields: ["date", "tags"],
      columns: 2,
    },
    {
      title: "Links (Optional)",
      fields: ["moodId", "taskId", "habitEntryId"],
      columns: 2,
    },
  ],
  onSubmit: async (_data) => {
    // This will be implemented by the component using this config
    throw new Error("onSubmit must be implemented by the consuming component");
  },
};
