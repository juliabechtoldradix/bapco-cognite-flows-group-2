import { useCallback, useMemo, useState, type ReactNode } from 'react';

import type { InAppNotification } from '../contracts';

import {
  INITIAL_NOTIFICATIONS_UI_STATE,
  type NotificationsUiState,
  type NotificationsUiStore,
} from './NotificationsUiState';
import { NotificationsUiStateContext } from './notificationsUiStateContext';

export function NotificationsUiStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NotificationsUiState>(INITIAL_NOTIFICATIONS_UI_STATE);

  const setLoading = useCallback(() => {
    setState((prev) => ({
      ...prev,
      loadState: 'loading',
      error: null,
    }));
  }, []);

  const setSuccess = useCallback((notifications: InAppNotification[]) => {
    setState((prev) => ({
      ...prev,
      notifications,
      loadState: 'success',
      error: null,
    }));
  }, []);

  const setError = useCallback((message: string) => {
    setState((prev) => ({
      ...prev,
      notifications: [],
      loadState: 'error',
      error: message,
    }));
  }, []);

  const setOpen = useCallback((isOpen: boolean) => {
    setState((prev) => ({
      ...prev,
      isOpen,
    }));
  }, []);

  const store = useMemo<NotificationsUiStore>(
    () => ({
      ...state,
      setLoading,
      setSuccess,
      setError,
      setOpen,
    }),
    [state, setLoading, setSuccess, setError, setOpen]
  );

  return (
    <NotificationsUiStateContext.Provider value={store}>
      {children}
    </NotificationsUiStateContext.Provider>
  );
}
