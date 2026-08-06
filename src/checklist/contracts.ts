/**
 * Shared contracts for Checklist KPIs + Overview (v1) and Task Result Dashboard (v2 Day-0).
 * Day-0 freezes dashboard types / host fields; Dev A owns CDF aggregation later.
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

/** Host-synced app surface (v1 overview vs v2 dashboard). */
export type AppView = 'overview' | 'dashboard';

/** Time window for task-result dashboard KPIs. */
export type TaskResultPeriodPreset = '24h' | '7d' | '30d';

export type TaskOutcomeBreakdown = {
  ok: number;
  notOk: number;
  /** Yes/No/Blocked/Unset etc. — optional bucket for transparency */
  other: number;
};

export type TaskResultTimeSeriesPoint = {
  /** ISO date or period bucket start */
  at: string;
  ok: number;
  notOk: number;
};

export type TaskResultDashboardData = {
  period: TaskResultPeriodPreset;
  breakdown: TaskOutcomeBreakdown;
  series: TaskResultTimeSeriesPoint[];
};

export type HostSyncedState = {
  searchQuery: string;
  selectedChecklistId: string | null;
  activeView: AppView;
  periodPreset: TaskResultPeriodPreset;
};

export const DEFAULT_HOST_SYNCED_STATE: HostSyncedState = {
  searchQuery: '',
  selectedChecklistId: null,
  activeView: 'overview',
  periodPreset: '7d',
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
  getTaskResultDashboard(period: TaskResultPeriodPreset): Promise<TaskResultDashboardData>;
}

export function isChecklistStatus(value: unknown): value is ChecklistStatus {
  return value === 'ToDo' || value === 'Ongoing' || value === 'Done' || value === 'Overdue';
}

export function isAppView(value: unknown): value is AppView {
  return value === 'overview' || value === 'dashboard';
}

export function isTaskResultPeriodPreset(value: unknown): value is TaskResultPeriodPreset {
  return value === '24h' || value === '7d' || value === '30d';
}

/**
 * Full host-synced state (all v2 fields present and valid).
 * Prefer {@link parseHostSyncedState} for URL restore — it accepts legacy v1 payloads.
 */
export function isHostSyncedState(value: unknown): value is HostSyncedState {
  if (!isHostSyncedCore(value)) {
    return false;
  }
  return isAppView(value.activeView) && isTaskResultPeriodPreset(value.periodPreset);
}

export function parseHostSyncedState(raw: string | undefined): HostSyncedState {
  if (!raw) {
    return { ...DEFAULT_HOST_SYNCED_STATE };
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isHostSyncedCore(parsed)) {
      return { ...DEFAULT_HOST_SYNCED_STATE };
    }
    return {
      searchQuery: parsed.searchQuery,
      selectedChecklistId: parsed.selectedChecklistId,
      activeView: isAppView(parsed.activeView) ? parsed.activeView : DEFAULT_HOST_SYNCED_STATE.activeView,
      periodPreset: isTaskResultPeriodPreset(parsed.periodPreset)
        ? parsed.periodPreset
        : DEFAULT_HOST_SYNCED_STATE.periodPreset,
    };
  } catch {
    // ignore malformed host state
  }
  return { ...DEFAULT_HOST_SYNCED_STATE };
}

type HostSyncedCore = {
  searchQuery: string;
  selectedChecklistId: string | null;
  activeView?: unknown;
  periodPreset?: unknown;
};

function isHostSyncedCore(value: unknown): value is HostSyncedCore {
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
