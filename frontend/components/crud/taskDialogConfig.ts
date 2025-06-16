/**
 * Task Dialog Configuration
 *
 * This demonstrates how to configure the UniversalCRUDDialog for task creation/editing.
 * This replaces the old CreateTaskDialog component.
 */

import type { CRUDDialogConfig, FieldConfig } from "./types";

// Define the task form fields
export const taskFormFields: FieldConfig[] = [
  {
    id: "title",
    label: "Title",
    type: "text",
    placeholder: "Enter task title...",
    required: true,
    validation: {
      min: 1,
      max: 200,
    },
  },
  {
    id: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Add task details...",
    rows: 3,
    validation: {
      max: 1000,
    },
  },
  {
    id: "priority",
    label: "Priority",
    type: "priority",
    defaultValue: "medium",
    description: "How important is this task?",
  },
  {
    id: "energy",
    label: "Energy Level",
    type: "energy",
    defaultValue: "medium",
    description: "How much energy will this require?",
  },
  {
    id: "dueDate",
    label: "Due Date",
    type: "date",
    description: "When should this be completed?",
  },
  {
    id: "tags",
    label: "Tags",
    type: "tags",
    description: "Categorize your task",
    defaultValue: [],
  },
  {
    id: "completed",
    label: "Mark as completed",
    type: "checkbox",
    defaultValue: false,
    showWhen: (formData) => {
      // Only show this option when editing an existing task
      return !!formData.id;
    },
  },
];

// Task creation dialog configuration
export const createTaskDialogConfig: CRUDDialogConfig = {
  title: "Create New Task",
  description: "Add a new task to your list",
  submitButtonText: "Create Task",
  fields: taskFormFields.filter((f) => f.id !== "completed"), // Don't show completed field when creating
  sections: [
    {
      title: "Basic Information",
      fields: ["title", "description"],
    },
    {
      title: "Task Details",
      fields: ["priority", "energy"],
      columns: 2,
    },
    {
      title: "Scheduling & Organization",
      fields: ["dueDate", "tags"],
    },
  ],
  onSubmit: async (_data) => {
    // This will be implemented by the component using this config
    throw new Error("onSubmit must be implemented by the consuming component");
  },
};

// Task editing dialog configuration
export const editTaskDialogConfig: CRUDDialogConfig = {
  title: "Edit Task",
  description: "Update your task details",
  submitButtonText: "Save Changes",
  fields: taskFormFields, // Include all fields when editing
  sections: [
    {
      title: "Basic Information",
      fields: ["title", "description"],
    },
    {
      title: "Task Details",
      fields: ["priority", "energy"],
      columns: 2,
    },
    {
      title: "Scheduling & Organization",
      fields: ["dueDate", "tags"],
    },
    {
      title: "Status",
      fields: ["completed"],
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
import { createTaskDialogConfig } from "./crud/taskDialogConfig";

function TaskManager() {
  const { open, loading, openDialog, closeDialog, handleSubmit } = useCRUDDialog();

  const config: CRUDDialogConfig = {
    ...createTaskDialogConfig,
    onSubmit: handleSubmit(async (data) => {
      // Your API call here
      await createTask(data);
    }),
  };

  return (
    <>
      <Button onClick={openDialog}>Create Task</Button>
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
