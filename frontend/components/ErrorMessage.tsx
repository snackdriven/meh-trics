import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, X } from "lucide-react";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  variant?: "error" | "warning";
}

export function ErrorMessage({
  title = "Error",
  message,
  onDismiss,
  onRetry,
  variant = "error",
}: ErrorMessageProps) {
  const isError = variant === "error";

  return (
    <Card
      className={`${isError ? "bg-[var(--color-semantic-error-bg)] border-[var(--color-semantic-error-border)]" : "bg-[var(--color-semantic-warning-bg)] border-[var(--color-semantic-warning-border)]"}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className={`h-5 w-5 mt-0.5 ${isError ? "text-[var(--color-semantic-error)]" : "text-[var(--color-semantic-warning)]"}`}
          />
          <div className="flex-1">
            <h4
              className={`font-medium ${isError ? "text-[var(--color-semantic-error-text)]" : "text-[var(--color-semantic-warning-text)]"}`}
            >
              {title}
            </h4>
            <p
              className={`text-sm mt-1 ${isError ? "text-[var(--color-semantic-error-text)]" : "text-[var(--color-semantic-warning-text)]"}`}
            >
              {message}
            </p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className={`mt-2 ${isError ? "border-[var(--color-semantic-error-border)] text-[var(--color-semantic-error-text)]" : "border-[var(--color-semantic-warning-border)] text-[var(--color-semantic-warning-text)]"}`}
              >
                Try again
              </Button>
            )}
          </div>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
