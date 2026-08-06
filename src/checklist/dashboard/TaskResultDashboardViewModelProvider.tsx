import { useMemo, type ReactNode } from 'react';

import type { ChecklistService } from '../contracts';

import {
  getDefaultChecklistService,
  TaskResultDashboardViewModelContext,
  type TaskResultDashboardViewModelContextType,
} from './taskResultDashboardViewModelContext';
import { useDashboardUiState } from './useDashboardUiState';

export type TaskResultDashboardViewModelProviderProps = {
  children: ReactNode;
  checklistService?: ChecklistService;
};

/**
 * Optional DI override for ChecklistService.
 * Defaults to FixtureChecklistService when no provider is mounted.
 */
export function TaskResultDashboardViewModelProvider({
  children,
  checklistService = getDefaultChecklistService(),
}: TaskResultDashboardViewModelProviderProps) {
  const value = useMemo<TaskResultDashboardViewModelContextType>(
    () => ({
      checklistService,
      useDashboardUiState,
    }),
    [checklistService]
  );

  return (
    <TaskResultDashboardViewModelContext.Provider value={value}>
      {children}
    </TaskResultDashboardViewModelContext.Provider>
  );
}
