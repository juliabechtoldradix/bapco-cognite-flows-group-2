export type TimeoutId = ReturnType<typeof setTimeout>;

export type TimerDeps = {
  setTimeoutFn: (handler: () => void, timeout: number) => TimeoutId;
  clearTimeoutFn: (id: TimeoutId) => void;
};

export type DebouncedFn<TArgs extends unknown[]> = {
  (...args: TArgs): void;
  cancel: () => void;
};

/**
 * Creates a debounced function using injected timers (testable without fake globals).
 */
export function createDebouncedFn<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delayMs: number,
  deps: TimerDeps
): DebouncedFn<TArgs> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  function debounced(...args: TArgs): void {
    if (timer !== undefined) {
      deps.clearTimeoutFn(timer);
    }
    timer = deps.setTimeoutFn(() => {
      timer = undefined;
      fn(...args);
    }, delayMs);
  }

  debounced.cancel = () => {
    if (timer !== undefined) {
      deps.clearTimeoutFn(timer);
      timer = undefined;
    }
  };

  return debounced;
}
