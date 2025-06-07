import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useMoodOptions } from "./useMoodOptions";

describe("useMoodOptions", () => {
  it("stores hidden flag in localStorage", () => {
    localStorage.clear();
    const { result } = renderHook(() => useMoodOptions());
    act(() => {
      result.current.setMoodOptions({
        ...result.current.moodOptions,
        uplifted: [{ emoji: "😀", label: "Happy", hidden: true }],
      });
    });
    const stored = JSON.parse(localStorage.getItem("moodOptions") || "null");
    expect(stored.uplifted[0].hidden).toBe(true);
  });
});
