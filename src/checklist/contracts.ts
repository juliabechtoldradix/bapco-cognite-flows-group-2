/**
 * Shared Day-0 contract for Checklist KPIs + Overview.
 * Dev A owns updates when ApmAppData property names require changes.
 */

export type ChecklistStatus = 'ToDo' | 'Ongoing' | 'Done' | 'Overdue';

export type RouteKey = 'route1' | 'route2' | 'route3' | 'route4';

export type ChecklistSummary = {
  id: string;
  name: string;
  status: ChecklistStatus;
  hasNotOk: boolean;
  routeKey?: RouteKey;
};

export type ChecklistKpis = {
  toDo: number;
  ongoing: number;
  done: number;
  overdue: number;
  withNotOk: number;
};

export type ChecklistResultOutcome = 'OK' | 'NotOK' | 'Yes' | 'No' | 'Blocked' | 'Unset';

export type ChecklistResultRow = {
  id: string;
  label: string;
  section?: string;
  equipment?: string;
  assetExternalId?: string;
  outcome: ChecklistResultOutcome;
  reading?: { value: number; unit: string; threshold?: string };
};

export type HostSyncedState = {
  searchQuery: string;
  selectedChecklistId: string | null;
};

export const DEFAULT_HOST_SYNCED_STATE: HostSyncedState = {
  searchQuery: '',
  selectedChecklistId: null,
};

/** Training instance space (group 2). */
export const INSTANCE_SPACE = 'bapco-flows-training-group-2';

/** ApmAppData model coordinates — confirm property names at implementation time. */
export const APM_APP_DATA = {
  space: 'cdf_apm',
  externalId: 'ApmAppData',
  version: 'v13',
} as const;

export interface ChecklistService {
  getKpis(): Promise<ChecklistKpis>;
  searchChecklists(query: string): Promise<ChecklistSummary[]>;
  getResults(checklistId: string): Promise<ChecklistResultRow[]>;
}

export function isChecklistStatus(value: unknown): value is ChecklistStatus {
  return value === 'ToDo' || value === 'Ongoing' || value === 'Done' || value === 'Overdue';
}

export function isHostSyncedState(value: unknown): value is HostSyncedState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  if (!('searchQuery' in value) || !('selectedChecklistId' in value)) {
    return false;
  }
  const candidate = value as { searchQuery: unknown; selectedChecklistId: unknown };
  const selectedOk =
    candidate.selectedChecklistId === null || typeof candidate.selectedChecklistId === 'string';
  return typeof candidate.searchQuery === 'string' && selectedOk;
}

export function parseHostSyncedState(raw: string | undefined): HostSyncedState {
  if (!raw) {
    return { ...DEFAULT_HOST_SYNCED_STATE };
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isHostSyncedState(parsed)) {
      return parsed;
    }
  } catch {
    // ignore malformed host state
  }
  return { ...DEFAULT_HOST_SYNCED_STATE };
}
