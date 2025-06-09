import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import React from "react";

import { TodayView } from "./TodayView";
import { useTodayData } from "../hooks/useTodayData";
import { useAutoTags } from "../hooks/useAutoTags";
import backend from "~backend/client";

vi.mock("../hooks/useTodayData");
vi.mock("../hooks/useAutoTags");
vi.mock("~backend/client", () => ({
  default: {
    task: {
      listMoodEntries: vi.fn().mockResolvedValue({ entries: [] }),
      createMoodEntry: vi
        .fn()
        .mockResolvedValue({ id: 1, emoji: "😄", label: "Happy" }),
      listDueTasks: vi.fn().mockResolvedValue({ tasks: [] }),
      updateTask: vi.fn(),
    },
  },
}));

const mockedUseTodayData = vi.mocked(useTodayData);
const mockedUseAutoTags = vi.mocked(useAutoTags);

describe("TodayView", () => {
  it("renders sections and handles interactions", async () => {
    const setMoodEntry = vi.fn();
    const setJournalEntry = vi.fn();
    const handleHabitCountChange = vi.fn();
    const setHabitNotes = vi.fn();
    const updateHabitEntry = vi.fn();

    mockedUseTodayData.mockReturnValue({
      moodEntry: null,
      setMoodEntry,
      journalEntry: null,
      setJournalEntry,
      habits: [
        {
          id: 1,
          name: "Water",
          emoji: "💧",
          frequency: "daily",
          targetCount: 2,
          startDate: new Date(),
          createdAt: new Date(),
        },
      ],
      habitCounts: { 1: 0 },
      habitNotes: { 1: "" },
      loading: false,
      handleHabitCountChange,
      updateHabitEntry,
      setHabitNotes,
    });

    mockedUseAutoTags.mockReturnValue({ tags: ["focus"], refresh: vi.fn() });

    const { getByText, getByLabelText, getByRole } = render(<TodayView />);

    await waitFor(() => getByText("Happy"));

    expect(getByText("Today's Mood")).toBeInTheDocument();
    expect(getByText("Journal Entry")).toBeInTheDocument();
    expect(getByText("Habits")).toBeInTheDocument();

    const tagsInput = getByLabelText("Tags (comma separated)") as HTMLInputElement;
    expect(tagsInput.value).toBe("focus");

    fireEvent.click(getByText("Happy"));
    await waitFor(() => expect(setMoodEntry).toHaveBeenCalled());

    const spin = getByRole("spinbutton") as HTMLInputElement;
    fireEvent.change(spin, { target: { value: "1" } });
    expect(handleHabitCountChange).toHaveBeenCalledWith(1, 1);
  });
});
