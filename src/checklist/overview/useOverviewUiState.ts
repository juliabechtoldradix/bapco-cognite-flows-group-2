import { useContext } from 'react';

import type { OverviewUiStore } from './OverviewUiState';
import { OverviewUiStateContext } from './overviewUiStateContext';

export function useOverviewUiState(): OverviewUiStore {
  const store = useContext(OverviewUiStateContext);
  if (!store) {
    throw new Error('useOverviewUiState must be used within OverviewUiStateProvider');
  }
  return store;
}
