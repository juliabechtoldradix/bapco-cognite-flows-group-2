
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
- **Out of scope (v1):** Task Result Dashboard (OK vs Not OK time-series KPIs over a defined period); automated or configurable alerts/notifications (e.g. on Not OK or checklist completed).
- Cognite Core Assets listing (`cdf_cdm.CogniteAsset`) from the previous SPEC is not part of this feature.
- Exact APM property/view names for status and Not OK are defined when the `ApmAppData` v13 model is inspected at implementation time; product behavior uses the status labels above.
- `{group_number}` in the instance space is an app configuration constant (training group), not user-editable UI.

## Assumptions

- The target CDF project has APM App Data (`cdf_apm` / `ApmAppData` v13) provisioned with checklist instances in the group instance space.
- Auth and project context come from the Fusion host via `@cognite/app-sdk`.
- Product typography remains Aura Inter; brand color overrides follow `DESIGN.md`.
- Primary use is desktop (control room / office).

---

## Data Models & CDF Integration *(mandatory)*

### Existing views

- `cdf_apm.ApmAppData:v13` — APM App Data model used for plant checklists, tasks, and results (status KPIs, search, and quick view of results).
  - `Checklist/v7` — checklist title/status/`endTime` (Overdue when due date is past and status ≠ Done); search on title/description/labels.
  - `ChecklistItem/v7` — result rows + Not OK KPI (`status` values such as `OK` / `Not OK`), linked via edge `cdf_apm:referenceChecklistItems`.
  - `MeasurementReading/v4` — optional numeric readings linked via `cdf_apm:referenceMeasurements`.
  - Status mapping (InField → UI): `Ready`→To Do, `In progress`/`Ongoing`→Ongoing, `Done`→Done; Overdue derived from `endTime`.

### New views

- None.

### Spaces

- `cdf_apm` — APM App Data view/model space (read).
- Instance space — `bapco-flows-training-group-{group_number}` (read; `{group_number}` is the app’s configured training group id).
