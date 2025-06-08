import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import backend from "~backend/client";
import { useCachedCalendarEvents } from "./useCachedCalendarEvents";

vi.mock("~backend/client", () => ({
  default: { task: { listCalendarEvents: vi.fn() } },
}));

const mocked = backend as unknown as {
  task: { listCalendarEvents: () => Promise<any> };
};

describe("useCachedCalendarEvents", () => {
  it("reads from cache and refreshes", async () => {
    const sample = [
      {
        id: 1,
        title: "t",
        startTime: new Date(),
        endTime: new Date(),
        isAllDay: false,
        recurrence: "none",
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    localStorage.setItem(
      "calendarEventsCache",
      JSON.stringify({ "::": sample }),
    );
    mocked.task.listCalendarEvents = vi
      .fn()
      .mockResolvedValue({ events: sample });

    const { result } = renderHook(() => useCachedCalendarEvents({}));

    await waitFor(() => {
      expect(result.current.events).not.toBeNull();
    });

    expect(result.current.events?.length).toBe(1);
    expect(result.current.loading).toBe(false);

    await waitFor(() => {
      expect(mocked.task.listCalendarEvents).toHaveBeenCalled();
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.events?.length).toBe(1);
  });
});
