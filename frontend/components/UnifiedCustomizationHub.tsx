import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { memo, useCallback } from "react";

interface UnifiedCustomizationHubProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Legacy props - no longer used but kept for compatibility
  tabPrefs?: Record<string, any>;
  tabOrder?: string[];
  onTabsSave?: (prefs: Record<string, any>, order: string[]) => void;
}

/**
 * Legacy Customization Hub - now redirects to Settings
 *
 * This component has been simplified to just show a redirect message.
 * All customization functionality has been moved to the main Settings page.
 *
 * Optimized with React.memo and useCallback for better performance.
 */
export const UnifiedCustomizationHub = memo<UnifiedCustomizationHubProps>(
  ({ open, onOpenChange }) => {
    // Stable callback to prevent unnecessary re-renders
    const handleGoToSettings = useCallback(() => {
      onOpenChange(false);
      // Navigate to settings - this would depend on your routing setup
      // For now, just close the dialog
    }, [onOpenChange]);

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Customization Hub
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium mb-2">Settings Moved!</h3>
              <p className="text-sm text-muted-foreground mb-3">
                All customization options have been moved to the main Settings tab for a better
                experience.
              </p>
              <Button onClick={handleGoToSettings} className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Go to Settings
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              You can find themes, content editing, mood options, and more in the Settings tab.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

UnifiedCustomizationHub.displayName = "UnifiedCustomizationHub";
