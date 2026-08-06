import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ComponentType, ReactNode } from 'react';

import type { ChecklistService } from '../contracts';
import { ChecklistServiceContext } from '../shell/ChecklistServiceContext';
import { ChecklistQuickViewViewModelContext } from './ChecklistQuickViewViewModelContext';
import { QuickViewUiStateProvider, useQuickViewUiStorage } from './QuickViewUiState';
import { useChecklistQuickViewViewModel } from './useChecklistQuickViewViewModel';

describe(useChecklistQuickViewViewModel.name, () => {
  it('loads and groups success results for a checklist id', async () => {
    const service = makeService({
      getResults: vi.fn(async () => [
        {
          id: 'r1',
          label: 'General Condition',
          section: '7th Floor',
          equipment: 'Diffuser Scraper',
          outcome: 'NotOK' as const,
        },
        {
          id: 'r2',
          label: 'Motor Temp',
          section: '7th Floor',
          equipment: 'Diffuser Scraper',
          outcome: 'Unset' as const,
          reading: { value: 155, unit: '°F', threshold: '>170' },
        },
      ]),
      searchChecklists: vi.fn(async () => [
        {
          id: 'fixture-route1',
          name: 'Route One - IV/Kamyr Digester/Diffuser',
          status: 'ToDo' as const,
          hasNotOk: true,
        },
      ]),
    });

    const { result } = renderHook(() => useChecklistQuickViewViewModel('fixture-route1'), {
      wrapper: createWrapper(service),
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.checklistName).toContain('Route One');
    expect(result.current.groups[0]?.section).toBe('7th Floor');
    expect(result.current.groups[0]?.equipmentGroups[0]?.rows).toHaveLength(2);
  });

  it('exposes error state when the service fails', async () => {
    const service = makeService({
      getResults: vi.fn(async () => {
        throw new Error('CDF unavailable');
      }),
    });

    const { result } = renderHook(() => useChecklistQuickViewViewModel('fixture-route1'), {
      wrapper: createWrapper(service),
    });

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.errorMessage).toBe('CDF unavailable');
  });

  it('stays idle when no checklist is selected', async () => {
    const service = makeService();
    const { result } = renderHook(() => useChecklistQuickViewViewModel(null), {
      wrapper: createWrapper(service),
    });
    await waitFor(() => expect(result.current.status).toBe('idle'));
    expect(service.getResults).not.toHaveBeenCalled();
  });
});

function makeService(overrides: Partial<ChecklistService> = {}): ChecklistService {
  return {
    getKpis: vi.fn(async () => ({
      toDo: 0,
      ongoing: 0,
      done: 0,
      overdue: 0,
      withNotOk: 0,
    })),
    searchChecklists: vi.fn(async () => []),
    getResults: vi.fn(async () => []),
    getTaskResultDashboard: vi.fn(async () => ({
      period: '7d' as const,
      breakdown: { ok: 0, notOk: 0, other: 0 },
      series: [],
    })),
    ...overrides,
  };
}

function createWrapper(service: ChecklistService): ComponentType<{ children: ReactNode }> {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ChecklistServiceContext.Provider value={{ checklistService: service }}>
        <QuickViewUiStateProvider>
          <ChecklistQuickViewViewModelContext.Provider
            value={{
              useChecklistService: () => service,
              useQuickViewUiStorage,
            }}
          >
            {children}
          </ChecklistQuickViewViewModelContext.Provider>
        </QuickViewUiStateProvider>
      </ChecklistServiceContext.Provider>
    );
  };
}
