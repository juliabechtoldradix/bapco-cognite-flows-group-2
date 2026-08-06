import type {
  TaskResultDashboardData,
  TaskResultPeriodPreset,
  TaskResultTimeSeriesPoint,
} from '../contracts';
import { isNotOkOutcome, mapItemStatusToOutcome } from '../mappers';

export type TaskResultAggregateItem = {
  status: string | null | undefined;
  /** Epoch ms used for period filter + series bucketing (UTC). */
  atMs: number;
  labels?: readonly string[] | null;
  title?: string | null;
};

export type PeriodWindow = {
  startMs: number;
  endMs: number;
  bucket: 'hour' | 'day';
};

const MS_HOUR = 60 * 60 * 1000;
const MS_DAY = 24 * MS_HOUR;

/**
 * Period windows are UTC-relative to `nowMs`.
 * - `24h`: last 24 hours, hourly buckets
 * - `7d`: last 7 days, daily buckets (default product preset)
 * - `30d`: last 30 days, daily buckets
 */
export function resolvePeriodWindow(
  period: TaskResultPeriodPreset,
  nowMs: number
): PeriodWindow {
  if (period === '24h') {
    return { startMs: nowMs - MS_HOUR * 24, endMs: nowMs, bucket: 'hour' };
  }
  if (period === '30d') {
    return { startMs: nowMs - MS_DAY * 30, endMs: nowMs, bucket: 'day' };
  }
  return { startMs: nowMs - MS_DAY * 7, endMs: nowMs, bucket: 'day' };
}

/**
 * Section header rows and Excel "Exceptions" placeholders are not task results.
 */
export function isCountableTaskResultItem(item: {
  labels?: readonly string[] | null;
  title?: string | null;
}): boolean {
  const labels = item.labels ?? [];
  if (labels.some((label) => label.toLowerCase() === 'section')) {
    return false;
  }
  const title = (item.title ?? '').trim().toLowerCase();
  if (title === 'exceptions' || title === 'exceptions:') {
    return false;
  }
  return true;
}

export function bucketStartMs(atMs: number, bucket: 'hour' | 'day'): number {
  const date = new Date(atMs);
  if (bucket === 'hour') {
    return Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      0,
      0,
      0
    );
  }
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0);
}

export function outcomeToBreakdownBucket(
  status: string | null | undefined
): 'ok' | 'notOk' | 'other' {
  const outcome = mapItemStatusToOutcome(status);
  if (outcome === 'OK') {
    return 'ok';
  }
  if (isNotOkOutcome(outcome)) {
    return 'notOk';
  }
  return 'other';
}

/**
 * Aggregates countable ChecklistItem task results into OK/Not OK breakdown + series.
 * Items outside the period window are ignored. Empty period → zero breakdown and `series: []`.
 */
export function aggregateTaskResults(
  items: readonly TaskResultAggregateItem[],
  period: TaskResultPeriodPreset,
  nowMs: number
): TaskResultDashboardData {
  const window = resolvePeriodWindow(period, nowMs);
  const inPeriod = items.filter(
    (item) =>
      isCountableTaskResultItem(item) &&
      item.atMs >= window.startMs &&
      item.atMs <= window.endMs
  );

  const breakdown = { ok: 0, notOk: 0, other: 0 };
  if (inPeriod.length === 0) {
    return { period, breakdown, series: [] };
  }

  const bucketMs = window.bucket === 'hour' ? MS_HOUR : MS_DAY;
  const firstBucket = bucketStartMs(window.startMs, window.bucket);
  const lastBucket = bucketStartMs(window.endMs, window.bucket);
  const counts = new Map<number, { ok: number; notOk: number }>();

  for (let t = firstBucket; t <= lastBucket; t += bucketMs) {
    counts.set(t, { ok: 0, notOk: 0 });
  }

  for (const item of inPeriod) {
    const bucket = outcomeToBreakdownBucket(item.status);
    breakdown[bucket] += 1;

    if (bucket === 'other') {
      continue;
    }
    const key = bucketStartMs(item.atMs, window.bucket);
    const point = counts.get(key);
    if (!point) {
      continue;
    }
    if (bucket === 'ok') {
      point.ok += 1;
    } else {
      point.notOk += 1;
    }
  }

  const series: TaskResultTimeSeriesPoint[] = [...counts.entries()]
    .sort(([a], [b]) => a - b)
    .map(([at, point]) => ({
      at: new Date(at).toISOString(),
      ok: point.ok,
      notOk: point.notOk,
    }));

  return { period, breakdown, series };
}
