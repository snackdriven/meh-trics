import { fireEvent, render, waitFor } from "@testing-library/react";
/// <reference types="@testing-library/jest-dom" />
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";

vi.mock("~backend/client", () => ({
  default: {
    mood: {
      createMoodEntry: vi.fn().mockResolvedValue({
        id: 1,
        date: new Date(),
        tier: "uplifted",
        emoji: "😄",
        label: "Happy",
        secondaryTier: "neutral",
        secondaryEmoji: "😟",
        secondaryLabel: "Confused",
        tags: [],
        createdAt: new Date(),
      }),
    },
  },
}));

import backend from "~backend/client";
import { MoodEditorDialog } from "./MoodEditorDialog";

vi.spyOn(console, "warn").mockImplementation(() => {});

describe("MoodEditorDialog", () => {
  it("saves entry with secondary mood", async () => {
    const onSaved = vi.fn();
    const { getAllByText, getByText } = render(
      <MoodEditorDialog
        open
        date={new Date()}
        entry={null}
        onOpenChange={() => {}}
        onSaved={onSaved}
      />
    );

    fireEvent.click(getAllByText("Happy")[0]);
    fireEvent.click(getAllByText("Confused")[1]);
    fireEvent.click(getByText("Save"));

    await waitFor(() => expect(backend.mood.createMoodEntry).toHaveBeenCalled());
    expect(backend.mood.createMoodEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        tier: "uplifted",
        emoji: "😄",
        label: "Happy",
        secondaryTier: "neutral",
        secondaryEmoji: "😟",
        secondaryLabel: "Confused",
      })
    );
    expect(onSaved).toHaveBeenCalled();
  });
});
