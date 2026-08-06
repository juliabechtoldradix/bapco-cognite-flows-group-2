import { describe, expect, it, vi } from 'vitest';

import { createDebouncedFn } from './createDebouncedFn';

describe(createDebouncedFn.name, () => {
  it('invokes the function after the delay', () => {
    // Arrange
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = createDebouncedFn(fn, 300, {
      setTimeoutFn: setTimeout,
      clearTimeoutFn: clearTimeout,
    });

    // Act
    debounced('a');
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);

    // Assert
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
    vi.useRealTimers();
  });

  it('resets the timer when called again before the delay', () => {
    // Arrange
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = createDebouncedFn(fn, 300, {
      setTimeoutFn: setTimeout,
      clearTimeoutFn: clearTimeout,
    });

    // Act
    debounced('first');
    vi.advanceTimersByTime(200);
    debounced('second');
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);

    // Assert
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('second');
    vi.useRealTimers();
  });

  it('cancel prevents a pending invocation', () => {
    // Arrange
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = createDebouncedFn(fn, 300, {
      setTimeoutFn: setTimeout,
      clearTimeoutFn: clearTimeout,
    });

    // Act
    debounced('x');
    debounced.cancel();
    vi.advanceTimersByTime(300);

    // Assert
    expect(fn).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
