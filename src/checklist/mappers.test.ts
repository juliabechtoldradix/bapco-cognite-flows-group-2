import { describe, expect, it } from 'vitest';

import {
  isNotOkItemStatus,
  mapChecklistItemToResultRow,
  mapChecklistToSummary,
  mapInFieldStatusToUi,
  mapItemStatusToOutcome,
  resolveRouteKey,
} from './mappers';

describe(mapInFieldStatusToUi.name, () => {
  const now = Date.parse('2026-08-06T12:00:00.000Z');

  it('maps Ready to ToDo', () => {
    expect(mapInFieldStatusToUi('Ready', null, now)).toBe('ToDo');
  });

  it('maps In progress to Ongoing', () => {
    expect(mapInFieldStatusToUi('In progress', null, now)).toBe('Ongoing');
  });

  it('maps Done to Done even when endTime is past', () => {
    expect(mapInFieldStatusToUi('Done', '2026-08-01T00:00:00.000Z', now)).toBe('Done');
  });

  it('maps past due non-Done checklist to Overdue', () => {
    expect(mapInFieldStatusToUi('Ready', '2026-08-01T00:00:00.000Z', now)).toBe('Overdue');
  });
});

describe(mapItemStatusToOutcome.name, () => {
  it('maps OK / Not OK / Yes / No', () => {
    expect(mapItemStatusToOutcome('OK')).toBe('OK');
    expect(mapItemStatusToOutcome('Not OK')).toBe('NotOK');
    expect(mapItemStatusToOutcome('Yes')).toBe('Yes');
    expect(mapItemStatusToOutcome('No')).toBe('No');
  });

  it('maps unknown to Unset', () => {
    expect(mapItemStatusToOutcome('To Do')).toBe('Unset');
  });
});

describe(isNotOkItemStatus.name, () => {
  it('treats Not OK as not-ok', () => {
    expect(isNotOkItemStatus('Not OK')).toBe(true);
    expect(isNotOkItemStatus('OK')).toBe(false);
  });
});

describe(resolveRouteKey.name, () => {
  it('maps OEC route titles to route keys', () => {
    expect(resolveRouteKey('Route One - IV/Kamyr Digester/Diffuser')).toBe('route1');
    expect(resolveRouteKey('Route Two - Feed System')).toBe('route2');
  });
});

describe(mapChecklistToSummary.name, () => {
  it('builds summary with mapped status and route key', () => {
    const summary = mapChecklistToSummary(
      'seed:oec:route-2:checklist',
      { title: 'Route Two - Feed System', status: 'In progress' },
      false,
      Date.parse('2026-08-06T12:00:00.000Z')
    );
    expect(summary).toEqual({
      id: 'seed:oec:route-2:checklist',
      name: 'Route Two - Feed System',
      status: 'Ongoing',
      hasNotOk: false,
      routeKey: 'route2',
    });
  });
});

describe(mapChecklistItemToResultRow.name, () => {
  it('extracts section/equipment labels and outcome', () => {
    const row = mapChecklistItemToResultRow('task-1', {
      title: 'General Condition',
      status: 'Not OK',
      labels: ['zone:7th Floor', 'equipment:Diffuser Scraper', 'OK / Not OK'],
    });
    expect(row).toMatchObject({
      id: 'task-1',
      label: 'General Condition',
      section: '7th Floor',
      equipment: 'Diffuser Scraper',
      outcome: 'NotOK',
    });
  });

  it('attaches numeric measurement reading when present', () => {
    const row = mapChecklistItemToResultRow(
      'task-2',
      { title: 'Motor Temp', status: 'OK', labels: ['unit:°F'] },
      { numericReading: 155, type: 'temperature', min: 170 }
    );
    expect(row.reading).toEqual({ value: 155, unit: '°F', threshold: '>170' });
  });
});
