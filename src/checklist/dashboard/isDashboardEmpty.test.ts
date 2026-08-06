import { describe, expect, it } from 'vitest';

import type { TaskResultDashboardData } from '../contracts';

import { isDashboardEmpty } from './isDashboardEmpty';

describe(isDashboardEmpty.name, () => {
  it('returns true when all breakdown counts are zero', () => {
    const data: TaskResultDashboardData = {
      period: '7d',
      breakdown: { ok: 0, notOk: 0, other: 0 },
      series: [],
    };
    expect(isDashboardEmpty(data)).toBe(true);
  });

  it('returns false when any breakdown count is positive', () => {
    const data: TaskResultDashboardData = {
      period: '7d',
      breakdown: { ok: 1, notOk: 0, other: 0 },
      series: [],
    };
    expect(isDashboardEmpty(data)).toBe(false);
  });
});
