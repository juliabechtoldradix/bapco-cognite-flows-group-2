import { describe, expect, it } from 'vitest';

import {
  DEFAULT_HOST_SYNCED_STATE,
  isChecklistStatus,
  isHostSyncedState,
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

  it('validates host-synced state shape', () => {
    expect(isHostSyncedState({ searchQuery: 'feed', selectedChecklistId: 'fixture-route2' })).toBe(
      true
    );
    expect(isHostSyncedState({ searchQuery: 'feed', selectedChecklistId: null })).toBe(true);
    expect(isHostSyncedState({ searchQuery: 1, selectedChecklistId: null })).toBe(false);
  });

  it('parses host state or falls back to defaults', () => {
    expect(parseHostSyncedState(undefined)).toEqual(DEFAULT_HOST_SYNCED_STATE);
    expect(parseHostSyncedState('{')).toEqual(DEFAULT_HOST_SYNCED_STATE);
    expect(parseHostSyncedState('{"searchQuery":"dig","selectedChecklistId":"fixture-route1"}')).toEqual({
      searchQuery: 'dig',
      selectedChecklistId: 'fixture-route1',
    });
  });
});
