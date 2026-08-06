import { createContext } from 'react';

import type { ChecklistService } from '../contracts';
import { FixtureChecklistService } from '../data/ChecklistService';

import { useOverviewUiState } from './useOverviewUiState';

export const SEARCH_DEBOUNCE_MS = 300;

export type TimeoutId = ReturnType<typeof setTimeout>;

export type ChecklistOverviewViewModelContextType = {
  checklistService: ChecklistService;
  useOverviewUiState: typeof useOverviewUiState;
  setTimeoutFn: (handler: () => void, timeout: number) => TimeoutId;
  clearTimeoutFn: (id: TimeoutId) => void;
  searchDebounceMs: number;
};

const defaultChecklistService: ChecklistService = new FixtureChecklistService();

function defaultSetTimeout(handler: () => void, timeout: number): TimeoutId {
  return globalThis.setTimeout(handler, timeout);
}

function defaultClearTimeout(id: TimeoutId): void {
  globalThis.clearTimeout(id);
}

export const defaultChecklistOverviewViewModelContext: ChecklistOverviewViewModelContextType = {
  checklistService: defaultChecklistService,
  useOverviewUiState,
  setTimeoutFn: defaultSetTimeout,
  clearTimeoutFn: defaultClearTimeout,
  searchDebounceMs: SEARCH_DEBOUNCE_MS,
};

export const ChecklistOverviewViewModelContext =
  createContext<ChecklistOverviewViewModelContextType>(defaultChecklistOverviewViewModelContext);

export function getDefaultChecklistService(): ChecklistService {
  return defaultChecklistService;
}
