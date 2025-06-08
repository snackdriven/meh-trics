import { fireEvent, render, waitFor } from "@testing-library/react";
/// <reference types="@testing-library/jest-dom" />
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import React from "react";

vi.mock("~backend/client", () => ({
  default: {
    task: {
      createTask: vi.fn().mockResolvedValue({
        id: 1,
        title: "Test",
        status: "todo",
        priority: 3,
        tags: [],
        isHardDeadline: false,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    },
  },
}));

vi.mock("@/components/ui/select", () => {
  const React = require("react");
  const Select = ({ onValueChange, children, value }: any) => (
    <select
      data-testid="mock-select"
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
    >
      {children}
    </select>
  );
  const Simple = ({ children }: any) => <>{children}</>;
  const SelectItem = ({ value, children }: any) => (
    <option value={value}>{children}</option>
  );
  const SelectValue = (p: any) => <input data-select-value {...p} />;

  return {
    Select,
    SelectContent: Simple,
    SelectTrigger: Simple,
    SelectValue,
    SelectItem,
  };
});

import backend from "~backend/client";
import { CreateTaskDialog } from "./CreateTaskDialog";

describe("CreateTaskDialog", () => {
  it("submits form and calls API", async () => {
    const onCreated = vi.fn();
    const { getByLabelText, getByText } = render(
      <CreateTaskDialog
        open
        onOpenChange={() => {}}
        onTaskCreated={onCreated}
      />,
    );

    fireEvent.change(getByLabelText("Title"), { target: { value: "Test" } });
    fireEvent.submit(getByText("Create Task").closest("form")!);

    await waitFor(() => expect(backend.task.createTask).toHaveBeenCalled());
    expect(backend.task.createTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Test" }),
    );
    expect(onCreated).toHaveBeenCalled();
  });

  it("allows adding a custom tag and closes on success", async () => {
    const onCreated = vi.fn();
    const onOpenChange = vi.fn();
    const { getByLabelText, getByText, queryByText, getByPlaceholderText } =
      render(
        <CreateTaskDialog
          open
          onOpenChange={onOpenChange}
          onTaskCreated={onCreated}
        />,
      );

    fireEvent.change(getByLabelText("Title"), { target: { value: "Test" } });
    fireEvent.change(getByPlaceholderText("Add custom tag..."), {
      target: { value: "foo" },
    });
    fireEvent.click(getByText("Add"));

    // custom tag should appear in the list
    expect(getByText("foo")).toBeInTheDocument();

    fireEvent.submit(getByText("Create Task").closest("form")!);

    await waitFor(() => expect(backend.task.createTask).toHaveBeenCalled());
    expect(onOpenChange).toHaveBeenCalledWith(false);

    // form should reset and tag removed
    expect(queryByText("foo")).not.toBeInTheDocument();
  });

  it("adds a custom tag when pressing Enter", () => {
    const { getByLabelText, getByPlaceholderText, getByText } = render(
      <CreateTaskDialog
        open
        onOpenChange={() => {}}
        onTaskCreated={() => {}}
      />,
    );

    fireEvent.change(getByLabelText("Title"), { target: { value: "Test" } });
    const input = getByPlaceholderText("Add custom tag...");
    fireEvent.change(input, { target: { value: "foo" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(getByText("foo")).toBeInTheDocument();
  });
});
