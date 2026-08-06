import { useHostSyncedStorage } from '../state/HostSyncedState';

export type ChecklistPageViewModel = {
  searchQuery: string;
  selectedChecklistId: string | null;
  onSearchChange: (query: string) => void;
  onSelectChecklist: (id: string) => void;
};

export function useChecklistPageViewModel(): ChecklistPageViewModel {
  const storage = useHostSyncedStorage();

  return {
    searchQuery: storage.searchQuery,
    selectedChecklistId: storage.selectedChecklistId,
    onSearchChange: storage.setSearchQuery,
    onSelectChecklist: storage.setSelectedChecklistId,
  };
}
