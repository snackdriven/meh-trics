import type { CalendarEvent, EventRecurrence } from "../task/types";

function addInterval(date: Date, recurrence: EventRecurrence): Date {
  const d = new Date(date);
  switch (recurrence) {
    case "daily":
      d.setDate(d.getDate() + 1);
      break;
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d;
}

export function expandEvent(
  event: CalendarEvent,
  rangeStart: Date,
  rangeEnd: Date,
): CalendarEvent[] {
  if (event.recurrence === "none") return [event];

  const occurrences: CalendarEvent[] = [];
  const duration = event.endTime.getTime() - event.startTime.getTime();
  let nextStart = new Date(event.startTime);
  const endLimit = event.recurrenceEndDate
    ? new Date(event.recurrenceEndDate)
    : rangeEnd;
  if (event.recurrenceEndDate) {
    endLimit.setHours(23, 59, 59, 999);
  }

  while (nextStart <= rangeEnd && nextStart <= endLimit) {
    const nextEnd = new Date(nextStart.getTime() + duration);
    if (nextEnd >= rangeStart && nextStart <= rangeEnd) {
      occurrences.push({
        ...event,
        startTime: new Date(nextStart),
        endTime: nextEnd,
      });
    }
    nextStart = addInterval(nextStart, event.recurrence);
  }

  return occurrences;
}
