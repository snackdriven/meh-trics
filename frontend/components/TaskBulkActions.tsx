import { Button } from "@/components/ui/button";

interface TaskBulkActionsProps {
  selectedCount: number;
  onComplete: () => void;
  onTag: () => void;
  onReschedule: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export function TaskBulkActions({
  selectedCount,
  onComplete,
  onTag,
  onReschedule,
  onDelete,
  onClear,
}: TaskBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-600">{selectedCount} selected</span>
      <Button size="sm" onClick={onComplete}>
        Complete
      </Button>
      <Button size="sm" onClick={onTag}>
        Tag
      </Button>
      <Button size="sm" onClick={onReschedule}>
        Reschedule
      </Button>
      <Button size="sm" variant="destructive" onClick={onDelete}>
        Delete
      </Button>
      <Button size="sm" variant="outline" onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}
