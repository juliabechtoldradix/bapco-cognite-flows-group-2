import { useMemo, type ReactNode } from 'react';

import type { ChecklistService } from '../contracts';

import {
  ChecklistOverviewViewModelContext,
  defaultChecklistOverviewViewModelContext,
  getDefaultChecklistService,
  SEARCH_DEBOUNCE_MS,
  type ChecklistOverviewViewModelContextType,
} from './checklistOverviewViewModelContext';
import { useOverviewUiState } from './useOverviewUiState';

export type ChecklistOverviewViewModelProviderProps = {
  children: ReactNode;
  checklistService?: ChecklistService;
  setTimeoutFn?: ChecklistOverviewViewModelContextType['setTimeoutFn'];
  clearTimeoutFn?: ChecklistOverviewViewModelContextType['clearTimeoutFn'];
  searchDebounceMs?: number;
};

/**
 * Optional DI override for ChecklistService and timers.
 * Defaults to FixtureChecklistService when no provider is mounted.
 */
export function ChecklistOverviewViewModelProvider({
  children,
  checklistService = getDefaultChecklistService(),
  setTimeoutFn = defaultChecklistOverviewViewModelContext.setTimeoutFn,
  clearTimeoutFn = defaultChecklistOverviewViewModelContext.clearTimeoutFn,
  searchDebounceMs = SEARCH_DEBOUNCE_MS,
}: ChecklistOverviewViewModelProviderProps) {
  const value = useMemo<ChecklistOverviewViewModelContextType>(
    () => ({
      checklistService,
      useOverviewUiState,
      setTimeoutFn,
      clearTimeoutFn,
      searchDebounceMs,
    }),
    [checklistService, setTimeoutFn, clearTimeoutFn, searchDebounceMs]
  );

  return (
    <ChecklistOverviewViewModelContext.Provider value={value}>
      {children}
    </ChecklistOverviewViewModelContext.Provider>
  );
}
