import { describe, expect, it } from 'vitest';

import type { InAppNotification } from '../contracts';

import { getUnreadCount, isNotificationRead } from './getUnreadCount';

const SAMPLE: InAppNotification[] = [
  {
    id: 'notOk:a',
    trigger: 'notOk',
    title: 'Not OK on A',
    checklistId: 'a',
    createdAt: '2026-08-06T12:00:00.000Z',
  },
  {
    id: 'completed:b',
    trigger: 'completed',
    title: 'Completed B',
    checklistId: 'b',
    createdAt: '2026-08-05T08:00:00.000Z',
  },
];

describe(getUnreadCount.name, () => {
  it('counts all as unread when read list is empty', () => {
    expect(getUnreadCount(SAMPLE, [])).toBe(2);
  });

  it('excludes ids present in readNotificationIds', () => {
    expect(getUnreadCount(SAMPLE, ['notOk:a'])).toBe(1);
  });

  it('returns zero when all are read', () => {
    expect(getUnreadCount(SAMPLE, ['notOk:a', 'completed:b'])).toBe(0);
  });

  it('returns zero for empty notifications', () => {
    expect(getUnreadCount([], ['notOk:a'])).toBe(0);
  });
});

describe(isNotificationRead.name, () => {
  it('returns true when id is in the read list', () => {
    expect(isNotificationRead('notOk:a', ['notOk:a'])).toBe(true);
  });

  it('returns false when id is missing', () => {
    expect(isNotificationRead('notOk:a', [])).toBe(false);
  });
});
