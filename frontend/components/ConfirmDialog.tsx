import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { memo, useCallback, useMemo } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
}

export const ConfirmDialog = memo<ConfirmDialogProps>(function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "default",
}) {
  const handleConfirm = useCallback(() => {
    onConfirm();
    onOpenChange(false);
  }, [onConfirm, onOpenChange]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const isDestructive = useMemo(() => variant === "destructive", [variant]);

  const confirmButtonClassName = useMemo(() => {
    return isDestructive
      ? undefined
      : "bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/90";
  }, [isDestructive]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {isDestructive && <AlertTriangle className="h-6 w-6 text-red-600" />}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="text-left">{description}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            variant={isDestructive ? "destructive" : "default"}
            className={confirmButtonClassName}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
