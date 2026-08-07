import { renderHook, waitFor } from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { assert, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ChecklistService, TaskResultDashboardData } from '../contracts';
import { FixtureChecklistService } from '../data/ChecklistService';

import { DashboardUiStateProvider } from './DashboardUiStateProvider';
import {
  TaskResultDashboardViewModelContext,
  type TaskResultDashboardViewModelContextType,
} from './taskResultDashboardViewModelContext';
import { useDashboardUiState } from './useDashboardUiState';
import { useTaskResultDashboardViewModel } from './useTaskResultDashboardViewModel';

describe(useTaskResultDashboardViewModel.name, () => {
  let mockService: ChecklistService;
  let mockContext: TaskResultDashboardViewModelContextType;
  let wrapper: ComponentType<{ children: ReactNode }>;

  beforeEach(() => {
    mockService = {
      getKpis: vi.fn(() => {
        assert.fail('getKpis should not be called by dashboard view model');
      }),
      searchChecklists: vi.fn(() => {
        assert.fail('searchChecklists should not be called by dashboard view model');
      }),
      getResults: vi.fn(() => {
        assert.fail('getResults should not be called by dashboard view model');
      }),
      getTaskResultDashboard: vi.fn(() =>
        Promise.resolve({
          period: '7d',
          breakdown: { ok: 34, notOk: 8, other: 2 },
          series: [
            { at: '2026-07-31T00:00:00.000Z', ok: 8, notOk: 2 },
            { at: '2026-08-02T00:00:00.000Z', ok: 9, notOk: 1 },
          ],
        } satisfies TaskResultDashboardData)
      ),
      listInAppNotifications: vi.fn(() => {
        assert.fail('listInAppNotifications should not be called by dashboard view model');
      }),
    };

    mockContext = {
      checklistService: mockService,
      useDashboardUiState,
    };

    wrapper = ({ children }) => (
      <DashboardUiStateProvider>
        <TaskResultDashboardViewModelContext.Provider value={mockContext}>
          {children}
        </TaskResultDashboardViewModelContext.Provider>
      </DashboardUiStateProvider>
    );
  });

  it('exposes loading then success state with dashboard data', async () => {
    const { result } = renderHook(
      () =>
        useTaskResultDashboardViewModel({
          periodPreset: '7d',
          onPeriodChange: vi.fn(),
        }),
      { wrapper }
    );

    expect(result.current.loadState).toBe('loading');

    await waitFor(() => {
      expect(result.current.loadState).toBe('success');
    });

    expect(result.current.data?.breakdown).toEqual({ ok: 34, notOk: 8, other: 2 });
    expect(result.current.data?.series).toHaveLength(2);
    expect(result.current.isEmpty).toBe(false);
    expect(mockService.getTaskResultDashboard).toHaveBeenCalledWith('7d');
  });

  it('exposes error state without stale success data', async () => {
    vi.mocked(mockService.getTaskResultDashboard).mockRejectedValueOnce(
      new Error('Dashboard boom')
    );

    const { result } = renderHook(
      () =>
        useTaskResultDashboardViewModel({
          periodPreset: '7d',
          onPeriodChange: vi.fn(),
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loadState).toBe('error');
    });

    expect(result.current.error).toBe('Dashboard boom');
    expect(result.current.data).toBeNull();
    expect(result.current.isEmpty).toBe(false);
  });

  it('exposes empty state when breakdown totals are zero', async () => {
    vi.mocked(mockService.getTaskResultDashboard).mockResolvedValueOnce({
      period: '24h',
      breakdown: { ok: 0, notOk: 0, other: 0 },
      series: [],
    });

    const { result } = renderHook(
      () =>
        useTaskResultDashboardViewModel({
          periodPreset: '24h',
          onPeriodChange: vi.fn(),
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loadState).toBe('success');
    });

    expect(result.current.isEmpty).toBe(true);
  });

  it('refetches when periodPreset changes', async () => {
    type PeriodProp = { periodPreset: '7d' | '30d' };
    const initialProps: PeriodProp = { periodPreset: '7d' };

    const { result, rerender } = renderHook(
      (props: PeriodProp) =>
        useTaskResultDashboardViewModel({
          periodPreset: props.periodPreset,
          onPeriodChange: vi.fn(),
        }),
      { wrapper, initialProps }
    );

    await waitFor(() => expect(result.current.loadState).toBe('success'));
    expect(mockService.getTaskResultDashboard).toHaveBeenCalledWith('7d');

    rerender({ periodPreset: '30d' });

    await waitFor(() => {
      expect(mockService.getTaskResultDashboard).toHaveBeenCalledWith('30d');
    });
  });

  it('works with FixtureChecklistService dashboard fixtures', async () => {
    mockContext = {
      checklistService: new FixtureChecklistService(),
      useDashboardUiState,
    };
    wrapper = ({ children }) => (
      <DashboardUiStateProvider>
        <TaskResultDashboardViewModelContext.Provider value={mockContext}>
          {children}
        </TaskResultDashboardViewModelContext.Provider>
      </DashboardUiStateProvider>
    );

    const { result } = renderHook(
      () =>
        useTaskResultDashboardViewModel({
          periodPreset: '7d',
          onPeriodChange: vi.fn(),
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.loadState).toBe('success'));
    expect(result.current.data?.period).toBe('7d');
    expect(result.current.data?.breakdown.ok).toBeGreaterThan(0);
    expect(result.current.data?.series.length).toBeGreaterThan(0);
  });
});
