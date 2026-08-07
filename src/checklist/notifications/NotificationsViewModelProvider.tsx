import { useMemo, type ReactNode } from 'react';

import type { ChecklistService } from '../contracts';

import {
  getDefaultChecklistService,
  NotificationsViewModelContext,
  type NotificationsViewModelContextType,
} from './notificationsViewModelContext';
import { useNotificationsUiState } from './useNotificationsUiState';

export type NotificationsViewModelProviderProps = {
  children: ReactNode;
  checklistService?: ChecklistService;
};

/**
 * Optional DI override for ChecklistService.
 * Defaults to FixtureChecklistService when no provider is mounted.
 */
export function NotificationsViewModelProvider({
  children,
  checklistService = getDefaultChecklistService(),
}: NotificationsViewModelProviderProps) {
  const value = useMemo<NotificationsViewModelContextType>(
    () => ({
      checklistService,
      useNotificationsUiState,
    }),
    [checklistService]
  );

  return (
    <NotificationsViewModelContext.Provider value={value}>
      {children}
    </NotificationsViewModelContext.Provider>
  );
}
