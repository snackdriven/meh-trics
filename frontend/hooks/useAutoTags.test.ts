import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import backend from "~backend/client";
import { useAutoTags } from "./useAutoTags";

vi.mock("~backend/client", () => ({
  default: { tagging: { getAutoTags: vi.fn() } },
}));

const mocked = backend as unknown as {
  tagging: { getAutoTags: () => Promise<any> };
};

describe("useAutoTags", () => {
  it("loads tag suggestions", async () => {
    mocked.tagging.getAutoTags = vi
      .fn()
      .mockResolvedValue({ tags: ["a", "b"] });

    const { result } = renderHook(() => useAutoTags());

    await waitFor(() => expect(result.current.tags).toEqual(["a", "b"]));
    expect(mocked.tagging.getAutoTags).toHaveBeenCalled();
  });

  it("refresh updates tags", async () => {
    mocked.tagging.getAutoTags = vi.fn().mockResolvedValue({ tags: ["x"] });

    const { result } = renderHook(() => useAutoTags());
    await waitFor(() => expect(result.current.tags).toEqual(["x"]));

    mocked.tagging.getAutoTags.mockResolvedValue({ tags: ["y"] });
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.tags).toEqual(["y"]);
  });
});
