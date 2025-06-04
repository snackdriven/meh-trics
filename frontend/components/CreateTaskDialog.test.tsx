import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

vi.mock('~backend/client', () => ({
  default: {
    task: {
      createTask: vi.fn().mockResolvedValue({ id: 1, title: 'Test', status: 'todo', priority: 3, tags: [], isHardDeadline: false, sortOrder: 1, createdAt: new Date(), updatedAt: new Date() })
    }
  }
}));

vi.mock('@/components/ui/select', () => {
  const React = require('react');
  const Simple = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  return {
    Select: Simple,
    SelectContent: Simple,
    SelectTrigger: Simple,
    SelectValue: (p: any) => <input data-select-value {...p} />,
    SelectItem: Simple,
  };
});

import backend from '~backend/client';
import { CreateTaskDialog } from './CreateTaskDialog';

describe('CreateTaskDialog', () => {
  it('submits form and calls API', async () => {
    const onCreated = vi.fn();
    const { getByLabelText, getByText } = render(
      <CreateTaskDialog open onOpenChange={() => {}} onTaskCreated={onCreated} />
    );

    fireEvent.change(getByLabelText('Title'), { target: { value: 'Test' } });
    fireEvent.submit(getByText('Create Task').closest('form')!);

    await waitFor(() => expect(backend.task.createTask).toHaveBeenCalled());
    expect(backend.task.createTask).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test' }));
    expect(onCreated).toHaveBeenCalled();
  });
});
