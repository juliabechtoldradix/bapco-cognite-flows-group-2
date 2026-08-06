import { useContext } from 'react';

import type { DashboardUiStore } from './DashboardUiState';
import { DashboardUiStateContext } from './dashboardUiStateContext';

export function useDashboardUiState(): DashboardUiStore {
  const store = useContext(DashboardUiStateContext);
  if (!store) {
    throw new Error('useDashboardUiState must be used within DashboardUiStateProvider');
  }
  return store;
}
