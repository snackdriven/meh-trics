/**
 * Universal CRUD Dialog Component
 * 
 * This is the main dialog component that consolidates all CRUD dialogs in the app.
 * Instead of having separate CreateTaskDialog, CreateHabitDialog, etc., we use
 * this one flexible component with different configurations.
 */

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { fieldComponents } from "./FieldComponents";
import type { CRUDDialogConfig, FormData, ValidationErrors } from "./types";
import {
  getInitialFormData,
  validateForm,
  formatFormDataForSubmission,
} from "./types";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface UniversalCRUDDialogProps {
  config: CRUDDialogConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Record<string, any>;
  loading?: boolean;
}

export function UniversalCRUDDialog({
  config,
  open,
  onOpenChange,
  initialData,
  loading = false,
}: UniversalCRUDDialogProps) {
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when dialog opens or config changes
  useEffect(() => {
    if (open) {
      const initial = getInitialFormData(config.fields, initialData);
      setFormData(initial);
      setErrors({});
    }
  }, [open, config.fields, initialData]);
  // Handle field value changes
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev: FormData) => ({ ...prev, [fieldId]: value }));
      // Clear field error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev: ValidationErrors) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Validate form on submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(config.fields, formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }    setIsSubmitting(true);
    try {
      const submissionData = formatFormDataForSubmission(config.fields, formData);
      await config.onSubmit(submissionData);
      onOpenChange(false);
    } catch (error) {
      console.error('Form submission error:', error);
      // Handle error (could show toast notification)
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (!isSubmitting && !loading) {
      onOpenChange(false);
    }
  };

  // Determine if form is valid
  const isFormValid = Object.keys(validateForm(config.fields, formData)).length === 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          {config.description && (
            <DialogDescription>{config.description}</DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Render form sections */}          {config.sections ? (
            <div className="space-y-6">
              {config.sections.map((section, sectionIndex) => (
                <div key={section.title || sectionIndex} className="space-y-4">
                  {section.title && (
                    <>
                      <h3 className="text-lg font-medium">{section.title}</h3>
                      {section.description && (
                        <p className="text-sm text-muted-foreground">
                          {section.description}
                        </p>
                      )}
                      <Separator />
                    </>
                  )}
                    <div className={`grid gap-4 ${section.columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {section.fields.map((fieldId: string) => {
                      const field = config.fields.find(f => f.id === fieldId);
                      if (!field) return null;

                      const FieldComponent = fieldComponents[field.type];
                      if (!FieldComponent) {
                        console.warn(`Unknown field type: ${field.type}`);
                        return null;
                      }

                      return (
                        <FieldComponent
                          key={field.id}
                          field={field}
                          value={formData[field.id]}
                          onChange={(value) => handleFieldChange(field.id, value)}
                          error={errors[field.id]}
                          formData={formData}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (            // Render all fields in a simple grid if no sections defined
            <div className="grid gap-4">
              {config.fields.map((field) => {
                const FieldComponent = fieldComponents[field.type];
                if (!FieldComponent) {
                  console.warn(`Unknown field type: ${field.type}`);
                  return null;
                }

                return (
                  <FieldComponent
                    key={field.id}
                    field={field}
                    value={formData[field.id]}
                    onChange={(value) => handleFieldChange(field.id, value)}
                    error={errors[field.id]}
                    formData={formData}
                  />
                );
              })}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting || loading}
            >
              {isSubmitting || loading ? 'Saving...' : config.submitButtonText || 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// CONVENIENCE HOOKS AND UTILITIES
// ============================================================================

/**
 * Hook to manage dialog state and form submission
 */
export function useCRUDDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);

  const handleSubmit = async (submitFn: (data: any) => Promise<void>) => {
    return async (data: any) => {
      setLoading(true);
      try {
        await submitFn(data);
        closeDialog();
      } catch (error) {
        console.error('CRUD operation failed:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    };
  };

  return {
    open,
    loading,
    openDialog,
    closeDialog,
    handleSubmit,
  };
}
