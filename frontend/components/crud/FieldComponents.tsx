/**
 * Universal Field Components
 *
 * These components handle rendering different field types within the CRUD dialog.
 * Each field type has its own specialized component but shares a common interface.
 */

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { commonTags } from "@/constants/tags";
import { useEffect } from "react";
import { useTagList } from "@/hooks/useTagList";
import { EmojiPicker } from "../EmojiPicker";
import { TagSelector } from "../TagSelector";
import type { FieldComponentProps } from "./types";

// ============================================================================
// FIELD COMPONENT REGISTRY
// ============================================================================

export const fieldComponents: Record<string, React.ComponentType<FieldComponentProps>> = {
  text: TextField,
  textarea: TextAreaField,
  select: SelectField,
  checkbox: CheckboxField,
  date: DateField,
  number: NumberField,
  email: EmailField,
  emoji: EmojiField,
  tags: TagsField,
  priority: PriorityField,
  energy: EnergyField,
  frequency: FrequencyField,
};

// ============================================================================
// BASIC INPUT FIELDS
// ============================================================================

function TextField({ field, value, onChange, error }: FieldComponentProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={field.id}
        type="text"
        placeholder={field.placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={error ? "border-red-500" : ""}
      />
      {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function TextAreaField({ field, value, onChange, error }: FieldComponentProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea
        id={field.id}
        placeholder={field.placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={field.rows || 3}
        aria-invalid={!!error}
        className={error ? "border-red-500" : ""}
      />
      {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function NumberField({ field, value, onChange, error }: FieldComponentProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={field.id}
        type="number"
        placeholder={field.placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
        min={field.min}
        max={field.max}
        aria-invalid={!!error}
        className={error ? "border-red-500" : ""}
      />
      {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function EmailField({ field, value, onChange, error }: FieldComponentProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={field.id}
        type="email"
        placeholder={field.placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={error ? "border-red-500" : ""}
      />
      {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function DateField({ field, value, onChange, error }: FieldComponentProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={field.id}
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={error ? "border-red-500" : ""}
      />
      {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function CheckboxField({ field, value, onChange, error }: FieldComponentProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={field.id}
          checked={!!value}
          onCheckedChange={onChange}
          aria-invalid={!!error}
        />
        <Label htmlFor={field.id}>
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      {field.description && (
        <p className="text-sm text-muted-foreground ml-6">{field.description}</p>
      )}
      {error && <p className="text-sm text-red-500 ml-6">{error}</p>}
    </div>
  );
}

function SelectField({ field, value, onChange, error }: FieldComponentProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value?.toString() || ""} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={field.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// ============================================================================
// SPECIALIZED FIELDS
// ============================================================================

function EmojiField({ field, value, onChange, error }: FieldComponentProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <EmojiPicker value={value || "🥅"} onChange={onChange} />
      {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function TagsField({ field, value, onChange, error }: FieldComponentProps) {
  const tags = Array.isArray(value) ? value : [];
  const tagList = useTagList(tags);

  // Sync the tagList changes with the form
  useEffect(() => {
    if (JSON.stringify(tagList.tags) !== JSON.stringify(tags)) {
      onChange(tagList.tags);
    }
  }, [tagList.tags, tags, onChange]);

  return (
    <div className="space-y-2">
      <TagSelector
        tagList={tagList}
        label={field.label}
        suggestions={commonTags}
        allowCustom={true}
      />
      {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function PriorityField({ field, value, onChange, error }: FieldComponentProps) {
  const priorityOptions = [
    { value: 1, label: "Lowest", description: "When you have time" },
    { value: 2, label: "Low", description: "Not urgent" },
    { value: 3, label: "Medium", description: "Normal priority" },
    { value: 4, label: "High", description: "Important" },
    { value: 5, label: "Urgent", description: "Drop everything" },
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value?.toString() || "3"} onValueChange={(val) => onChange(Number(val))}>
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder="Select priority" />
        </SelectTrigger>
        <SelectContent>
          {priorityOptions.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              <div>
                <div>{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function EnergyField({ field, value, onChange, error }: FieldComponentProps) {
  const energyOptions = [
    { value: "low", label: "Low Energy", description: "Simple, easy tasks" },
    { value: "medium", label: "Medium Energy", description: "Normal focus required" },
    { value: "high", label: "High Energy", description: "Deep work, high focus" },
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder="Select energy level" />
        </SelectTrigger>
        <SelectContent>
          {energyOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div>
                <div>{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function FrequencyField({ field, value, onChange, error }: FieldComponentProps) {
  const frequencyOptions = [
    { value: "daily", label: "Daily", description: "Every day" },
    { value: "weekly", label: "Weekly", description: "Once per week" },
    { value: "monthly", label: "Monthly", description: "Once per month" },
    { value: "custom", label: "Custom", description: "Custom schedule" },
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value || "daily"} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder="Select frequency" />
        </SelectTrigger>
        <SelectContent>
          {frequencyOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div>
                <div>{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
