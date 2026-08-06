import { createContext } from 'react';

import type { DashboardUiStore } from './DashboardUiState';

export const DashboardUiStateContext = createContext<DashboardUiStore | null>(null);
