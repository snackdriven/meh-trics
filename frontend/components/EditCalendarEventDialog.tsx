import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { uiText } from "@/constants/uiText";
import { useEffect, useState } from "react";
import backend from "~backend/client";
import type { CalendarEvent, EventRecurrence } from "~backend/task/types";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useTagList } from "../hooks/useTagList";
import { useToast } from "../hooks/useToast";
import { LoadingSpinner } from "./LoadingSpinner";
import { TagSelector } from "./TagSelector";
import { eventColors } from "./eventColors";

interface EditCalendarEventDialogProps {
  event: CalendarEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventUpdated: (event: CalendarEvent) => void;
}

export function EditCalendarEventDialog({
  event,
  open,
  onOpenChange,
  onEventUpdated,
}: EditCalendarEventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [color, setColor] = useState("blue");
  const [recurrence, setRecurrence] = useState<EventRecurrence>("none");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const tagList = useTagList();

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");

      const startDateTime = new Date(event.startTime);
      const endDateTime = new Date(event.endTime);

      setStartDate(startDateTime.toISOString().split("T")[0]);
      setStartTime(startDateTime.toTimeString().slice(0, 5));
      setEndDate(endDateTime.toISOString().split("T")[0]);
      setEndTime(endDateTime.toTimeString().slice(0, 5));

      setIsAllDay(event.isAllDay);
      setLocation(event.location || "");
      setColor(event.color || "blue");
      setRecurrence(event.recurrence);
      setRecurrenceEndDate(
        event.recurrenceEndDate
          ? new Date(event.recurrenceEndDate).toISOString().split("T")[0]
          : "",
      );
      tagList.setTags(event.tags);
    }
  }, [event]);

  const { loading: submitting, execute: updateEvent } = useAsyncOperation(
    async () => {
      if (!title.trim()) {
        throw new Error("Event title is required");
      }

      let startDateTime: Date;
      let endDateTime: Date;

      if (isAllDay) {
        startDateTime = new Date(startDate + "T00:00:00");
        endDateTime = new Date(endDate + "T23:59:59");
      } else {
        startDateTime = new Date(startDate + "T" + startTime);
        endDateTime = new Date(endDate + "T" + endTime);
      }

      const updatedEvent = await backend.task.updateCalendarEvent({
        id: event.id,
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

      onEventUpdated(updatedEvent);

      return updatedEvent;
    },
    () => {
      showSuccess("Event updated successfully! 📅");
      onOpenChange(false);
    },
    (error) => showError(error, "Failed to Update Event"),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateEvent();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby="edit-event-desc"
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <DialogDescription id="edit-event-desc" className="sr-only">
          Update the details for this event.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={uiText.editEvent.titlePlaceholder}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={uiText.editEvent.descriptionPlaceholder}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allDay"
              checked={isAllDay}
              onCheckedChange={(checked) => setIsAllDay(checked === true)}
            />
            <Label htmlFor="allDay">{uiText.editEvent.allDayLabel}</Label>
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
              placeholder={uiText.editEvent.locationPlaceholder}
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
              {uiText.editEvent.cancel}
            </Button>
            <Button
              type="submit"
              disabled={submitting || !title.trim()}
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {uiText.editEvent.submitting}
                </>
              ) : (
                uiText.editEvent.submit
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
