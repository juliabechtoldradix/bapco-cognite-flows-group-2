# Day-0 — v3 contracts + stubs

**Branch:** `feat/alerts-day0`  
**Base:** `main` (current v2 complete)  
**Merge:** **FIRST** into `main` before A/B/C start their branches.  
**May be done directly on `main`** (same as v2 Day-0) if the lead prefers a single commit without a PR.

## Paths owned (only)

- `src/checklist/contracts.ts`
- `src/checklist/contracts.test.ts`
- `src/checklist/notifications/**` *(stubs only — B replaces)*
- Minimal TypeScript compile fixes so `ChecklistService` implementers build:
  - `src/checklist/data/ChecklistService.ts` (Fixture: return synthetic notifications)
  - `src/checklist/data/CdfChecklistService.ts` (temporary stub: empty list **or** clear `Not implemented` until A lands — prefer empty list so shell smoke tests stay green)
  - Any test that constructs a partial `ChecklistService` mock (add `listInAppNotifications`)

**Do not:** derive real Not OK / Done feeds, build the real bell popup UI, or mount the bell in the shell (A/B/C).

---

## Contract freeze (must land here)

### Types (names may match exactly)

```ts
export type InAppNotificationTrigger = 'notOk' | 'completed';

export type InAppNotification = {
  id: string;
  trigger: InAppNotificationTrigger;
  /** Human-readable title for the feed row */
  title: string;
  /** Optional secondary line (route name, timestamp hint, etc.) */
  body?: string;
  /** Related checklist id when known — enables optional navigate later */
  checklistId: string | null;
  /** ISO timestamp used for ranking (newest first) */
  createdAt: string;
};
```

### Extend `HostSyncedState`

```ts
export type HostSyncedState = {
  searchQuery: string;
  selectedChecklistId: string | null;
  activeView: AppView;
  periodPreset: TaskResultPeriodPreset;
  /** Ids marked read in the in-app feed (FR-V3-007). */
  readNotificationIds: string[];
};
```

Defaults: `readNotificationIds: []`.  
Update `isHostSyncedState` / `parseHostSyncedState` / `DEFAULT_HOST_SYNCED_STATE` + tests.  
**Backward compatible:** missing `readNotificationIds` in old URLs → `[]` (do not hard-fail).

> Popup open/closed is **local-only** (transient) — do **not** put `notificationsOpen` in host state.

### Extend `ChecklistService`

```ts
listInAppNotifications(): Promise<InAppNotification[]>;
```

Semantics (product, frozen for A):

- Return items for fixed triggers only: `notOk`, `completed` (FR-V3-003).
- Derive from **existing** APM checklist/result reads — no new views (FR-V3-002).
- Newest first; Day-0 does not require a hard cap (A/B may document a reasonable cap, e.g. 50).
- Must **not** send any external notification (FR-V3-004).

### Notifications stub export

`src/checklist/notifications/index.ts` exports:

- `NotificationsBell` with a stable props API, e.g.:

```ts
export type NotificationsBellProps = {
  /** Host-synced ids already marked read */
  readNotificationIds: string[];
  onMarkRead: (notificationId: string) => void;
  /** Optional: when user selects a row (nice-to-have; may be unused in MVP) */
  onSelectNotification?: (notification: InAppNotification) => void;
};
```

Stub UI: Aura button labeled “Notifications stub — Dev B” or similar is fine. Props signature **must not change** after Day-0 (B extends internals only; optional props may be added compatibly).

### Fixture / CDF compile stubs

- **Fixture:** return a small deterministic list with at least one `notOk` and one `completed` item (so B can UI-test without CDF).
- **Cdf:** return `[]` until A lands (prefer empty over throw so shell smoke does not explode).

---

## Tasks

- [x] Add types + host-state field + `listInAppNotifications` to `contracts.ts` / tests.
- [x] Create `src/checklist/notifications/` stub bell + barrel `index.ts`.
- [x] Update Fixture + Cdf (+ mocks in tests) so `tsc` / `vitest` stay green.
- [x] Landed on `main` (Day-0 implemented directly). A/B/C may branch from updated `main`.

## Cursor prompt sugerido

> Implement Day-0 for v3 Alerts and Notifications: freeze contracts (`InAppNotification`, trigger types, host `readNotificationIds`, `listInAppNotifications`), stub `NotificationsBell`, and keep Fixture/Cdf compiling. No real derivation, no shell mount, no real popup UI.
