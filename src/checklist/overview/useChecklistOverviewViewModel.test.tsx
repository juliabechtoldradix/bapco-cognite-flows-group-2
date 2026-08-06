import { act, renderHook, waitFor } from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { assert, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ChecklistKpis, ChecklistService, ChecklistSummary } from '../contracts';
import { FixtureChecklistService } from '../data/ChecklistService';

import {
  ChecklistOverviewViewModelContext,
  type ChecklistOverviewViewModelContextType,
} from './checklistOverviewViewModelContext';
import { OverviewUiStateProvider } from './OverviewUiStateProvider';
import { useChecklistOverviewViewModel } from './useChecklistOverviewViewModel';
import { useOverviewUiState } from './useOverviewUiState';

describe(useChecklistOverviewViewModel.name, () => {
  let mockService: ChecklistService;
  let mockContext: ChecklistOverviewViewModelContextType;
  let wrapper: ComponentType<{ children: ReactNode }>;

  beforeEach(() => {
    mockService = {
      getKpis: vi.fn(() =>
        Promise.resolve({
          toDo: 1,
          ongoing: 1,
          done: 1,
          overdue: 1,
          withNotOk: 2,
        } satisfies ChecklistKpis)
      ),
      searchChecklists: vi.fn(() =>
        Promise.resolve([
          {
            id: 'fixture-route2',
            name: 'Route Two - Feed System',
            status: 'Ongoing',
            hasNotOk: false,
            routeKey: 'route2',
          },
        ] satisfies ChecklistSummary[])
      ),
      getResults: vi.fn(() => {
        assert.fail('getResults should not be called by overview view model');
      }),
    };

    mockContext = {
      checklistService: mockService,
      useOverviewUiState,
      setTimeoutFn: (handler, timeout) => globalThis.setTimeout(handler, timeout),
      clearTimeoutFn: (id) => {
        globalThis.clearTimeout(id);
      },
      searchDebounceMs: 300,
    };

    wrapper = ({ children }) => (
      <OverviewUiStateProvider>
        <ChecklistOverviewViewModelContext.Provider value={mockContext}>
          {children}
        </ChecklistOverviewViewModelContext.Provider>
      </OverviewUiStateProvider>
    );
  });

  it('exposes loading then success KPI and list state', async () => {
    const onSearchChange = vi.fn();
    const onSelectChecklist = vi.fn();

    const { result } = renderHook(
      () =>
        useChecklistOverviewViewModel({
          searchQuery: '',
          onSearchChange,
          selectedId: null,
          onSelectChecklist,
        }),
      { wrapper }
    );

    expect(result.current.kpisState).toBe('loading');
    expect(result.current.listState).toBe('loading');

    await waitFor(() => {
      expect(result.current.kpisState).toBe('success');
      expect(result.current.listState).toBe('success');
    });

    expect(result.current.kpis).toEqual({
      toDo: 1,
      ongoing: 1,
      done: 1,
      overdue: 1,
      withNotOk: 2,
    });
    expect(result.current.checklists).toHaveLength(1);
    expect(result.current.checklists[0]?.name).toBe('Route Two - Feed System');
    expect(result.current.isListEmpty).toBe(false);
  });

  it('exposes KPI and list error states without stale success data', async () => {
    vi.mocked(mockService.getKpis).mockRejectedValueOnce(new Error('KPI boom'));
    vi.mocked(mockService.searchChecklists).mockRejectedValueOnce(new Error('List boom'));

    const { result } = renderHook(
      () =>
        useChecklistOverviewViewModel({
          searchQuery: '',
          onSearchChange: vi.fn(),
          selectedId: null,
          onSelectChecklist: vi.fn(),
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.kpisState).toBe('error');
      expect(result.current.listState).toBe('error');
    });

    expect(result.current.kpis).toBeNull();
    expect(result.current.checklists).toEqual([]);
    expect(result.current.kpisError).toBe('KPI boom');
    expect(result.current.listError).toBe('List boom');
  });

  it('exposes empty list state when search returns no matches', async () => {
    vi.mocked(mockService.searchChecklists).mockResolvedValueOnce([]);

    const { result } = renderHook(
      () =>
        useChecklistOverviewViewModel({
          searchQuery: 'zzz-no-match',
          onSearchChange: vi.fn(),
          selectedId: null,
          onSelectChecklist: vi.fn(),
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.listState).toBe('success');
    });

    expect(result.current.checklists).toEqual([]);
    expect(result.current.isListEmpty).toBe(true);
  });

  it('searches again when searchQuery changes', async () => {
    const { result, rerender } = renderHook(
      (props: { searchQuery: string }) =>
        useChecklistOverviewViewModel({
          searchQuery: props.searchQuery,
          onSearchChange: vi.fn(),
          selectedId: null,
          onSelectChecklist: vi.fn(),
        }),
      { wrapper, initialProps: { searchQuery: '' } }
    );

    await waitFor(() => expect(result.current.listState).toBe('success'));
    expect(mockService.searchChecklists).toHaveBeenCalledWith('');

    rerender({ searchQuery: 'Feed' });

    await waitFor(() => {
      expect(mockService.searchChecklists).toHaveBeenCalledWith('Feed');
    });
  });

  it('uses checklists override without calling searchChecklists for list data', async () => {
    const override: ChecklistSummary[] = [
      {
        id: 'custom',
        name: 'Custom checklist',
        status: 'ToDo',
        hasNotOk: false,
      },
    ];

    const { result } = renderHook(
      () =>
        useChecklistOverviewViewModel({
          searchQuery: '',
          onSearchChange: vi.fn(),
          selectedId: null,
          onSelectChecklist: vi.fn(),
          checklists: override,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.listState).toBe('success');
    });

    expect(result.current.checklists).toEqual(override);
  });

  it('works with FixtureChecklistService OEC fixtures', async () => {
    mockContext = {
      ...mockContext,
      checklistService: new FixtureChecklistService(),
    };
    wrapper = ({ children }) => (
      <OverviewUiStateProvider>
        <ChecklistOverviewViewModelContext.Provider value={mockContext}>
          {children}
        </ChecklistOverviewViewModelContext.Provider>
      </OverviewUiStateProvider>
    );

    const { result } = renderHook(
      () =>
        useChecklistOverviewViewModel({
          searchQuery: 'Feed',
          onSearchChange: vi.fn(),
          selectedId: null,
          onSelectChecklist: vi.fn(),
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.listState).toBe('success'));

    expect(result.current.kpis?.withNotOk).toBe(2);
    expect(result.current.checklists).toHaveLength(1);
    expect(result.current.checklists[0]?.name).toContain('Feed System');
  });

  it('forwards selectChecklist to onSelectChecklist', async () => {
    const onSelectChecklist = vi.fn();
    const { result } = renderHook(
      () =>
        useChecklistOverviewViewModel({
          searchQuery: '',
          onSearchChange: vi.fn(),
          selectedId: null,
          onSelectChecklist,
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.listState).toBe('success'));

    act(() => {
      result.current.selectChecklist('fixture-route2');
    });

    expect(onSelectChecklist).toHaveBeenCalledWith('fixture-route2');
  });
});
