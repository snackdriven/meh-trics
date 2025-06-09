import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createOfflineQueue } from "../useOfflineQueue";
import { reset } from "./idbMock";

vi.mock("idb", () => import("./idbMock"));

beforeEach(() => {
  (global as any).indexedDB = {};
  reset();
});

afterEach(() => {
  delete (global as any).indexedDB;
});

describe("useOfflineQueue", () => {
  it("queues items offline and syncs when online", async () => {
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    });
    const process = vi.fn().mockResolvedValue(undefined);
    const useQueue = createOfflineQueue<{ type: string }>("testdb", process);
    const { result } = renderHook(() => useQueue());

    await act(async () => {
      await result.current.enqueue({ type: "a" });
    });
    expect(result.current.pending).toBe(1);

    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    });
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });

    await waitFor(() => expect(process).toHaveBeenCalledTimes(1));
    expect(result.current.pending).toBe(0);
  });
});
