import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { CalendarView } from "../hooks/useCalendarData";
import type { CalendarLayers } from "../hooks/useCalendarLayers";

interface CalendarHeaderProps {
  viewTitle: string;
  calendarView: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onPrev: () => void;
  onNext: () => void;
  layers: CalendarLayers;
  toggleLayer: (key: keyof CalendarLayers) => void;
  onAddEvent: () => void;
  onImport: () => void;
}

export function CalendarHeader({
  viewTitle,
  calendarView,
  onViewChange,
  onPrev,
  onNext,
  layers,
  toggleLayer,
  onAddEvent,
  onImport,
}: CalendarHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CardTitle className="text-2xl">{viewTitle}</CardTitle>
          <Select
            value={calendarView}
            onValueChange={(v) => onViewChange(v as CalendarView)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3days">3 Days</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="2weeks">2 Weeks</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onAddEvent}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Event
          </Button>
          <Button variant="outline" size="sm" onClick={onImport}>
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-sm mb-2">
        {(Object.keys(layers) as Array<keyof typeof layers>).map((key) => (
          <Label key={key} className="flex items-center gap-1">
            <Checkbox
              checked={layers[key]}
              onCheckedChange={() => toggleLayer(key)}
            />
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Label>
        ))}
      </div>
    </CardHeader>
  );
}
