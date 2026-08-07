import type { HostAppAPI } from '@cognite/app-sdk';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';


import {
  parseHostSyncedState,
  type AppView,
  type HostSyncedState,
  type TaskResultPeriodPreset,
} from '../contracts';

export type HostSyncedApi = Pick<HostAppAPI, 'syncInternalState'>;

export type HostSyncedStorage = HostSyncedState & {
  setSearchQuery: (searchQuery: string) => void;
  setSelectedChecklistId: (selectedChecklistId: string | null) => void;
  setActiveView: (activeView: AppView) => void;
  setPeriodPreset: (periodPreset: TaskResultPeriodPreset) => void;
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

  const pushState = useCallback(
    (next: HostSyncedState) => {
      void api?.syncInternalState(JSON.stringify(next));
      return next;
    },
    [api]
  );

  const setSearchQuery = useCallback(
    (searchQuery: string) => {
      setState((previous) => pushState({ ...previous, searchQuery }));
    },
    [pushState]
  );

  const setSelectedChecklistId = useCallback(
    (selectedChecklistId: string | null) => {
      setState((previous) => pushState({ ...previous, selectedChecklistId }));
    },
    [pushState]
  );

  const setActiveView = useCallback(
    (activeView: AppView) => {
      setState((previous) => pushState({ ...previous, activeView }));
    },
    [pushState]
  );

  const setPeriodPreset = useCallback(
    (periodPreset: TaskResultPeriodPreset) => {
      setState((previous) => pushState({ ...previous, periodPreset }));
    },
    [pushState]
  );

  const value = useMemo<HostSyncedStorage>(
    () => ({
      searchQuery: state.searchQuery,
      selectedChecklistId: state.selectedChecklistId,
      activeView: state.activeView,
      periodPreset: state.periodPreset,
      readNotificationIds: state.readNotificationIds,
      setSearchQuery,
      setSelectedChecklistId,
      setActiveView,
      setPeriodPreset,
    }),
    [
      setSearchQuery,
      setSelectedChecklistId,
      setActiveView,
      setPeriodPreset,
      state.searchQuery,
      state.selectedChecklistId,
      state.activeView,
      state.periodPreset,
      state.readNotificationIds,
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
