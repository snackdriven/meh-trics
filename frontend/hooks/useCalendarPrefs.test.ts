import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCalendarPrefs } from "./useCalendarPrefs";

describe("useCalendarPrefs", () => {
  it("persists view and date changes", () => {
    localStorage.clear();
    const { result } = renderHook(() => useCalendarPrefs());
    act(() => {
      result.current.setCalendarView("week");
      result.current.setCurrentDate(new Date("2025-01-02T00:00:00.000Z"));
    });
    expect(localStorage.getItem("calendarView")).toBe("week");
    expect(localStorage.getItem("calendarDate")).toBe(
      "2025-01-02T00:00:00.000Z",
    );
  });

  it("reads initial values from storage", () => {
    localStorage.setItem("calendarView", "3days");
    localStorage.setItem("calendarDate", "2025-02-05T00:00:00.000Z");
    const { result } = renderHook(() => useCalendarPrefs());
    expect(result.current.calendarView).toBe("3days");
    expect(result.current.currentDate.toISOString()).toBe(
      "2025-02-05T00:00:00.000Z",
    );
  });
});
