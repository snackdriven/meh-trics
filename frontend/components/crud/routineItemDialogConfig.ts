import type { CRUDDialogConfig, FieldConfig } from "./types";

// Field configurations for routine item forms
export const routineItemFormFields: FieldConfig[] = [
  {
    id: "name",
    label: "Routine Item Name",
    type: "text",
    required: true,
    maxLength: 200,
    placeholder: "e.g., Morning Stretch, Check Email, Meditation",
    description: "A clear, actionable name for this routine item",
  },
  {
    id: "emoji",
    label: "Icon",
    type: "emoji",
    required: true,
    defaultValue: "✅",
    description: "Choose an emoji icon to represent this routine item",
  },
  {
    id: "groupName",
    label: "Group Name",
    type: "text",
    maxLength: 100,
    placeholder: "e.g., Morning Routine, Work Setup, Evening Wind-down",
    description: "Optional group to organize related routine items together",
  },
  {
    id: "isActive",
    label: "Currently Active",
    type: "checkbox",
    defaultValue: true,
    description: "Whether this routine item should appear in daily tracking",
  },
  {
    id: "sortOrder",
    label: "Display Order",
    type: "number",
    min: 0,
    max: 1000,
    defaultValue: 0,
    description: "Order in which this item appears (lower numbers first)",
  },
];

// Routine item creation dialog configuration
export const createRoutineItemDialogConfig: CRUDDialogConfig = {
  title: "Create Routine Item",
  description: "Add a new item to your daily routine checklist",
  submitButtonText: "Create Item",
  fields: routineItemFormFields.filter((f) => f.id !== "sortOrder"), // Hide sort order on create
  sections: [
    {
      title: "Basic Information",
      fields: ["name", "emoji"],
      columns: 2,
    },
    {
      title: "Organization",
      fields: ["groupName"],
    },
    {
      title: "Settings",
      fields: ["isActive"],
    },
  ],
  onSubmit: async (_data) => {
    // This will be implemented by the component using this config
    throw new Error("onSubmit must be implemented by the consuming component");
  },
};

// Routine item editing dialog configuration
export const editRoutineItemDialogConfig: CRUDDialogConfig = {
  title: "Edit Routine Item",
  description: "Update your routine item",
  submitButtonText: "Update Item",
  fields: routineItemFormFields,
  sections: [
    {
      title: "Basic Information",
      fields: ["name", "emoji"],
      columns: 2,
    },
    {
      title: "Organization",
      fields: ["groupName"],
    },
    {
      title: "Settings",
      fields: ["isActive", "sortOrder"],
      columns: 2,
    },
  ],
  onSubmit: async (_data) => {
    // This will be implemented by the component using this config
    throw new Error("onSubmit must be implemented by the consuming component");
  },
};
