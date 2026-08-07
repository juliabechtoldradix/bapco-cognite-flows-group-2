import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { HostSyncedStateProvider } from '../state/HostSyncedState';

import { useChecklistPageViewModel } from './useChecklistPageViewModel';

describe(useChecklistPageViewModel.name, () => {
  it('exposes host-synced activeView and periodPreset from storage', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <HostSyncedStateProvider
        api={null}
        initialState={JSON.stringify({
          searchQuery: '',
          selectedChecklistId: null,
          activeView: 'dashboard',
          periodPreset: '30d',
        })}
      >
        {children}
      </HostSyncedStateProvider>
    );

    const { result } = renderHook(() => useChecklistPageViewModel(), { wrapper });

    expect(result.current.activeView).toBe('dashboard');
    expect(result.current.periodPreset).toBe('30d');
    expect(typeof result.current.onActiveViewChange).toBe('function');
    expect(typeof result.current.onPeriodChange).toBe('function');
  });

  it('defaults activeView and periodPreset when initialState omits them', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <HostSyncedStateProvider api={{ syncInternalState: vi.fn() }} initialState={undefined}>
        {children}
      </HostSyncedStateProvider>
    );

    const { result } = renderHook(() => useChecklistPageViewModel(), { wrapper });

    expect(result.current.activeView).toBe('overview');
    expect(result.current.periodPreset).toBe('7d');
  });
});
