import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import backend from "~backend/client";
import { useOfflineJournal } from "../useOfflineJournal";
import { reset } from "./idbMock";

vi.mock("idb", () => import("./idbMock"));
vi.mock("~backend/client", () => ({
  default: {
    task: { createJournalEntry: vi.fn(), updateJournalEntry: vi.fn() },
  },
}));

const mocked = backend as unknown as {
  task: {
    createJournalEntry: (d: any) => Promise<any>;
    updateJournalEntry: (d: any) => Promise<any>;
  };
};

beforeEach(() => {
  (global as any).indexedDB = {};
  reset();
});

afterEach(() => {
  delete (global as any).indexedDB;
});

describe("useOfflineJournal", () => {
  it("queues create and update when offline and syncs", async () => {
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    });
    const { result } = renderHook(() => useOfflineJournal());

    await act(async () => {
      await result.current.createEntry({ text: "hi" });
      await result.current.updateEntry({ id: 1, text: "up" });
    });
    expect(result.current.pending).toBe(2);
    expect(mocked.task.createJournalEntry).not.toHaveBeenCalled();

    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    });
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });

    await waitFor(() =>
      expect(mocked.task.createJournalEntry).toHaveBeenCalledTimes(1),
    );
    await waitFor(() =>
      expect(mocked.task.updateJournalEntry).toHaveBeenCalledTimes(1),
    );
    expect(result.current.pending).toBe(0);
  });
});
