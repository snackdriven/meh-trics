import type { CRUDDialogConfig, FieldConfig } from "./types";

// Field configurations for journal template forms
export const journalTemplateFormFields: FieldConfig[] = [
  {
    id: "title",
    label: "Template Name",
    type: "text",
    required: true,
    maxLength: 200,
    placeholder: "e.g., Daily Reflection, Gratitude Practice",
    description: "A descriptive name for this journal template",
  },
  {
    id: "text",
    label: "Template Content",
    type: "textarea",
    required: true,
    rows: 8,
    placeholder:
      "Write your journal template here. Use prompts like:\n\n• What went well today?\n• What am I grateful for?\n• What could I improve tomorrow?\n\nUsers can fill this in when creating new journal entries.",
    description: "The template content with prompts or structure for journal entries",
  },
  {
    id: "tags",
    label: "Tags",
    type: "tags",
    description: "Categorize this template (e.g., reflection, gratitude, planning)",
    defaultValue: [],
  },
];

// Journal template creation dialog configuration
export const createJournalTemplateDialogConfig: CRUDDialogConfig = {
  title: "Create Journal Template",
  description: "Create a reusable template for journal entries",
  submitButtonText: "Create Template",
  fields: journalTemplateFormFields,
  sections: [
    {
      title: "Template Information",
      fields: ["title"],
    },
    {
      title: "Template Content",
      fields: ["text"],
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

// Journal template editing dialog configuration
export const editJournalTemplateDialogConfig: CRUDDialogConfig = {
  title: "Edit Journal Template",
  description: "Update your journal template",
  submitButtonText: "Update Template",
  fields: journalTemplateFormFields,
  sections: createJournalTemplateDialogConfig.sections,
  onSubmit: async (_data) => {
    // This will be implemented by the component using this config
    throw new Error("onSubmit must be implemented by the consuming component");
  },
};
