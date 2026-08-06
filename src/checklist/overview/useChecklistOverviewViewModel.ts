import { useContext, useEffect, useRef } from 'react';

import type { ChecklistKpis, ChecklistSummary } from '../contracts';

import { ChecklistOverviewViewModelContext } from './checklistOverviewViewModelContext';
import { getErrorMessage } from './getErrorMessage';
import type { OverviewLoadState } from './OverviewUiState';

export type ChecklistOverviewViewModelInput = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedId: string | null;
  onSelectChecklist: (id: string) => void;
  checklists?: ChecklistSummary[];
};

export type ChecklistOverviewViewModel = {
  kpis: ChecklistKpis | null;
  kpisState: OverviewLoadState;
  kpisError: string | null;
  checklists: ChecklistSummary[];
  listState: OverviewLoadState;
  listError: string | null;
  isListEmpty: boolean;
  selectedId: string | null;
  selectChecklist: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchDebounceMs: number;
  setTimeoutFn: (handler: () => void, timeout: number) => ReturnType<typeof setTimeout>;
  clearTimeoutFn: (id: ReturnType<typeof setTimeout>) => void;
};

export function useChecklistOverviewViewModel(
  input: ChecklistOverviewViewModelInput
): ChecklistOverviewViewModel {
  const {
    checklistService,
    useOverviewUiState,
    setTimeoutFn,
    clearTimeoutFn,
    searchDebounceMs,
  } = useContext(ChecklistOverviewViewModelContext);

  const {
    kpis,
    kpisState,
    kpisError,
    checklists: storedChecklists,
    listState: storedListState,
    listError: storedListError,
    setKpisLoading,
    setKpisSuccess,
    setKpisError,
    setListLoading,
    setListSuccess,
    setListError,
  } = useOverviewUiState();

  const listRequestIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    setKpisLoading();

    void checklistService
      .getKpis()
      .then((nextKpis) => {
        if (!cancelled) {
          setKpisSuccess(nextKpis);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setKpisError(getErrorMessage(error, 'Failed to load checklist KPIs'));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [checklistService, setKpisLoading, setKpisSuccess, setKpisError]);

  useEffect(() => {
    if (input.checklists !== undefined) {
      setListSuccess(input.checklists);
      return;
    }

    const requestId = listRequestIdRef.current + 1;
    listRequestIdRef.current = requestId;
    setListLoading();

    void checklistService
      .searchChecklists(input.searchQuery)
      .then((checklists) => {
        if (listRequestIdRef.current === requestId) {
          setListSuccess(checklists);
        }
      })
      .catch((error: unknown) => {
        if (listRequestIdRef.current === requestId) {
          setListError(getErrorMessage(error, 'Failed to load checklists'));
        }
      });
  }, [
    checklistService,
    input.checklists,
    input.searchQuery,
    setListLoading,
    setListSuccess,
    setListError,
  ]);

  const checklists = input.checklists ?? storedChecklists;
  const listState = input.checklists !== undefined ? 'success' : storedListState;
  const listError = input.checklists !== undefined ? null : storedListError;

  return {
    kpis,
    kpisState,
    kpisError,
    checklists,
    listState,
    listError,
    isListEmpty: listState === 'success' && checklists.length === 0,
    selectedId: input.selectedId,
    selectChecklist: input.onSelectChecklist,
    searchQuery: input.searchQuery,
    onSearchChange: input.onSearchChange,
    searchDebounceMs,
    setTimeoutFn,
    clearTimeoutFn,
  };
}
