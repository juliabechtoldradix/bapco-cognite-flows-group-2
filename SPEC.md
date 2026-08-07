
# Feature Specification: Checklist KPIs + Overview

## User Scenarios & Testing

### Context

Operations supervisors in the control room or office review plant checklist tasks before shift handovers. Today they jump between multiple tools to find failed (**Not OK**) or **Overdue** items, so reviews are slow and critical issues are easy to miss. This Flows custom app gives a single Fusion-hosted overview with status KPIs, search, and a quick view of checklist results. Users authenticate via Fusion and work in one CDF project that holds the checklist data.

### User Stories

1. As an operations supervisor, I want to see checklist counts by status (To Do, Ongoing, Done, Overdue) and how many checklists have Not OK results, so that I can assess plant readiness before handover at a glance.
2. As an operations supervisor, I want to search for any checklist on the overview page, so that I can find a specific checklist without switching tools.
3. As an operations supervisor, I want a quick view of a checklist’s results, so that I can inspect outcomes without leaving the overview.
4. As an operations supervisor, I want my search query and selected checklist restored after reload or from a shared link, so that I can resume the same review context.

### Acceptance Scenarios

- Given the app is connected to a CDF project with APM App Data checklists, when the overview loads successfully, then the app shows KPI counts for To Do, Ongoing, Done, Overdue, and checklists with Not OK results.
- Given checklists are available, when the user types a search query on the overview, then the list narrows to checklists matching the query.
- Given search results are shown, when the user clears the search, then the unfiltered checklist list (first page / default set) is shown again.
- Given a checklist is listed, when the user opens it, then a quick view shows that checklist’s results.
- Given a search query and/or selected checklist are set, when the page is reloaded (or a shared URL with internal state is opened), then the same search query and selected checklist are restored and the UI reflects them.
- Given the checklists or KPI request fails, when the overview renders, then an error alert is shown and stale success data is not silently presented as current.
- Given the search returns no matches, when the request succeeds, then an empty state explains that no checklists matched.
- Given checklists are loading, when the overview is shown, then a loading state is visible until data arrives or an error is shown.

## Requirements

### Functional Requirements

- FR-001: System MUST read checklist (and related task/result) instances from the Cognite APM App Data model `cdf_apm.ApmAppData:v13` in the configured training instance space.
- FR-002: System MUST display KPI counts for checklists in statuses To Do, Ongoing, Done, and Overdue, plus a count of checklists with Not OK results.
- FR-003: System MUST provide an overview page where the user can search for checklists.
- FR-004: System MUST provide a quick view of results for a selected checklist from the overview.
- FR-005: System MUST host-sync the overview search query and selected checklist id via `syncInternalState` / `initialState` so reloads and shared links restore them.
- FR-006: System MUST show loading, error, and empty states for KPIs, checklist search/list, and the quick view.
- FR-007: System MUST present the UI using Aura primitives and International Paper brand tokens from `DESIGN.md`.

## Success Criteria

- SC-001: Supervisors can open the Fusion-hosted app and see checklist status KPIs without leaving the app shell.
- SC-002: Searching for a checklist updates the overview list in a way that feels responsive (short debounce on free-text search).
- SC-003: Opening a checklist from the overview shows a quick view of its results.
- SC-004: Reloading the page (or opening a shared URL) restores the search query and selected checklist and the UI matches that state.

## Clarifications

