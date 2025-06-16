/**
 * Universal CRUD Dialog Framework
 * 
 * This framework consolidates all the duplicate dialog patterns across the app
 * into a single, configurable system. Instead of 19+ separate dialog components,
 * we use one flexible component with different configurations.
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type FieldType = 
  | "text" 
  | "textarea" 
  | "select" 
  | "checkbox" 
  | "date" 
  | "number" 
  | "email"
  | "emoji"
  | "tags"
  | "priority"
  | "energy"
  | "frequency";

export interface SelectOption {
  label: string;
  value: string | number;
  description?: string;
}

export interface FieldConfig {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  description?: string;
  
  // Type-specific options
  options?: SelectOption[];           // for select fields
  min?: number;                      // for number fields
  max?: number;                      // for number fields
  multiline?: boolean;               // for textarea height
  rows?: number;                     // for textarea rows
  
  // Validation
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
  
  // Conditional display
  showWhen?: (formData: Record<string, any>) => boolean;
  
  // Default value
  defaultValue?: any;
}

export interface FormSection {
  title?: string;
  description?: string;
  fields: string[];
  columns?: 1 | 2;
}

export type FormData = Record<string, any>;
export type ValidationErrors = Record<string, string>;

export interface CRUDDialogConfig<TData = any, TSubmitData = any> {
  // Dialog appearance
  title: string;
  description?: string;
  submitButtonText?: string;
  cancelText?: string;
  
  // Form configuration
  fields: FieldConfig[];
  sections?: FormSection[];
  
  // Data handling
  initialData?: Partial<TData>;
  onSubmit: (data: TSubmitData) => Promise<void>;
  onSuccess?: (data: any) => void;
  
  // Validation
  validateForm?: (data: Record<string, any>) => Record<string, string>;
  
  // UI customization
  size?: "sm" | "md" | "lg" | "xl";
  submitVariant?: "default" | "destructive";
  showSubmitSpinner?: boolean;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export const commonValidators = {
  required: (value: any) => {
    if (value === null || value === undefined || value === "") {
      return "This field is required";
    }
    return null;
  },
  
  minLength: (min: number) => (value: string) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return null;
  },
  
  maxLength: (max: number) => (value: string) => {
    if (value && value.length > max) {
      return `Must be no more than ${max} characters`;
    }
    return null;
  },
  
  email: (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Please enter a valid email address";
    }
    return null;
  },
  
  url: (value: string) => {
    if (value && !/^https?:\/\/.+/.test(value)) {
      return "Please enter a valid URL";
    }
    return null;
  },
  
  number: (value: any) => {
    if (value !== "" && (isNaN(Number(value)) || Number(value) < 0)) {
      return "Please enter a valid number";
    }
    return null;
  },
  
  positiveNumber: (value: any) => {
    if (value !== "" && (isNaN(Number(value)) || Number(value) <= 0)) {
      return "Please enter a positive number";
    }
    return null;
  }
};

// ============================================================================
// FIELD COMPONENT TYPES
// ============================================================================

export interface FieldComponentProps {
  field: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  formData: Record<string, any>;
}

export type FieldComponent = React.ComponentType<FieldComponentProps>;

// ============================================================================
// FORM DATA UTILITIES
// ============================================================================

export function validateField(field: FieldConfig, value: any): string | null {
  // Required validation
  if (field.required) {
    const requiredError = commonValidators.required(value);
    if (requiredError) return requiredError;
  }
  
  // Skip other validations if field is empty and not required
  if (!field.required && (value === "" || value === null || value === undefined)) {
    return null;
  }
  
  // Type-specific validation
  if (field.validation) {
    const { min, max, pattern, custom } = field.validation;
    
    if (min !== undefined && Number(value) < min) {
      return `Must be at least ${min}`;
    }
    
    if (max !== undefined && Number(value) > max) {
      return `Must be no more than ${max}`;
    }
    
    if (pattern && !pattern.test(String(value))) {
      return "Invalid format";
    }
    
    if (custom) {
      const customError = custom(value);
      if (customError) return customError;
    }
  }
  
  return null;
}

export function validateForm(
  fields: FieldConfig[], 
  formData: Record<string, any>,
  customValidator?: (data: Record<string, any>) => Record<string, string>
): Record<string, string> {
  const errors: Record<string, string> = {};
  
  // Validate individual fields
  for (const field of fields) {
    // Skip if field is conditionally hidden
    if (field.showWhen && !field.showWhen(formData)) {
      continue;
    }
    
    const error = validateField(field, formData[field.id]);
    if (error) {
      errors[field.id] = error;
    }
  }
  
  // Custom form-level validation
  if (customValidator) {
    const customErrors = customValidator(formData);
    Object.assign(errors, customErrors);
  }
  
  return errors;
}

export function getInitialFormData(fields: FieldConfig[], initialData?: Record<string, any>): FormData {
  const data: FormData = {};
  
  for (const field of fields) {
    if (initialData && initialData[field.id] !== undefined) {
      data[field.id] = initialData[field.id];
    } else if (field.defaultValue !== undefined) {
      data[field.id] = field.defaultValue;
    } else {
      // Set sensible defaults based on field type
      switch (field.type) {
        case "checkbox":
          data[field.id] = false;
          break;
        case "number":
          data[field.id] = field.min || 0;
          break;
        case "tags":
          data[field.id] = [];
          break;
        case "select":
          data[field.id] = field.options?.[0]?.value || "";
          break;
        default:
          data[field.id] = "";
      }
    }
  }
  
  return data;
}

export function formatFormDataForSubmission(fields: FieldConfig[], formData: FormData): any {
  const result: any = {};
  
  for (const field of fields) {
    const value = formData[field.id];
    
    // Skip if field is conditionally hidden
    if (field.showWhen && !field.showWhen(formData)) {
      continue;
    }
    
    // Apply any type-specific formatting
    switch (field.type) {
      case "number":
        result[field.id] = value ? Number(value) : null;
        break;
      case "date":
        result[field.id] = value ? new Date(value) : null;
        break;
      case "checkbox":
        result[field.id] = Boolean(value);
        break;
      default:
        result[field.id] = value;
    }
  }
  
  return result;
}

export function getDefaultFormData(fields: FieldConfig[]): Record<string, any> {
  const data: Record<string, any> = {};
  
  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      data[field.id] = field.defaultValue;
    } else {
      // Set sensible defaults based on field type
      switch (field.type) {
        case "checkbox":
          data[field.id] = false;
          break;
        case "number":
          data[field.id] = field.min || 0;
          break;
        case "tags":
          data[field.id] = [];
          break;
        case "select":
          data[field.id] = field.options?.[0]?.value || "";
          break;
        default:
          data[field.id] = "";
      }
    }
  }
  
  return data;
}
