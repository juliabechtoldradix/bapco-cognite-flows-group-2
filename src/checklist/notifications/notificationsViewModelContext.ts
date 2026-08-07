import { createContext } from 'react';

import type { ChecklistService } from '../contracts';
import { FixtureChecklistService } from '../data/ChecklistService';

import { useNotificationsUiState } from './useNotificationsUiState';

export type NotificationsViewModelContextType = {
  checklistService: ChecklistService;
  useNotificationsUiState: typeof useNotificationsUiState;
};

/**
 * Fixture fallback for isolated notifications unit tests only.
 * Production should wrap with NotificationsViewModelProvider(CdfChecklistService).
 */
const defaultChecklistService: ChecklistService = new FixtureChecklistService();

export const defaultNotificationsViewModelContext: NotificationsViewModelContextType = {
  checklistService: defaultChecklistService,
  useNotificationsUiState,
};

export const NotificationsViewModelContext = createContext<NotificationsViewModelContextType>(
  defaultNotificationsViewModelContext
);

export function getDefaultChecklistService(): ChecklistService {
  return defaultChecklistService;
}
