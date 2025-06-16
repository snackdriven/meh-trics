import type { CRUDDialogConfig, FieldConfig } from "./types";

// Field configurations for mood entry forms
export const moodFormFields: FieldConfig[] = [
  {
    id: "tier",
    label: "Primary Mood Tier",
    type: "select",
    required: true,
    options: [
      { value: "uplifted", label: "🟢 Uplifted / Energized" },
      { value: "neutral", label: "🟡 Neutral / Mixed / Alert" },
      { value: "heavy", label: "🔴 Heavy / Drained / Distressed" },
    ],
    description: "Select your primary mood category",
  },
  {
    id: "emoji",
    label: "Primary Mood Emoji",
    type: "emoji",
    required: true,
    description: "Choose an emoji that represents your mood",
  },
  {
    id: "label",
    label: "Primary Mood Label",
    type: "text",
    required: true,
    maxLength: 50,
    placeholder: "e.g., Happy, Focused, Tired",
    description: "Describe your primary mood in a word or two",
  },
  {
    id: "secondaryTier",
    label: "Secondary Mood Tier (Optional)",
    type: "select",
    options: [
      { value: "", label: "None" },
      { value: "uplifted", label: "🟢 Uplifted / Energized" },
      { value: "neutral", label: "🟡 Neutral / Mixed / Alert" },
      { value: "heavy", label: "🔴 Heavy / Drained / Distressed" },
    ],
    description: "Optional secondary mood category",
  },
  {
    id: "secondaryEmoji",
    label: "Secondary Mood Emoji",
    type: "emoji",
    description: "Optional emoji for secondary mood",
    showWhen: (formData) => !!formData.secondaryTier,
  },
  {
    id: "secondaryLabel",
    label: "Secondary Mood Label",
    type: "text",
    maxLength: 50,
    placeholder: "e.g., Anxious, Curious",
    description: "Describe your secondary mood",
    showWhen: (formData) => !!formData.secondaryTier,
  },
  {
    id: "date",
    label: "Date",
    type: "date",
    required: true,
    description: "When did you feel this way?",
  },
  {
    id: "tags",
    label: "Tags",
    type: "tags",
    description: "Add context tags (e.g., work, family, exercise)",
    defaultValue: [],
  },
  {
    id: "notes",
    label: "Notes",
    type: "textarea",
    rows: 3,
    maxLength: 1000,
    placeholder: "Add any additional notes about your mood...",
    description: "Optional notes about what influenced your mood",
  },
];

// Mood entry creation dialog configuration
export const createMoodDialogConfig: CRUDDialogConfig = {
  title: "Log Mood Entry",
  description: "Record how you're feeling right now",
  submitButtonText: "Save Mood",
  fields: moodFormFields,
  sections: [
    {
      title: "Primary Mood",
      fields: ["tier", "emoji", "label"],
    },
    {
      title: "Secondary Mood (Optional)",
      fields: ["secondaryTier", "secondaryEmoji", "secondaryLabel"],
    },
    {
      title: "Context",
      fields: ["date", "tags"],
      columns: 2,
    },
    {
      title: "Additional Notes",
      fields: ["notes"],
    },
  ],
  onSubmit: async (_data) => {
    // This will be implemented by the component using this config
    throw new Error("onSubmit must be implemented by the consuming component");
  },
};

// Mood entry editing dialog configuration
export const editMoodDialogConfig: CRUDDialogConfig = {
  title: "Edit Mood Entry",
  description: "Update your mood entry",
  submitButtonText: "Update Mood",
  fields: moodFormFields,
  sections: createMoodDialogConfig.sections,
  onSubmit: async (_data) => {
    // This will be implemented by the component using this config
    throw new Error("onSubmit must be implemented by the consuming component");
  },
};
