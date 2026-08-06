import { createContext } from 'react';

import type { OverviewUiStore } from './OverviewUiState';

export const OverviewUiStateContext = createContext<OverviewUiStore | null>(null);
