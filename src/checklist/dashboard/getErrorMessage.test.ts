import { describe, expect, it } from 'vitest';

import { getErrorMessage } from './getErrorMessage';

describe(getErrorMessage.name, () => {
  it('returns Error message when present', () => {
    expect(getErrorMessage(new Error('Failed to load'))).toBe('Failed to load');
  });

  it('returns string errors as-is', () => {
    expect(getErrorMessage('Network down')).toBe('Network down');
  });

  it('returns fallback for unknown values', () => {
    expect(getErrorMessage(null)).toBe('Something went wrong');
    expect(getErrorMessage({})).toBe('Something went wrong');
    expect(getErrorMessage(new Error('   '))).toBe('Something went wrong');
  });
});
