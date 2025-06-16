import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import backend from "~backend/client";
import { useOfflineMoods } from "../useOfflineMoods";
import { reset } from "./idbMock";

vi.mock("idb", () => import("./idbMock"));
vi.mock("~backend/client", () => ({
  default: { task: { createMoodEntry: vi.fn() } },
}));

const mocked = backend as unknown as {
  task: { createMoodEntry: (d: any) => Promise<any> };
};

beforeEach(() => {
  (global as any).indexedDB = {};
  reset();
});

afterEach(() => {
  delete (global as any).indexedDB;
});

describe("useOfflineMoods", () => {
  it("queues mood entry when offline and syncs on reconnect", async () => {
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    });
    const { result } = renderHook(() => useOfflineMoods());

    await act(async () => {
      await result.current.createEntry({
        date: new Date(),
        tier: "uplifted",
        emoji: "😀",
        label: "h",
      });
    });
    expect(mocked.task.createMoodEntry).not.toHaveBeenCalled();
    expect(result.current.pending).toBe(1);

    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    });
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });

    await waitFor(() => expect(mocked.task.createMoodEntry).toHaveBeenCalledTimes(1));
    expect(result.current.pending).toBe(0);
  });
});
