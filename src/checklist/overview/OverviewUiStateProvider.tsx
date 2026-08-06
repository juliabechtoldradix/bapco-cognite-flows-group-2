import { useCallback, useMemo, useState, type ReactNode } from 'react';

import type { ChecklistKpis, ChecklistSummary } from '../contracts';

import {
  INITIAL_OVERVIEW_UI_STATE,
  type OverviewUiState,
  type OverviewUiStore,
} from './OverviewUiState';
import { OverviewUiStateContext } from './overviewUiStateContext';

export function OverviewUiStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OverviewUiState>(INITIAL_OVERVIEW_UI_STATE);

  const setKpisLoading = useCallback(() => {
    setState((prev) => ({
      ...prev,
      kpisState: 'loading',
      kpisError: null,
    }));
  }, []);

  const setKpisSuccess = useCallback((kpis: ChecklistKpis) => {
    setState((prev) => ({
      ...prev,
      kpis,
      kpisState: 'success',
      kpisError: null,
    }));
  }, []);

  const setKpisError = useCallback((message: string) => {
    setState((prev) => ({
      ...prev,
      kpis: null,
      kpisState: 'error',
      kpisError: message,
    }));
  }, []);

  const setListLoading = useCallback(() => {
    setState((prev) => ({
      ...prev,
      listState: 'loading',
      listError: null,
    }));
  }, []);

  const setListSuccess = useCallback((checklists: ChecklistSummary[]) => {
    setState((prev) => ({
      ...prev,
      checklists,
      listState: 'success',
      listError: null,
    }));
  }, []);

  const setListError = useCallback((message: string) => {
    setState((prev) => ({
      ...prev,
      checklists: [],
      listState: 'error',
      listError: message,
    }));
  }, []);

  const store = useMemo<OverviewUiStore>(
    () => ({
      ...state,
      setKpisLoading,
      setKpisSuccess,
      setKpisError,
      setListLoading,
      setListSuccess,
      setListError,
    }),
    [
      state,
      setKpisLoading,
      setKpisSuccess,
      setKpisError,
      setListLoading,
      setListSuccess,
      setListError,
    ]
  );

  return (
    <OverviewUiStateContext.Provider value={store}>{children}</OverviewUiStateContext.Provider>
  );
}
