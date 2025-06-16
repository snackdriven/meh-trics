import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Palette,
  Layout,
  Clock,
  Eye,
  Grid,
  Settings,
  Save,
  RotateCcw,
} from "lucide-react";

interface CalendarCustomizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: CalendarCustomizationSettings) => void;
}

export interface CalendarCustomizationSettings {
  // Display preferences
  defaultView: "day" | "3days" | "week" | "2weeks" | "month";
  startOfWeek: "sunday" | "monday";
  weekendHighlight: boolean;
  todayHighlight: boolean;

  // Color scheme
  colorScheme: "default" | "minimal" | "vibrant" | "pastel" | "dark" | "custom";
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };

  // Event display
  eventBadgeStyle: "rounded" | "square" | "pill";
  eventTextSize: "xs" | "sm" | "base";
  maxEventsPerDay: number;
  showEventTime: boolean;
  compactMode: boolean;

  // Layer visibility defaults
  defaultLayers: {
    tasks: boolean;
    moods: boolean;
    habits: boolean;
    routines: boolean;
    events: boolean;
    journals: boolean;
  };

  // Density and spacing
  cellPadding: "tight" | "normal" | "comfortable";
  showWeekNumbers: boolean;
  showMonthGrid: boolean;

  // Time format
  timeFormat: "12h" | "24h";
  dateFormat: "US" | "EU" | "ISO";

  // Advanced features
  enableDragDrop: boolean;
  enableQuickAdd: boolean;
  enableKeyboardShortcuts: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // minutes

  // Custom labels
  customLabels: {
    dayNames: string[];
    monthNames: string[];
    viewNames: {
      day: string;
      "3days": string;
      week: string;
      "2weeks": string;
      month: string;
    };
  };
}

const defaultSettings: CalendarCustomizationSettings = {
  defaultView: "month",
  startOfWeek: "sunday",
  weekendHighlight: true,
  todayHighlight: true,
  colorScheme: "default",
  customColors: {
    primary: "#3b82f6",
    secondary: "#64748b",
    accent: "#8b5cf6",
    background: "#ffffff",
    text: "#1f2937",
  },
  eventBadgeStyle: "rounded",
  eventTextSize: "sm",
  maxEventsPerDay: 3,
  showEventTime: true,
  compactMode: false,
  defaultLayers: {
    tasks: true,
    moods: true,
    habits: true,
    routines: true,
    events: true,
    journals: true,
  },
  cellPadding: "normal",
  showWeekNumbers: false,
  showMonthGrid: true,
  timeFormat: "12h",
  dateFormat: "US",
  enableDragDrop: true,
  enableQuickAdd: true,
  enableKeyboardShortcuts: true,
  autoRefresh: false,
  refreshInterval: 5,
  customLabels: {
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    monthNames: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    viewNames: {
      day: "Day",
      "3days": "3 Days",
      week: "Week",
      "2weeks": "2 Weeks",
      month: "Month",
    },
  },
};

