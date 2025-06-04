import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useAsyncOperation } from "./useAsyncOperation";

describe("useAsyncOperation", () => {
  it("successful execution updates data and loading states", async () => {
    vi.useFakeTimers();
    const asyncFn = vi
      .fn()
      .mockImplementation(
        () => new Promise<string>(resolve => setTimeout(() => resolve("result"), 0))
      );
    const { result } = renderHook(() => useAsyncOperation(asyncFn));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);

    await act(async () => {
      const p = result.current.execute();
      await vi.runAllTimersAsync();
      await p;
    });

    expect(result.current.data).toBe("result");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    vi.useRealTimers();
  });

  it("error handling sets error and resets loading", async () => {
    vi.useFakeTimers();
    const asyncFn = vi
      .fn()
      .mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error("fail")), 0))
      );
    const { result } = renderHook(() => useAsyncOperation(asyncFn));

    await act(async () => {
      const p = result.current.execute();
      await vi.runAllTimersAsync();
      await p.catch(() => {});
    });

    expect(result.current.error).toBe("fail");
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    vi.useRealTimers();
  });
});
