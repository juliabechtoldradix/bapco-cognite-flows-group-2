import { describe, expect, it } from 'vitest';

import {
  DEFAULT_HOST_SYNCED_STATE,
  isAppView,
  isChecklistStatus,
  isHostSyncedState,
  isInAppNotificationTrigger,
  isReadNotificationIds,
  isTaskResultPeriodPreset,
  parseHostSyncedState,
} from './contracts';

describe('checklist contracts', () => {
  it('accepts known checklist statuses', () => {
    expect(isChecklistStatus('ToDo')).toBe(true);
    expect(isChecklistStatus('Ongoing')).toBe(true);
    expect(isChecklistStatus('Done')).toBe(true);
    expect(isChecklistStatus('Overdue')).toBe(true);
    expect(isChecklistStatus('Ready')).toBe(false);
  });

  it('accepts app views and period presets', () => {
    expect(isAppView('overview')).toBe(true);
    expect(isAppView('dashboard')).toBe(true);
    expect(isAppView('other')).toBe(false);
    expect(isTaskResultPeriodPreset('24h')).toBe(true);
    expect(isTaskResultPeriodPreset('7d')).toBe(true);
    expect(isTaskResultPeriodPreset('30d')).toBe(true);
    expect(isTaskResultPeriodPreset('1h')).toBe(false);
  });

  it('accepts in-app notification triggers and read id lists', () => {
    expect(isInAppNotificationTrigger('notOk')).toBe(true);
    expect(isInAppNotificationTrigger('completed')).toBe(true);
    expect(isInAppNotificationTrigger('email')).toBe(false);
    expect(isReadNotificationIds([])).toBe(true);
    expect(isReadNotificationIds(['notOk:fixture-route1'])).toBe(true);
    expect(isReadNotificationIds(['a', 1])).toBe(false);
    expect(isReadNotificationIds('a')).toBe(false);
  });

  it('validates full host-synced state shape', () => {
    expect(
      isHostSyncedState({
        searchQuery: 'feed',
        selectedChecklistId: 'fixture-route2',
        activeView: 'dashboard',
        periodPreset: '24h',
        readNotificationIds: ['notOk:fixture-route1'],
      })
    ).toBe(true);
    expect(
      isHostSyncedState({
        searchQuery: 'feed',
        selectedChecklistId: null,
        activeView: 'overview',
        periodPreset: '7d',
        readNotificationIds: [],
      })
    ).toBe(true);
    // Legacy v2 payload (missing v3 field) is not a full HostSyncedState
    expect(
      isHostSyncedState({
        searchQuery: 'feed',
        selectedChecklistId: null,
        activeView: 'overview',
        periodPreset: '7d',
      })
    ).toBe(false);
    // Legacy v1 payload (missing v2 fields) is not a full HostSyncedState
    expect(isHostSyncedState({ searchQuery: 'feed', selectedChecklistId: null })).toBe(false);
    expect(isHostSyncedState({ searchQuery: 1, selectedChecklistId: null })).toBe(false);
  });

  it('parses host state or falls back to defaults', () => {
    expect(parseHostSyncedState(undefined)).toEqual(DEFAULT_HOST_SYNCED_STATE);
    expect(parseHostSyncedState('{')).toEqual(DEFAULT_HOST_SYNCED_STATE);
    expect(parseHostSyncedState('{"searchQuery":"dig","selectedChecklistId":"fixture-route1"}')).toEqual({
      searchQuery: 'dig',
      selectedChecklistId: 'fixture-route1',
      activeView: 'overview',
      periodPreset: '7d',
      readNotificationIds: [],
    });
    expect(
      parseHostSyncedState(
        '{"searchQuery":"","selectedChecklistId":null,"activeView":"dashboard","periodPreset":"30d"}'
      )
    ).toEqual({
      searchQuery: '',
      selectedChecklistId: null,
      activeView: 'dashboard',
      periodPreset: '30d',
      readNotificationIds: [],
    });
    expect(
      parseHostSyncedState(
        '{"searchQuery":"","selectedChecklistId":null,"activeView":"overview","periodPreset":"7d","readNotificationIds":["completed:fixture-route3"]}'
      )
    ).toEqual({
      searchQuery: '',
      selectedChecklistId: null,
      activeView: 'overview',
      periodPreset: '7d',
      readNotificationIds: ['completed:fixture-route3'],
    });
  });
});
