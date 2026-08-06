import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { HostAppAPI } from '@cognite/app-sdk';

import { parseHostSyncedState, type HostSyncedState } from '../contracts';

export type HostSyncedApi = Pick<HostAppAPI, 'syncInternalState'>;

export type HostSyncedStorage = HostSyncedState & {
  setSearchQuery: (searchQuery: string) => void;
  setSelectedChecklistId: (selectedChecklistId: string | null) => void;
};

const HostSyncedStateContext = createContext<HostSyncedStorage | null>(null);

export type HostSyncedStateProviderProps = {
  api: HostSyncedApi | null;
  initialState?: string;
  children: ReactNode;
};

export function HostSyncedStateProvider({
  api,
  initialState,
  children,
}: HostSyncedStateProviderProps) {
  const [state, setState] = useState<HostSyncedState>(() => parseHostSyncedState(initialState));

  const setSearchQuery = useCallback(
    (searchQuery: string) => {
      setState((previous) => {
        const next = { ...previous, searchQuery };
        void api?.syncInternalState(JSON.stringify(next));
        return next;
      });
    },
    [api]
  );

  const setSelectedChecklistId = useCallback(
    (selectedChecklistId: string | null) => {
      setState((previous) => {
        const next = { ...previous, selectedChecklistId };
        void api?.syncInternalState(JSON.stringify(next));
        return next;
      });
    },
    [api]
  );

  const value = useMemo<HostSyncedStorage>(
    () => ({
      searchQuery: state.searchQuery,
      selectedChecklistId: state.selectedChecklistId,
      activeView: state.activeView,
      periodPreset: state.periodPreset,
      setSearchQuery,
      setSelectedChecklistId,
    }),
    [
      setSearchQuery,
      setSelectedChecklistId,
      state.searchQuery,
      state.selectedChecklistId,
      state.activeView,
      state.periodPreset,
    ]
  );

  return (
    <HostSyncedStateContext.Provider value={value}>{children}</HostSyncedStateContext.Provider>
  );
}

export function useHostSyncedStorage(): HostSyncedStorage {
  const value = useContext(HostSyncedStateContext);
  if (!value) {
    throw new Error('useHostSyncedStorage must be used within HostSyncedStateProvider');
  }
  return value;
}
