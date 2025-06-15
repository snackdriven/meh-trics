import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { commonTags } from "@/constants/tags";
import { X } from "lucide-react";
import type { EnergyLevel, TaskStatus } from "~backend/task/types";

interface TaskFiltersProps {
  filters: {
    status: TaskStatus | "";
    energyLevel: EnergyLevel | "";
    tags: string[];
  };
  onFiltersChange: (filters: any) => void;
}

export function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    updateFilter("tags", newTags);
  };

  const clearFilters = () => {
    onFiltersChange({
      status: "",
      energyLevel: "",
      tags: [],
    });
  };

  const hasActiveFilters =
    filters.status || filters.energyLevel || filters.tags.length > 0;

  return (
    <div className="space-y-4 p-4 bg-[var(--color-compassionate-celebration-subtle)] rounded-lg border border-[var(--color-compassionate-celebration)]">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-[var(--color-text-primary)]">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Status
          </label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              updateFilter("status", value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="bg-[var(--color-background-secondary)]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Energy Level
          </label>
          <Select
            value={filters.energyLevel}
            onValueChange={(value) =>
              updateFilter("energyLevel", value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="bg-[var(--color-background-secondary)]">
              <SelectValue placeholder="All energy levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All energy levels</SelectItem>
              <SelectItem value="high">High Energy</SelectItem>
              <SelectItem value="medium">Medium Energy</SelectItem>
              <SelectItem value="low">Low Energy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {commonTags.map((tag) => {
            const isSelected = filters.tags.includes(tag);
            return (
              <Button
                key={tag}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => toggleTag(tag)}
              >
                {tag}
                {isSelected && <X className="h-3 w-3 ml-1" />}
              </Button>
            );
          })}
        </div>

        {filters.tags.length > 0 && (
          <div className="mt-2">
            <span className="text-sm text-gray-600">Active tags: </span>
            {filters.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="ml-1">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
