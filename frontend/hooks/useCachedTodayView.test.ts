import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import backend from "~backend/client";
import { useCachedTodayView } from "./useCachedTodayView";

vi.mock("~backend/client", () => ({
  default: { task: { getDashboardData: vi.fn() } },
}));

const mocked = backend as unknown as {
  task: { getDashboardData: () => Promise<any> };
};

describe("useCachedTodayView", () => {
  it("loads cached data and refreshes", async () => {
    const cached = {
      moodTrends: [],
      habitCompletions: [],
      taskMetrics: { total: 0, completed: 0, completionRate: 0 },
    };
    localStorage.setItem("dashboardData", JSON.stringify(cached));
    mocked.task.getDashboardData = vi
      .fn()
      .mockResolvedValue({ ...cached, topMood: "Joy" });

    const { result } = renderHook(() => useCachedTodayView());

    expect(result.current.data).toEqual(cached);
    expect(result.current.loading).toBe(false);

    await waitFor(() => {
      expect(mocked.task.getDashboardData).toHaveBeenCalled();
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.data?.topMood).toBe("Joy");
  });
});
