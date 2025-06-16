import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Palette, Type, Calendar, Download, Upload, RotateCcw } from "lucide-react";

// Consolidated customization interface
interface UnifiedCustomizationHubProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnifiedCustomizationHub({ open, onOpenChange }: UnifiedCustomizationHubProps) {
  const [activeTab, setActiveTab] = useState("appearance");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Customization Hub
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Settings
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import Settings
              </Button>
              <Button variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full">
          {/* Sidebar Navigation */}
          <TabsList className="flex flex-col h-full w-48 bg-muted/50 p-2">
            <TabsTrigger value="appearance" className="w-full justify-start">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="content" className="w-full justify-start">
              <Type className="h-4 w-4 mr-2" />
              Content & Copy
            </TabsTrigger>
            <TabsTrigger value="calendar" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="behavior" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Behavior
            </TabsTrigger>
          </TabsList>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="appearance" className="mt-0">
              {/* Unified Theme Editor */}
              <AppearanceCustomization />
            </TabsContent>
            
            <TabsContent value="content" className="mt-0">
              {/* Copy, Moods, Tags, Labels */}
              <ContentCustomization />
            </TabsContent>
            
            <TabsContent value="calendar" className="mt-0">
              {/* Calendar-specific settings */}
              <CalendarCustomization />
            </TabsContent>
            
            <TabsContent value="behavior" className="mt-0">
              {/* Keyboard shortcuts, notifications, etc. */}
              <BehaviorCustomization />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Placeholder components for each customization area
function AppearanceCustomization() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Theme & Appearance</h3>
      {/* Progressive disclosure: Simple -> Advanced */}
      <div className="space-y-4">
        {/* Basic theme selection */}
        {/* Color customization */}
        {/* Typography settings */}
        {/* Layout preferences */}
      </div>
    </div>
  );
}

function ContentCustomization() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Content & Copy</h3>
      {/* All text customization consolidated */}
    </div>
  );
}

function CalendarCustomization() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Calendar Settings</h3>
      {/* Calendar-specific options */}
    </div>
  );
}

function BehaviorCustomization() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Behavior & Interaction</h3>
      {/* Keyboard shortcuts, auto-refresh, etc. */}
    </div>
  );
}