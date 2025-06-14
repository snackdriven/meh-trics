import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import backend from "~backend/client";
import { useAutoTags } from "./useAutoTags";

vi.mock("~backend/client", () => ({
  default: { tagging: { getAutoTags: vi.fn() } },
}));

const mocked = backend as unknown as {
  tagging: { getAutoTags: () => Promise<any> };
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe("useAutoTags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("loads tag suggestions from API", async () => {
    mocked.tagging.getAutoTags = vi
      .fn()
      .mockResolvedValue({ tags: ["work", "personal"] });

    const { result } = renderHook(() => useAutoTags());

    // Initially loading should be true
    expect(result.current.loading).toBe(true);
    expect(result.current.isFromCache).toBe(false);

    await waitFor(() => {
      expect(result.current.tags).toEqual(["work", "personal"]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    expect(mocked.tagging.getAutoTags).toHaveBeenCalledOnce();
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "meh-trics:auto-tags-cache",
      expect.stringContaining('"tags":["work","personal"]')
    );
  });

  it("loads from cache when available and not expired", async () => {
    const now = Date.now();
    const cachedData = {
      tags: ["cached", "tags"],
      timestamp: now - 60000, // 1 minute ago
      expiresAt: now + 240000, // expires in 4 minutes
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));
    mocked.tagging.getAutoTags = vi.fn();

    const { result } = renderHook(() => useAutoTags());

    await waitFor(() => {
      expect(result.current.tags).toEqual(["cached", "tags"]);
      expect(result.current.isFromCache).toBe(true);
      expect(result.current.loading).toBe(false);
    });

    // Should not call API when cache is valid
    expect(mocked.tagging.getAutoTags).not.toHaveBeenCalled();
  });

  it("fetches from API when cache is expired", async () => {
    const now = Date.now();
    const expiredCachedData = {
      tags: ["expired", "tags"],
      timestamp: now - 360000, // 6 minutes ago
      expiresAt: now - 60000, // expired 1 minute ago
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredCachedData));
    mocked.tagging.getAutoTags = vi
      .fn()
      .mockResolvedValue({ tags: ["fresh", "tags"] });

    const { result } = renderHook(() => useAutoTags());

    await waitFor(() => {
      expect(result.current.tags).toEqual(["fresh", "tags"]);
      expect(result.current.isFromCache).toBe(false);
    });

    expect(mocked.tagging.getAutoTags).toHaveBeenCalledOnce();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("meh-trics:auto-tags-cache");
  });

  it("handles API errors gracefully", async () => {
    mocked.tagging.getAutoTags = vi
      .fn()
      .mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useAutoTags());

    await waitFor(() => {
      expect(result.current.error).toBe("Network error");
      expect(result.current.loading).toBe(false);
      expect(result.current.tags).toEqual([]);
    });
  });

  it("falls back to expired cache on API error", async () => {
    const now = Date.now();
    const expiredCachedData = {
      tags: ["fallback", "tags"],
      timestamp: now - 360000,
      expiresAt: now - 60000,
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredCachedData));
    mocked.tagging.getAutoTags = vi
      .fn()
      .mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useAutoTags());

    await waitFor(() => {
      expect(result.current.tags).toEqual(["fallback", "tags"]);
      expect(result.current.isFromCache).toBe(true);
      expect(result.current.error).toBe("API Error");
    });
  });

  it("refresh bypasses cache and updates tags", async () => {
    // Set up initial cache
    const cachedData = {
      tags: ["cached", "tags"],
      timestamp: Date.now(),
      expiresAt: Date.now() + 300000,
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));

    mocked.tagging.getAutoTags = vi
      .fn()
      .mockResolvedValue({ tags: ["refreshed", "tags"] });

    const { result } = renderHook(() => useAutoTags());

    // Wait for initial load from cache
    await waitFor(() => {
      expect(result.current.tags).toEqual(["cached", "tags"]);
      expect(result.current.isFromCache).toBe(true);
    });

    // Refresh should bypass cache
    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.tags).toEqual(["refreshed", "tags"]);
    expect(result.current.isFromCache).toBe(false);
    expect(mocked.tagging.getAutoTags).toHaveBeenCalledOnce();
  });

  it("memoizes tags array to prevent unnecessary re-renders", async () => {
    mocked.tagging.getAutoTags = vi
      .fn()
      .mockResolvedValue({ tags: ["stable", "tags"] });

    const { result, rerender } = renderHook(() => useAutoTags());

    await waitFor(() => {
      expect(result.current.tags).toEqual(["stable", "tags"]);
    });

    const firstTagsReference = result.current.tags;

    // Rerender the hook
    rerender();

    // Tags array reference should remain the same (memoized)
    expect(result.current.tags).toBe(firstTagsReference);
  });

  it("handles localStorage errors gracefully", async () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error("Storage error");
    });

    mocked.tagging.getAutoTags = vi
      .fn()
      .mockResolvedValue({ tags: ["api", "tags"] });

    const { result } = renderHook(() => useAutoTags());

    await waitFor(() => {
      expect(result.current.tags).toEqual(["api", "tags"]);
      expect(result.current.loading).toBe(false);
    });

    // Should remove broken cache
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("meh-trics:auto-tags-cache");
  });

  it("cleans up expired cache on unmount", () => {
    const now = Date.now();
    const expiredCachedData = {
      tags: ["expired"],
      timestamp: now - 360000,
      expiresAt: now - 60000,
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredCachedData));

    const { unmount } = renderHook(() => useAutoTags());

    unmount();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith("meh-trics:auto-tags-cache");
  });
});
