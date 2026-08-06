import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { ChecklistService } from '../contracts';

export type ChecklistServiceContextType = {
  checklistService: ChecklistService;
};

const ChecklistServiceContext = createContext<ChecklistServiceContextType | null>(null);

export type ChecklistServiceProviderProps = {
  /** Required in production (CdfChecklistService). Tests may pass FixtureChecklistService. */
  checklistService: ChecklistService;
  children: ReactNode;
};

export function ChecklistServiceProvider({
  checklistService,
  children,
}: ChecklistServiceProviderProps) {
  const value = useMemo<ChecklistServiceContextType>(
    () => ({ checklistService }),
    [checklistService]
  );

  return (
    <ChecklistServiceContext.Provider value={value}>{children}</ChecklistServiceContext.Provider>
  );
}

export function useChecklistService(): ChecklistService {
  const value = useContext(ChecklistServiceContext);
  if (!value) {
    throw new Error('useChecklistService must be used within ChecklistServiceProvider');
  }
  return value.checklistService;
}
