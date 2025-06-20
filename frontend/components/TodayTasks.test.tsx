import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TodayTasks } from "./TodayTasks";

const createTaskMock = vi.fn().mockResolvedValue({
  id: 1,
  title: "Buy milk",
  status: "todo",
  priority: 3,
  tags: [],
  isHardDeadline: false,
  sortOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
});

vi.mock("../hooks/useOfflineTasks", () => ({
  useOfflineTasks: () => ({ createTask: createTaskMock }),
}));

vi.mock("~backend/client", () => ({
  default: { task: { listDueTasks: vi.fn().mockResolvedValue({ tasks: [] }) } },
}));
import backend from "~backend/client";

describe("TodayTasks", () => {
  it("allows quick adding a task", async () => {
    const { getByPlaceholderText, getByText } = render(<TodayTasks date="2024-01-02" />);

    const input = getByPlaceholderText("Quick add task...");
    fireEvent.change(input, { target: { value: "Buy milk" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(createTaskMock).toHaveBeenCalled());
    expect(createTaskMock).toHaveBeenCalledWith(expect.objectContaining({ title: "Buy milk" }));

    await waitFor(() => expect(getByText("Buy milk")).toBeInTheDocument());
  });

  it("requests tasks without due dates when toggled", async () => {
    const { getByText } = render(<TodayTasks date="2024-01-02" />);
    const toggle = getByText("Show No Due");
    fireEvent.click(toggle);
    expect(backend.task.listDueTasks).toHaveBeenLastCalledWith(
      expect.objectContaining({ includeNoDue: "true" })
    );
  });
});
