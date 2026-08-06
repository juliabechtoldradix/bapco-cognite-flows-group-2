# Day-0 — v2 contracts + stubs

**Branch:** `feat/task-result-day0`  
**Base:** `main` (current v1 complete)  
**Merge:** **FIRST** into `main` before A/B/C start their branches.

## Paths owned (only)

- `src/checklist/contracts.ts`
- `src/checklist/contracts.test.ts`
- `src/checklist/dashboard/**` *(stubs only — B replaces)*
- Minimal TypeScript compile fixes so `ChecklistService` implementers build:
  - `src/checklist/data/ChecklistService.ts` (Fixture: return synthetic dashboard data)
  - `src/checklist/data/CdfChecklistService.ts` (temporary stub: empty/zero dashboard or clear `Not implemented` until A lands)
  - Any test that constructs a partial `ChecklistService` mock (add `getTaskResultDashboard`)

**Do not:** build real CDF aggregation, real charts, or shell navigation (A/B/C).

---

## Contract freeze (must land here)

### Types (names may match exactly)

```ts
export type AppView = 'overview' | 'dashboard';

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
```

### Extend `HostSyncedState`

```ts
export type HostSyncedState = {
  searchQuery: string;
  selectedChecklistId: string | null;
  activeView: AppView;
  periodPreset: TaskResultPeriodPreset;
};
```

Defaults: `activeView: 'overview'`, `periodPreset: '7d'`.  
Update `isHostSyncedState` / `parseHostSyncedState` / `DEFAULT_HOST_SYNCED_STATE` + tests.  
**Backward compatible:** missing fields in old URLs → defaults (do not hard-fail).

### Extend `ChecklistService`

```ts
getTaskResultDashboard(period: TaskResultPeriodPreset): Promise<TaskResultDashboardData>;
```

### Dashboard stub export

`src/checklist/dashboard/index.ts` exports:

- `TaskResultDashboardPanel` with a stable props API, e.g.:

```ts
export type TaskResultDashboardPanelProps = {
  periodPreset: TaskResultPeriodPreset;
  onPeriodChange: (period: TaskResultPeriodPreset) => void;
};
```

Stub UI: Aura `EmptyState` or “Dashboard stub — Dev B” is fine. Props signature **must not change** after Day-0 (B extends internals only).

### Fixture / CDF compile stubs

- **Fixture:** return deterministic fake breakdown + short series (so B can UI-test without CDF).
- **Cdf:** return zeros / empty series **or** throw a clear error — A replaces with real queries. Prefer zeros so shell smoke tests do not explode before A merges.

---

## Tasks

- [ ] Add types + host-state fields + `getTaskResultDashboard` to `contracts.ts` / tests.
- [ ] Create `src/checklist/dashboard/` stub panel + barrel `index.ts`.
- [ ] Update Fixture + Cdf (+ mocks in tests) so `tsc` / `vitest` stay green.
- [ ] Open PR → `main`. **Do not start A/B/C branches until this merges.**

## Cursor prompt sugerido

> Implement Day-0 for v2 Task Result Dashboard: freeze contracts (period preset, breakdown, time series, host `activeView` + `periodPreset`), stub `TaskResultDashboardPanel`, and keep Fixture/Cdf compiling with `getTaskResultDashboard`. No real CDF aggregation, no shell nav, no charts.
