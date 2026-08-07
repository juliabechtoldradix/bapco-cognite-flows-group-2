# CDF seed verification (`radix-dev` / group 2)

Confirm ApmAppData checklist data exists before demoing the Fusion app.

## Target

| Setting | Value |
| --- | --- |
| Project | `radix-dev` (see `app.json` deployments) |
| Instance space | `bapco-flows-training-group-2` |
| Model | `cdf_apm` / `ApmAppData:v13` (views `Checklist/v7`, `ChecklistItem/v7`) |

## Steps

1. **Seed** (if the space is empty):

   ```bash
   npm run seed:oec
   ```

   Env vars: see [`scripts/README.md`](../scripts/README.md).

2. **In Fusion Data explorer** (or API), list instances in `bapco-flows-training-group-2` with view `Checklist/v7`. Expect four OEC routes (titles matching Route One…Four).

3. **In the Flows app** (hosted) — Overview (v1):

   - [ ] KPIs show non-zero counts when checklists exist (SC-001)
   - [ ] Search “Feed” narrows to Route Two (SC-002)
   - [ ] Selecting a checklist fills quick view with section/equipment rows (SC-003)
   - [ ] Reload / shared URL restores `searchQuery` + `selectedChecklistId` (SC-004)

4. **Task Result Dashboard** (v2) — switch to **Dashboard** in the app nav:

   - [ ] OK vs Not OK breakdown is visible (SC-V2-001)
   - [ ] Changing period (`24h` / `7d` / `30d`) updates the series; reload restores `activeView` + `periodPreset` (FR-V2-003, SC-V2-002)
   - [ ] Loading / error / empty states appear as expected (FR-V2-004)

5. **In-app notifications** (v3) — bell in the app chrome (Overview and Dashboard):

   - [ ] Bell is visible; opening the popup lists Not OK and/or completed items when data exists (SC-V3-001 / SC-V3-002)
   - [ ] Loading / error / empty states appear in the open popup as expected (FR-V3-005)
   - [ ] Marking an item read survives reload / shared URL via `readNotificationIds` (FR-V3-007)
   - [ ] No external notification is sent (FR-V3-004 / SC-V3-003) — feed is derived client-side from existing Checklist reads (see [`apm-property-map.md`](../src/checklist/data/apm-property-map.md))

6. **If KPIs stay at zero** after seed: check IdP credentials, space ACL, and that `CdfChecklistService` is running (no `checklistService` prop override in production).

7. **If the dashboard shows all zeros** but checklist items exist: period filtering uses ChecklistItem node `lastUpdatedTime` (fallback `createdTime`) in UTC — see [`src/checklist/data/apm-property-map.md`](../src/checklist/data/apm-property-map.md). Stale seed timestamps outside the selected window (`24h` / `7d` / `30d`) will correctly yield an empty breakdown; try `30d`, re-seed, or touch/update items so `lastUpdatedTime` falls in-window.

## Note

This checklist is a **manual** verification against the live project. Automated coverage of the wiring path lives in `src/checklist/shell/ChecklistPage.cdfWiring.test.tsx` and dashboard/shell/notifications tests under `src/checklist/dashboard/**`, `src/checklist/shell/**`, and `src/checklist/notifications/**`.
