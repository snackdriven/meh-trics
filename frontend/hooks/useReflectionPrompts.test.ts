import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import backend from "~backend/client";
import { useReflectionPrompts } from "./useReflectionPrompts";

vi.mock("~backend/client", () => ({
  default: { task: { getReflectionPrompts: vi.fn() } },
}));

const mocked = backend as unknown as {
  task: { getReflectionPrompts: () => Promise<{ prompts: string[] }> };
};

describe("useReflectionPrompts", () => {
  it("loads prompts from the backend", async () => {
    mocked.task.getReflectionPrompts = vi
      .fn()
      .mockResolvedValue({ prompts: ["a", "b"] });

    const { result } = renderHook(() => useReflectionPrompts());
    await waitFor(() => expect(result.current.length).toBe(2));
    expect(result.current).toEqual(["a", "b"]);
  });
});
