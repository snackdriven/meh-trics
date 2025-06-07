import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

import { uiText } from "@/constants/uiText";
import backend from "~backend/client";
import type { CalendarEvent, EventRecurrence } from "~backend/task/types";
import { useTagList } from "../hooks/useTagList";
import { TagSelector } from "./TagSelector";
import { eventColors } from "./eventColors";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated: (event: CalendarEvent) => void;
}

export function CreateEventDialog({
  open,
  onOpenChange,
  onEventCreated,
}: CreateEventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endTime, setEndTime] = useState("10:00");
  const [isAllDay, setIsAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [color, setColor] = useState("blue");
  const [recurrence, setRecurrence] = useState<EventRecurrence>("none");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const tagList = useTagList();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      let startDateTime: Date;
      let endDateTime: Date;

      if (isAllDay) {
        startDateTime = new Date(startDate + "T00:00:00");
        endDateTime = new Date(endDate + "T23:59:59");
      } else {
        startDateTime = new Date(startDate + "T" + startTime);
        endDateTime = new Date(endDate + "T" + endTime);
      }

      const event = await backend.task.createCalendarEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        startTime: startDateTime,
        endTime: endDateTime,
        isAllDay,
        location: location.trim() || undefined,
        color,
        recurrence,
        recurrenceEndDate: recurrenceEndDate
          ? new Date(recurrenceEndDate)
          : undefined,
        tags: tagList.tags,
      });

      onEventCreated(event);

      // Reset form
      setTitle("");
      setDescription("");
      setStartDate(new Date().toISOString().split("T")[0]);
      setStartTime("09:00");
      setEndDate(new Date().toISOString().split("T")[0]);
      setEndTime("10:00");
      setIsAllDay(false);
      setLocation("");
      setColor("blue");
      setRecurrence("none");
      setRecurrenceEndDate("");
      tagList.reset();
    } catch (error) {
      console.error("Failed to create event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={uiText.createEvent.titlePlaceholder}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={uiText.createEvent.descriptionPlaceholder}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allDay"
              checked={isAllDay}
              onCheckedChange={(checked) => setIsAllDay(checked === true)}
            />
            <Label htmlFor="allDay">{uiText.createEvent.allDayLabel}</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            {!isAllDay && (
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                required
              />
            </div>

            {!isAllDay && (
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={uiText.createEvent.locationPlaceholder}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="color">Color</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventColors.map((colorOption) => (
                    <SelectItem
                      key={colorOption.value}
                      value={colorOption.value}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded ${colorOption.class}`}
                        />
                        {colorOption.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="recurrence">Repeat</Label>
              <Select
                value={recurrence}
                onValueChange={(value) =>
                  setRecurrence(value as EventRecurrence)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No repeat</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {recurrence !== "none" && (
            <div>
              <Label htmlFor="recurrenceEndDate">Repeat Until (optional)</Label>
              <Input
                id="recurrenceEndDate"
                type="date"
                value={recurrenceEndDate}
                onChange={(e) => setRecurrenceEndDate(e.target.value)}
                min={startDate}
              />
            </div>
          )}

          <TagSelector tagList={tagList} />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {uiText.createEvent.cancel}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSubmitting
                ? uiText.createEvent.submitting
                : uiText.createEvent.submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
