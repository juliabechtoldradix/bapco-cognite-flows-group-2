import { describe, expect, it } from 'vitest';

import { formatOutcomeLabel, outcomeBadgeVariant } from './outcomeLabel';

describe('outcomeLabel', () => {
  it('formats outcome labels for display', () => {
    expect(formatOutcomeLabel('NotOK')).toBe('Not OK');
    expect(formatOutcomeLabel('OK')).toBe('OK');
    expect(formatOutcomeLabel('Unset')).toBe('Unset');
  });

  it('maps outcomes to badge variants', () => {
    expect(outcomeBadgeVariant('OK')).toBe('success');
    expect(outcomeBadgeVariant('NotOK')).toBe('error');
    expect(outcomeBadgeVariant('Blocked')).toBe('warning');
    expect(outcomeBadgeVariant('Unset')).toBe('secondary');
  });
});
