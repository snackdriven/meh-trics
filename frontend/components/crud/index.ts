/**
 * Universal CRUD Dialog Framework - Main Exports
 * 
 * This is the main entry point for the consolidated dialog system.
 * Import from here to get access to all the universal dialog components.
 */

// Main dialog component and hook
export { UniversalCRUDDialog, useCRUDDialog } from "./UniversalCRUDDialog";

// Types for building custom configurations
export type {
  FieldType,
  FieldConfig,
  FormSection,
  CRUDDialogConfig,
  FormData,
  ValidationErrors,
  FieldComponentProps,
  FieldComponent,
  SelectOption,
} from "./types";

// Utilities for validation and form handling
export {
  validateField,
  validateForm,
  getInitialFormData,
  getDefaultFormData,
  formatFormDataForSubmission,
  commonValidators,
  ValidationError,
} from "./types";

// Pre-built configurations for common dialogs
export {
  taskFormFields,
  createTaskDialogConfig,
  editTaskDialogConfig,
} from "./taskDialogConfig";

export {
  habitFormFields,
  createHabitDialogConfig,
  editHabitDialogConfig,
} from "./habitDialogConfig";

// Field components (if needed for custom implementations)
export { fieldComponents } from "./FieldComponents";
