import { createContext } from 'react';

import type { ChecklistService } from '../contracts';
import { FixtureChecklistService } from '../data/ChecklistService';

import { useDashboardUiState } from './useDashboardUiState';

export type TaskResultDashboardViewModelContextType = {
  checklistService: ChecklistService;
  useDashboardUiState: typeof useDashboardUiState;
};

/**
 * Fixture fallback for isolated dashboard unit tests only.
 * Production should wrap with TaskResultDashboardViewModelProvider(CdfChecklistService).
 */
const defaultChecklistService: ChecklistService = new FixtureChecklistService();

export const defaultTaskResultDashboardViewModelContext: TaskResultDashboardViewModelContextType =
  {
    checklistService: defaultChecklistService,
    useDashboardUiState,
  };

export const TaskResultDashboardViewModelContext =
  createContext<TaskResultDashboardViewModelContextType>(
    defaultTaskResultDashboardViewModelContext
  );

export function getDefaultChecklistService(): ChecklistService {
  return defaultChecklistService;
}
