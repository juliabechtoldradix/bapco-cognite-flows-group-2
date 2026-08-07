import type { AppView, TaskResultPeriodPreset } from '../contracts';
import { useHostSyncedStorage } from '../state/HostSyncedState';

export type ChecklistPageViewModel = {
  searchQuery: string;
  selectedChecklistId: string | null;
  activeView: AppView;
  periodPreset: TaskResultPeriodPreset;
  readNotificationIds: string[];
  onSearchChange: (query: string) => void;
  onSelectChecklist: (id: string) => void;
  onActiveViewChange: (view: AppView) => void;
  onPeriodChange: (period: TaskResultPeriodPreset) => void;
  onMarkNotificationRead: (notificationId: string) => void;
};

export function useChecklistPageViewModel(): ChecklistPageViewModel {
  const storage = useHostSyncedStorage();

  return {
    searchQuery: storage.searchQuery,
    selectedChecklistId: storage.selectedChecklistId,
    activeView: storage.activeView,
    periodPreset: storage.periodPreset,
    readNotificationIds: storage.readNotificationIds,
    onSearchChange: storage.setSearchQuery,
    onSelectChecklist: storage.setSelectedChecklistId,
    onActiveViewChange: storage.setActiveView,
    onPeriodChange: storage.setPeriodPreset,
    onMarkNotificationRead: storage.markNotificationRead,
  };
}
