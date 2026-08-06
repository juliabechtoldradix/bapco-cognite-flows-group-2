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

3. **In the Flows app** (hosted):

   - [ ] KPIs show non-zero counts when checklists exist (SC-001)
   - [ ] Search “Feed” narrows to Route Two (SC-002)
   - [ ] Selecting a checklist fills quick view with section/equipment rows (SC-003)
   - [ ] Reload / shared URL restores `searchQuery` + `selectedChecklistId` (SC-004)

4. **If KPIs stay at zero** after seed: check IdP credentials, space ACL, and that `CdfChecklistService` is running (no `checklistService` prop override in production).

## Note

This checklist is a **manual** verification against the live project. Automated coverage of the wiring path lives in `src/checklist/shell/ChecklistPage.cdfWiring.test.tsx`.
