import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import backend from "~backend/client";
import { useOfflineTasks } from "../useOfflineTasks";
import { reset } from "./idbMock";

vi.mock("idb", () => import("./idbMock"));
vi.mock("~backend/client", () => ({
  default: { task: { createTask: vi.fn() } },
}));

const mocked = backend as unknown as {
  task: { createTask: (d: any) => Promise<any> };
};

beforeEach(() => {
  (global as any).indexedDB = {};
  reset();
});

afterEach(() => {
  delete (global as any).indexedDB;
});

describe("useOfflineTasks", () => {
  it("queues createTask when offline and syncs on reconnect", async () => {
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    });
    const { result } = renderHook(() => useOfflineTasks());

    await act(async () => {
      await result.current.createTask({ title: "T" });
    });
    expect(mocked.task.createTask).not.toHaveBeenCalled();
    expect(result.current.pending).toBe(1);

    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    });
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });

    await waitFor(() =>
      expect(mocked.task.createTask).toHaveBeenCalledTimes(1),
    );
    expect(result.current.pending).toBe(0);
  });
});
