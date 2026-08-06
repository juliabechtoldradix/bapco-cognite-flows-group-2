import type { TaskResultDashboardData } from '../contracts';

export type DashboardLoadState = 'idle' | 'loading' | 'success' | 'error';

export type DashboardUiState = {
  data: TaskResultDashboardData | null;
  loadState: DashboardLoadState;
  error: string | null;
};

export const INITIAL_DASHBOARD_UI_STATE: DashboardUiState = {
  data: null,
  loadState: 'idle',
  error: null,
};

export type DashboardUiStore = DashboardUiState & {
  setLoading: () => void;
  setSuccess: (data: TaskResultDashboardData) => void;
  setError: (message: string) => void;
};
