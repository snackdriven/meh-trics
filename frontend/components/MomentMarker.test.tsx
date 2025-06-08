import { render, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { MomentMarker } from "./MomentMarker";

vi.mock("../hooks/useReflectionPrompts", () => ({
  useReflectionPrompts: () => ["Prompt A", "Prompt B"],
}));

vi.mock("../hooks/useOfflineJournal", () => ({
  useOfflineJournal: () => ({
    createEntry: vi.fn(),
    updateEntry: vi.fn(),
    pending: 0,
    syncing: false,
  }),
}));

vi.mock("../hooks/useJournalTemplates", () => ({
  useJournalTemplates: () => [],
}));

vi.mock("~backend/client", () => ({
  default: {
    task: {
      getJournalEntry: vi.fn().mockRejectedValue("not found"),
      listJournalEntries: vi.fn().mockResolvedValue({ entries: [] }),
      deleteJournalEntry: vi.fn(),
    },
  },
}));

vi.mock("./HistoryList", () => ({
  HistoryList: () => <div>History</div>,
}));

vi.mock("./CreateJournalTemplateDialog", () => ({
  CreateJournalTemplateDialog: () => <div />,
}));

describe("MomentMarker", () => {
  it("renders reflection prompts", async () => {
    const { getByText } = render(<MomentMarker />);
    await waitFor(() => expect(getByText("Prompt A")).toBeInTheDocument());
    expect(getByText("Prompt B")).toBeInTheDocument();
  });
});