export function CalendarCustomizationDialog({
  open,
  onOpenChange,
  onSave,
}: CalendarCustomizationDialogProps) {
  const [settings, setSettings] = useState<CalendarCustomizationSettings>(defaultSettings);

  useEffect(() => {
    if (open) {
      const savedSettings = localStorage.getItem("calendar-customization");
      if (savedSettings) {
        try {
          setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
        } catch (e) {
          console.error("Failed to load calendar settings:", e);
        }
      }
    }
  }, [open]);

  const handleSave = () => {
    localStorage.setItem("calendar-customization", JSON.stringify(settings));
    onSave(settings);
    onOpenChange(false);
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  const updateSetting = <K extends keyof CalendarCustomizationSettings>(
    key: K,
    value: CalendarCustomizationSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateNestedSetting = <T extends keyof CalendarCustomizationSettings>(
    parent: T,
    key: keyof CalendarCustomizationSettings[T],
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value,
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar Customization
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="display" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="display" className="flex items-center gap-1">
              <Layout className="h-4 w-4" />
              Display
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center gap-1">
              <Palette className="h-4 w-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Behavior
            </TabsTrigger>
            <TabsTrigger value="labels" className="flex items-center gap-1">
              <Grid className="h-4 w-4" />
              Labels
            </TabsTrigger>
          </TabsList>

          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>View Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Default Calendar View</Label>
                  <Select
                    value={settings.defaultView}
                    onValueChange={(value: any) => updateSetting("defaultView", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="3days">3 Days</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="2weeks">2 Weeks</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Start of Week</Label>
                  <Select
                    value={settings.startOfWeek}
                    onValueChange={(value: any) => updateSetting("startOfWeek", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">Sunday</SelectItem>
                      <SelectItem value="monday">Monday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Cell Padding</Label>
                  <Select
                    value={settings.cellPadding}
                    onValueChange={(value: any) => updateSetting("cellPadding", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tight">Tight</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Highlight Weekends</Label>
                  <Switch
                    checked={settings.weekendHighlight}
                    onCheckedChange={(checked) => updateSetting("weekendHighlight", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Highlight Today</Label>
                  <Switch
                    checked={settings.todayHighlight}
                    onCheckedChange={(checked) => updateSetting("todayHighlight", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Show Week Numbers</Label>
                  <Switch
                    checked={settings.showWeekNumbers}
                    onCheckedChange={(checked) => updateSetting("showWeekNumbers", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Show Month Grid</Label>
                  <Switch
                    checked={settings.showMonthGrid}
                    onCheckedChange={(checked) => updateSetting("showMonthGrid", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Default Layer Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(settings.defaultLayers).map(([layer, visible]) => (
                    <div key={layer} className="flex items-center justify-between">
                      <Label className="capitalize">{layer}</Label>
                      <Switch
                        checked={visible}
                        onCheckedChange={(checked) =>
                          updateNestedSetting(
                            "defaultLayers",
                            layer as keyof typeof settings.defaultLayers,
                            checked
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Scheme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Preset Schemes</Label>
                  <Select
                    value={settings.colorScheme}
                    onValueChange={(value: any) => updateSetting("colorScheme", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="vibrant">Vibrant</SelectItem>
                      <SelectItem value="pastel">Pastel</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.colorScheme === "custom" && (
                  <div className="space-y-3">
                    <Label>Custom Colors</Label>
                    {Object.entries(settings.customColors).map(([colorKey, colorValue]) => (
                      <div key={colorKey} className="flex items-center gap-3">
                        <Label className="w-20 capitalize">{colorKey}</Label>
                        <Input
                          type="color"
                          value={colorValue}
                          onChange={(e) =>
                            updateNestedSetting(
                              "customColors",
                              colorKey as keyof typeof settings.customColors,
                              e.target.value
                            )
                          }
                          className="w-12 h-8"
                        />
                        <Input
                          value={colorValue}
                          onChange={(e) =>
                            updateNestedSetting(
                              "customColors",
                              colorKey as keyof typeof settings.customColors,
                              e.target.value
                            )
                          }
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Display</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Badge Style</Label>
                  <Select
                    value={settings.eventBadgeStyle}
                    onValueChange={(value: any) => updateSetting("eventBadgeStyle", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="pill">Pill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Text Size</Label>
                  <Select
                    value={settings.eventTextSize}
                    onValueChange={(value: any) => updateSetting("eventTextSize", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xs">Extra Small</SelectItem>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="base">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Max Events Per Day: {settings.maxEventsPerDay}</Label>
                  <Slider
                    value={[settings.maxEventsPerDay]}
                    onValueChange={([value]) => updateSetting("maxEventsPerDay", value)}
                    min={1}
                    max={10}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Show Event Times</Label>
                  <Switch
                    checked={settings.showEventTime}
                    onCheckedChange={(checked) => updateSetting("showEventTime", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Compact Mode</Label>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => updateSetting("compactMode", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time & Date Format</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Time Format</Label>
                  <Select
                    value={settings.timeFormat}
                    onValueChange={(value: any) => updateSetting("timeFormat", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Date Format</Label>
                  <Select
                    value={settings.dateFormat}
                    onValueChange={(value: any) => updateSetting("dateFormat", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">US (MM/DD/YYYY)</SelectItem>
                      <SelectItem value="EU">European (DD/MM/YYYY)</SelectItem>
                      <SelectItem value="ISO">ISO (YYYY-MM-DD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interactive Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Drag & Drop</Label>
                  <Switch
                    checked={settings.enableDragDrop}
                    onCheckedChange={(checked) => updateSetting("enableDragDrop", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Enable Quick Add</Label>
                  <Switch
                    checked={settings.enableQuickAdd}
                    onCheckedChange={(checked) => updateSetting("enableQuickAdd", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Keyboard Shortcuts</Label>
                  <Switch
                    checked={settings.enableKeyboardShortcuts}
                    onCheckedChange={(checked) => updateSetting("enableKeyboardShortcuts", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Auto Refresh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Auto Refresh Data</Label>
                  <Switch
                    checked={settings.autoRefresh}
                    onCheckedChange={(checked) => updateSetting("autoRefresh", checked)}
                  />
                </div>

                {settings.autoRefresh && (
                  <div>
                    <Label>Refresh Interval: {settings.refreshInterval} minutes</Label>
                    <Slider
                      value={[settings.refreshInterval]}
                      onValueChange={([value]) => updateSetting("refreshInterval", value)}
                      min={1}
                      max={60}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="labels" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Labels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Day Names</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {settings.customLabels.dayNames.map((day, index) => (
                      <div key={index}>
                        <Label className="text-sm">
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index]}
                        </Label>
                        <Input
                          value={day}
                          onChange={(e) => {
                            const newDayNames = [...settings.customLabels.dayNames];
                            newDayNames[index] = e.target.value;
                            updateNestedSetting("customLabels", "dayNames", newDayNames);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">View Names</Label>
                  <div className="space-y-2 mt-2">
                    {Object.entries(settings.customLabels.viewNames).map(([key, value]) => (
                      <div key={key}>
                        <Label className="text-sm capitalize">{key.replace(/(\d+)/, " $1 ")}</Label>
                        <Input
                          value={value}
                          onChange={(e) =>
                            updateNestedSetting("customLabels", "viewNames", {
                              ...settings.customLabels.viewNames,
                              [key]: e.target.value,
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={resetToDefaults} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
