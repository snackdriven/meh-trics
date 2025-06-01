import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  variant = "error" 
}: ErrorMessageProps) {
  const isError = variant === "error";
  
  return (
    <Card className={`${isError ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className={`h-5 w-5 mt-0.5 ${isError ? "text-red-600" : "text-yellow-600"}`} />
          <div className="flex-1">
            <h4 className={`font-medium ${isError ? "text-red-800" : "text-yellow-800"}`}>
              {title}
            </h4>
            <p className={`text-sm mt-1 ${isError ? "text-red-700" : "text-yellow-700"}`}>
              {message}
            </p>
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className={`mt-2 ${isError ? "border-red-300 text-red-700" : "border-yellow-300 text-yellow-700"}`}
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
