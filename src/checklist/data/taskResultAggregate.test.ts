import { describe, expect, it } from 'vitest';

import {
  aggregateTaskResults,
  bucketStartMs,
  isCountableTaskResultItem,
  outcomeToBreakdownBucket,
  resolvePeriodWindow,
} from './taskResultAggregate';

/** Fixed "now": 2026-08-06T15:00:00.000Z */
const NOW_MS = Date.parse('2026-08-06T15:00:00.000Z');

describe(resolvePeriodWindow.name, () => {
  it('resolves 24h as last 24 hours with hourly buckets (UTC)', () => {
    expect(resolvePeriodWindow('24h', NOW_MS)).toEqual({
      startMs: NOW_MS - 24 * 60 * 60 * 1000,
      endMs: NOW_MS,
      bucket: 'hour',
    });
  });

  it('resolves 7d as last 7 days with daily buckets (UTC)', () => {
    expect(resolvePeriodWindow('7d', NOW_MS)).toEqual({
      startMs: NOW_MS - 7 * 24 * 60 * 60 * 1000,
      endMs: NOW_MS,
      bucket: 'day',
    });
  });

  it('resolves 30d as last 30 days with daily buckets (UTC)', () => {
    expect(resolvePeriodWindow('30d', NOW_MS)).toEqual({
      startMs: NOW_MS - 30 * 24 * 60 * 60 * 1000,
      endMs: NOW_MS,
      bucket: 'day',
    });
  });
});

describe(isCountableTaskResultItem.name, () => {
  it('excludes section header rows', () => {
    expect(
      isCountableTaskResultItem({ labels: ['section', 'zone:7th Floor'], title: 'Diffuser' })
    ).toBe(false);
  });

  it('excludes Exceptions placeholders', () => {
    expect(isCountableTaskResultItem({ labels: [], title: 'Exceptions:' })).toBe(false);
  });

  it('includes normal task rows', () => {
    expect(
      isCountableTaskResultItem({
        labels: ['zone:7th Floor', 'equipment:Diffuser'],
        title: 'General Condition',
      })
    ).toBe(true);
  });
});

describe(outcomeToBreakdownBucket.name, () => {
  it('maps OK to ok and Not OK family to notOk', () => {
    expect(outcomeToBreakdownBucket('OK')).toBe('ok');
    expect(outcomeToBreakdownBucket('Not OK')).toBe('notOk');
    expect(outcomeToBreakdownBucket('No')).toBe('notOk');
    expect(outcomeToBreakdownBucket('Blocked')).toBe('notOk');
  });

  it('maps Yes / Unset to other', () => {
    expect(outcomeToBreakdownBucket('Yes')).toBe('other');
    expect(outcomeToBreakdownBucket('To Do')).toBe('other');
    expect(outcomeToBreakdownBucket(null)).toBe('other');
  });
});

describe(bucketStartMs.name, () => {
  it('floors to UTC hour or day start', () => {
    const at = Date.parse('2026-08-06T15:42:11.000Z');
    expect(new Date(bucketStartMs(at, 'hour')).toISOString()).toBe('2026-08-06T15:00:00.000Z');
    expect(new Date(bucketStartMs(at, 'day')).toISOString()).toBe('2026-08-06T00:00:00.000Z');
  });
});

describe(aggregateTaskResults.name, () => {
  it('returns empty series and zero breakdown when no items fall in the period', () => {
    const data = aggregateTaskResults(
      [
        {
          status: 'OK',
          atMs: Date.parse('2026-01-01T00:00:00.000Z'),
          title: 'Old',
        },
      ],
      '7d',
      NOW_MS
    );
    expect(data).toEqual({
      period: '7d',
      breakdown: { ok: 0, notOk: 0, other: 0 },
      series: [],
    });
  });

  it('aggregates breakdown and daily series for 7d', () => {
    const data = aggregateTaskResults(
      [
        {
          status: 'OK',
          atMs: Date.parse('2026-08-05T10:00:00.000Z'),
          title: 'A',
        },
        {
          status: 'Not OK',
          atMs: Date.parse('2026-08-05T18:00:00.000Z'),
          title: 'B',
        },
        {
          status: 'Yes',
          atMs: Date.parse('2026-08-06T08:00:00.000Z'),
          title: 'C',
        },
        {
          status: 'OK',
          atMs: Date.parse('2026-08-06T12:00:00.000Z'),
          title: 'D',
        },
        {
          status: 'OK',
          atMs: Date.parse('2026-07-01T00:00:00.000Z'),
          title: 'Outside',
        },
        {
          status: 'Not OK',
          atMs: Date.parse('2026-08-05T12:00:00.000Z'),
          labels: ['section'],
          title: 'Section header',
        },
      ],
      '7d',
      NOW_MS
    );

    expect(data.period).toBe('7d');
    expect(data.breakdown).toEqual({ ok: 2, notOk: 1, other: 1 });

    const day5 = data.series.find((p) => p.at === '2026-08-05T00:00:00.000Z');
    const day6 = data.series.find((p) => p.at === '2026-08-06T00:00:00.000Z');
    expect(day5).toEqual({ at: '2026-08-05T00:00:00.000Z', ok: 1, notOk: 1 });
    expect(day6).toEqual({ at: '2026-08-06T00:00:00.000Z', ok: 1, notOk: 0 });
    expect(data.series.length).toBe(8);
  });

  it('uses hourly buckets for 24h', () => {
    const data = aggregateTaskResults(
      [
        {
          status: 'OK',
          atMs: Date.parse('2026-08-06T10:15:00.000Z'),
          title: 'A',
        },
        {
          status: 'Not OK',
          atMs: Date.parse('2026-08-06T10:45:00.000Z'),
          title: 'B',
        },
      ],
      '24h',
      NOW_MS
    );

    expect(data.breakdown).toEqual({ ok: 1, notOk: 1, other: 0 });
    expect(data.series).toHaveLength(25);
    const hour10 = data.series.find((p) => p.at === '2026-08-06T10:00:00.000Z');
    expect(hour10).toEqual({ at: '2026-08-06T10:00:00.000Z', ok: 1, notOk: 1 });
  });
});
