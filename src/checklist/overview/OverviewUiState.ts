import type { ChecklistKpis, ChecklistSummary } from '../contracts';

export type OverviewLoadState = 'idle' | 'loading' | 'success' | 'error';

export type OverviewUiState = {
  kpis: ChecklistKpis | null;
  kpisState: OverviewLoadState;
  kpisError: string | null;
  checklists: ChecklistSummary[];
  listState: OverviewLoadState;
  listError: string | null;
};

export const INITIAL_OVERVIEW_UI_STATE: OverviewUiState = {
  kpis: null,
  kpisState: 'idle',
  kpisError: null,
  checklists: [],
  listState: 'idle',
  listError: null,
};

export type OverviewUiStore = OverviewUiState & {
  setKpisLoading: () => void;
  setKpisSuccess: (kpis: ChecklistKpis) => void;
  setKpisError: (message: string) => void;
  setListLoading: () => void;
  setListSuccess: (checklists: ChecklistSummary[]) => void;
  setListError: (message: string) => void;
};
