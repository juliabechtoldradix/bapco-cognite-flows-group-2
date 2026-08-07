import { useContext } from 'react';

import type { NotificationsUiStore } from './NotificationsUiState';
import { NotificationsUiStateContext } from './notificationsUiStateContext';

export function useNotificationsUiState(): NotificationsUiStore {
  const store = useContext(NotificationsUiStateContext);
  if (!store) {
    throw new Error('useNotificationsUiState must be used within NotificationsUiStateProvider');
  }
  return store;
}
