import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { ChecklistService } from '../contracts';
import { FixtureChecklistService } from '../data/ChecklistService';

export type ChecklistServiceContextType = {
  checklistService: ChecklistService;
};

const defaultContext: ChecklistServiceContextType = {
  checklistService: new FixtureChecklistService(),
};

export const ChecklistServiceContext = createContext<ChecklistServiceContextType>(defaultContext);

export type ChecklistServiceProviderProps = {
  /** Inject a service instance (tests / future CdfChecklistService). Defaults to fixtures. */
  checklistService?: ChecklistService;
  createChecklistService?: () => ChecklistService;
  children: ReactNode;
};

export function ChecklistServiceProvider({
  checklistService,
  createChecklistService = () => new FixtureChecklistService(),
  children,
}: ChecklistServiceProviderProps) {
  const value = useMemo<ChecklistServiceContextType>(
    () => ({
      checklistService: checklistService ?? createChecklistService(),
    }),
    [checklistService, createChecklistService]
  );

  return (
    <ChecklistServiceContext.Provider value={value}>{children}</ChecklistServiceContext.Provider>
  );
}

export function useChecklistService(): ChecklistService {
  return useContext(ChecklistServiceContext).checklistService;
}
