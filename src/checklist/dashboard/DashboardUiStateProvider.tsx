import { useCallback, useMemo, useState, type ReactNode } from 'react';

import type { TaskResultDashboardData } from '../contracts';

import {
  INITIAL_DASHBOARD_UI_STATE,
  type DashboardUiState,
  type DashboardUiStore,
} from './DashboardUiState';
import { DashboardUiStateContext } from './dashboardUiStateContext';

export function DashboardUiStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DashboardUiState>(INITIAL_DASHBOARD_UI_STATE);

  const setLoading = useCallback(() => {
    setState((prev) => ({
      ...prev,
      loadState: 'loading',
      error: null,
    }));
  }, []);

  const setSuccess = useCallback((data: TaskResultDashboardData) => {
    setState({
      data,
      loadState: 'success',
      error: null,
    });
  }, []);

  const setError = useCallback((message: string) => {
    setState({
      data: null,
      loadState: 'error',
      error: message,
    });
  }, []);

  const store = useMemo<DashboardUiStore>(
    () => ({
      ...state,
      setLoading,
      setSuccess,
      setError,
    }),
    [state, setLoading, setSuccess, setError]
  );

  return (
    <DashboardUiStateContext.Provider value={store}>{children}</DashboardUiStateContext.Provider>
  );
}