- **In scope (v1):** Checklist KPIs by status / Not OK, overview search, and quick view of checklist results.
- **In scope (v2):** Task Result Dashboard — OK vs Not OK outcome breakdown and time-series KPIs over a defined period (see [v2](#v2-task-result-dashboard) below). Parallel delivery plan: [`dev-tasks/v2/`](./dev-tasks/v2/).
- **In scope (v3):** In-app Alerts and Notifications — bell control + popup feed derived from existing checklist/result reads (see [v3](#v3-alerts-and-notifications) below).
- **Out of scope (v3):** Sending real external notifications (email, SMS, push, Fusion agent messages); CDF data-model changes or new views/spaces for notification storage; full admin UX for customizable recipients / triggers / formats (product ideal for a later release — v3 may surface fixed trigger types in the UI only).
- Cognite Core Assets listing (`cdf_cdm.CogniteAsset`) from the previous SPEC is not part of this feature.
- Exact APM property/view names for status and Not OK are defined when the `ApmAppData` v13 model is inspected at implementation time; product behavior uses the status labels above.
- `{group_number}` in the instance space is an app configuration constant (training group), not user-editable UI.

## Assumptions

- The target CDF project has APM App Data (`cdf_apm` / `ApmAppData` v13) provisioned with checklist instances in the group instance space.
- Auth and project context come from the Fusion host via `@cognite/app-sdk`.
- Product typography remains Aura Inter; brand color overrides follow `DESIGN.md`.
- Primary use is desktop (control room / office).

---

## v2: Task Result Dashboard

Planned follow-on from the Use Case Activity brief (Foundations & project setup). Builds on v1 checklist overview data; does not replace the v1 overview.

### Context

Supervisors need more than a single checklist quick view: they need to see how task outcomes (OK vs Not OK) distribute across routes/plant areas and how those outcomes trend over a chosen time window (shift, day, week).

### User Stories

1. As an operations supervisor, I want a dashboard that breaks down task results by OK vs Not OK, so that I can spot problem areas without opening each checklist.
2. As an operations supervisor, I want time-series KPIs for task results over a defined period, so that I can see whether Not OK rates are improving or worsening.

### Acceptance Scenarios

- Given checklist task results exist in the project, when the user opens the Task Result Dashboard, then the app shows an OK vs Not OK breakdown of task outcomes.
- Given a time period is selected (or a default period is applied), when the dashboard loads, then time-series KPIs for task results cover that period.
- Given the dashboard data request fails, when the view renders, then an error alert is shown and stale success data is not silently presented as current.
- Given there are no task results for the selected period, when the request succeeds, then an empty state explains that no results are available.

### Functional Requirements

- FR-V2-001: System MUST provide a Task Result Dashboard that categorizes task results by OK vs Not OK outcomes.
- FR-V2-002: System MUST support time-series KPIs for task results over a user-selectable (or default) defined period.
- FR-V2-003: System MUST host-sync dashboard filters that affect what the user sees (e.g. selected period) via `syncInternalState` / `initialState`.
- FR-V2-004: System MUST show loading, error, and empty states for the dashboard.
- FR-V2-005: System MUST continue to read task/result instances from `cdf_apm.ApmAppData:v13` (no new views required unless aggregation cannot be done client-side / via existing queries).

### Success Criteria

- SC-V2-001: Supervisors can open the Task Result Dashboard and see an OK vs Not OK breakdown without leaving the Fusion-hosted app.
- SC-V2-002: Supervisors can review task-result trends over a defined period from the same dashboard.

### Clarifications (v2)

- Outcome categories align with v1 result semantics (`OK` / `Not OK` and related mapped statuses).
- Exact period presets (e.g. last shift / 24h / 7d) and chart presentation are decided at implementation planning; product intent is historical trend of task outcomes, not checklist-level status KPIs alone.
- Alerts and notifications remain out of scope for v2 (delivered in v3 as in-app UI only).

---

## v3: Alerts and Notifications

Planned follow-on from the Use Case Activity brief (Foundations & project setup) — **Alerts and Notifications**. Builds on v1/v2 checklist reads; does not replace overview or the Task Result Dashboard.

### Context

Supervisors want timely awareness when checklists receive **Not OK** results or are **completed**, without leaving the app. The Use Case Activity ideal includes configurable recipients, triggers, and formats; **v3 delivers the in-app notification experience only** — no outbound delivery and no CDF schema changes.

### User Stories

1. As an operations supervisor, I want a bell control in the app chrome, so that I can open my notification list without leaving the current view.
2. As an operations supervisor, I want to see in-app notifications when a checklist has a Not OK result or is completed, so that I can prioritize follow-up before handover.
3. As an operations supervisor, I want the notification popup to show a clear empty or loading state when there is nothing to show or data is still loading, so that I know the feed is working.

### Acceptance Scenarios

- Given the app shell is shown, when the user views the header/chrome, then a bell (notification) button is visible.
- Given the user clicks the bell button, when the popup opens, then a list of in-app notifications is shown (or an empty state if none apply).
- Given checklists with Not OK results exist (from existing APM reads), when notifications are derived, then the feed includes items reflecting Not OK checklist activity.
- Given checklists in Done / completed status exist, when notifications are derived, then the feed includes items reflecting checklist completion.
- Given the user clicks the bell again (or dismisses the popup), when the popup closes, then the previous page view remains unchanged.
- Given notification data is loading or fails to load, when the popup is open, then a loading or error state is shown (no silent blank failure).

### Functional Requirements

- FR-V3-001: System MUST provide a bell icon button in the app UI that opens a popup (popover/panel) listing in-app notifications.
- FR-V3-002: System MUST derive notification items from **existing** checklist/result reads already used by v1/v2 (e.g. Not OK presence, Done/completed status) — **no new CDF views, spaces, or data-model changes**.
- FR-V3-003: System MUST support at least these fixed trigger types in the feed: checklist has a Not OK result; checklist is completed (Done).
- FR-V3-004: System MUST NOT send external notifications (email, SMS, push, webhooks, Fusion agent messages, or similar) in v3.
- FR-V3-005: System MUST show loading, error, and empty states for the notification popup.
- FR-V3-006: System MUST present the bell + popup using Aura primitives and International Paper brand tokens from `DESIGN.md`.
- FR-V3-007: If popup open/closed or “read” markers affect what the user expects after reload/share, that state MUST be host-synced via `syncInternalState` / `initialState`; purely transient open/close may stay local.

### Success Criteria

- SC-V3-001: Supervisors can open the notification popup from a bell control without leaving the Fusion-hosted app.
- SC-V3-002: The popup surfaces Not OK and completed-checklist style notifications derived from current APM data (or a documented fixture/synthetic feed for demos when live data is empty).
- SC-V3-003: No external notification is sent as part of v3 behavior.

### Clarifications (v3)

- **No data-model changes:** do not add notification/alert views, edges, or instance types; do not write notification instances to CDF for v3.
- **No real outbound delivery:** the “automated notifications” capability from the Use Case Activity brief is represented **in-app only** (bell + popup). Customizable recipients, triggers, and formats remain a later product step.
- Notification copy and ranking (e.g. newest first, cap on list length) are decided at implementation; trigger semantics must stay aligned with v1 status / Not OK mapping.
- Selecting a notification may optionally navigate or select the related checklist in the overview (nice-to-have); not required for v3 MVP if the feed is read-only.

---

## Data Models & CDF Integration *(mandatory)*

### Existing views

- `cdf_apm.ApmAppData:v13` — APM App Data model used for plant checklists, tasks, and results (status KPIs, search, and quick view of results).
  - `Checklist/v7` — checklist title/status/`endTime` (Overdue when due date is past and status ≠ Done); search on title/description/labels; **v3** completion notifications derived from Done/completed status.
  - `ChecklistItem/v7` — result rows + Not OK KPI (`status` values such as `OK` / `Not OK`), linked via edge `cdf_apm:referenceChecklistItems`; **v3** Not OK notifications derived from existing Not OK signals (same reads as v1 KPIs / results).
  - `MeasurementReading/v4` — optional numeric readings linked via `cdf_apm:referenceMeasurements`.
  - Status mapping (InField → UI): `Ready`→To Do, `In progress`/`Ongoing`→Ongoing, `Done`→Done; Overdue derived from `endTime`.

### New views

- None. **v3 must not introduce new views** (notifications are client-side / in-app only).

### Spaces

- `cdf_apm` — APM App Data view/model space (read).
- Instance space — `bapco-flows-training-group-{group_number}` (read; `{group_number}` is the app’s configured training group id).
- **v3:** no additional spaces for alerts/notifications.
