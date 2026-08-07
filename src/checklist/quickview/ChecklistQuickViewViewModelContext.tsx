import { createContext, useContext } from 'react';

import { useChecklistService } from '../shell/ChecklistServiceContext';

import { useQuickViewUiStorage } from './QuickViewUiState';

const defaultDeps = {
  useChecklistService,
  useQuickViewUiStorage,
};

export type ChecklistQuickViewViewModelContextType = typeof defaultDeps;

export const ChecklistQuickViewViewModelContext =
  createContext<ChecklistQuickViewViewModelContextType>(defaultDeps);

export function useChecklistQuickViewViewModelDeps(): ChecklistQuickViewViewModelContextType {
  return useContext(ChecklistQuickViewViewModelContext);
}
