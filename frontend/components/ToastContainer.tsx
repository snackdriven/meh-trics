import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

interface Toast {
  id: string;
  title?: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

const iconStyles = {
  success: "text-green-600",
  error: "text-red-600",
  warning: "text-yellow-600",
  info: "text-blue-600",
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon = toastIcons[toast.type];

        return (
          <Card
            key={toast.id}
            className={`${toastStyles[toast.type]} shadow-lg animate-in slide-in-from-right-full`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 mt-0.5 ${iconStyles[toast.type]}`} />
                <div className="flex-1">
                  {toast.title && <h4 className="font-medium">{toast.title}</h4>}
                  <p className={`text-sm ${toast.title ? "mt-1" : ""}`}>{toast.message}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismiss(toast.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
