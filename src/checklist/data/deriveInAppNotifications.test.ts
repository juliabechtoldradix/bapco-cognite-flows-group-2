import { describe, expect, it } from 'vitest';

import {
  deriveInAppNotifications,
  IN_APP_NOTIFICATION_CAP,
  type NotificationSourceChecklist,
} from './deriveInAppNotifications';

describe(deriveInAppNotifications.name, () => {
  it('maps Not OK and completed checklists to feed items with stable ids', () => {
    const items = deriveInAppNotifications([
      source({
        id: 'c-notok',
        name: 'Route One',
        status: 'Ongoing',
        hasNotOk: true,
        eventMs: Date.parse('2026-08-06T12:00:00.000Z'),
      }),
      source({
        id: 'c-done',
        name: 'Route Three',
        status: 'Done',
        hasNotOk: false,
        eventMs: Date.parse('2026-08-05T08:00:00.000Z'),
      }),
    ]);

    expect(items).toEqual([
      {
        id: 'notOk:c-notok',
        trigger: 'notOk',
        title: 'Not OK result on Route One',
        body: 'Checklist has at least one Not OK task result',
        checklistId: 'c-notok',
        createdAt: '2026-08-06T12:00:00.000Z',
      },
      {
        id: 'completed:c-done',
        trigger: 'completed',
        title: 'Checklist completed: Route Three',
        body: 'Checklist status is Done',
        checklistId: 'c-done',
        createdAt: '2026-08-05T08:00:00.000Z',
      },
    ]);
  });

  it('emits both triggers when a Done checklist also has Not OK results', () => {
    const items = deriveInAppNotifications([
      source({
        id: 'c-both',
        name: 'Route Mixed',
        status: 'Done',
        hasNotOk: true,
        eventMs: Date.parse('2026-08-06T10:00:00.000Z'),
      }),
    ]);

    expect(items.map((item) => item.id)).toEqual(['notOk:c-both', 'completed:c-both']);
  });

  it('returns empty feed when no Not OK or Done checklists apply', () => {
    expect(
      deriveInAppNotifications([
        source({
          id: 'c1',
          name: 'Route Two',
          status: 'ToDo',
          hasNotOk: false,
          eventMs: Date.parse('2026-08-06T00:00:00.000Z'),
        }),
      ])
    ).toEqual([]);
  });

  it('sorts newest first and caps list length', () => {
    const checklists: NotificationSourceChecklist[] = [];
    for (let i = 0; i < IN_APP_NOTIFICATION_CAP + 5; i += 1) {
      checklists.push(
        source({
          id: `c-${i}`,
          name: `Route ${i}`,
          status: 'Done',
          hasNotOk: false,
          eventMs: Date.parse('2026-08-01T00:00:00.000Z') + i * 60_000,
        })
      );
    }

    const items = deriveInAppNotifications(checklists);
    expect(items).toHaveLength(IN_APP_NOTIFICATION_CAP);
    expect(items[0]?.checklistId).toBe(`c-${IN_APP_NOTIFICATION_CAP + 4}`);
    for (let i = 1; i < items.length; i += 1) {
      expect(items[i - 1]?.createdAt >= (items[i]?.createdAt ?? '')).toBe(true);
    }
  });
});

function source(value: NotificationSourceChecklist): NotificationSourceChecklist {
  return value;
}
