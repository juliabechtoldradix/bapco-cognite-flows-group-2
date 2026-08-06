import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChecklistSearch } from './ChecklistSearch';

describe(ChecklistSearch.name, () => {
  it('debounces onSearchChange while typing', () => {
    // Arrange
    const pending: Array<() => void> = [];
    const setTimeoutFn = vi.fn((handler: () => void, _timeout: number) => {
      pending.push(handler);
      return pending.length;
    });
    const clearTimeoutFn = vi.fn((id: number) => {
      pending[id - 1] = () => undefined;
    });
    const onSearchChange = vi.fn();

    render(
      <ChecklistSearch
        searchQuery=""
        onSearchChange={onSearchChange}
        debounceMs={300}
        setTimeoutFn={setTimeoutFn}
        clearTimeoutFn={clearTimeoutFn}
      />
    );

    // Act
    fireEvent.change(screen.getByTestId('checklist-search'), {
      target: { value: 'Feed' },
    });

    // Assert — not flushed yet
    expect(onSearchChange).not.toHaveBeenCalled();
    expect(pending).toHaveLength(1);

    act(() => {
      pending[0]?.();
    });

    expect(onSearchChange).toHaveBeenCalledWith('Feed');
  });

  it('clears search immediately on clear', () => {
    const onSearchChange = vi.fn();

    render(
      <ChecklistSearch
        searchQuery="Feed"
        onSearchChange={onSearchChange}
        debounceMs={300}
        setTimeoutFn={(handler, timeout) => globalThis.setTimeout(handler, timeout)}
        clearTimeoutFn={(id) => {
          globalThis.clearTimeout(id);
        }}
      />
    );

    const input = screen.getByTestId('checklist-search');
    fireEvent.focus(input);
    fireEvent.click(screen.getByLabelText('Clear search'));

    expect(onSearchChange).toHaveBeenCalledWith('');
  });
});
