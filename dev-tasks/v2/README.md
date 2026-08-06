# Dev tasks — v2 Task Result Dashboard

Parallel tracks for SPEC § **v2: Task Result Dashboard** (OK vs Not OK breakdown + time-series KPIs over a period).

## Merge / branch order (read this first)

```text
0) Day-0  →  DONE on main (contracts + stubs)
      │
      ├─► Dev A  feat/task-result-data
      ├─► Dev B  feat/task-result-dashboard-ui     (parallel with A)
      │
      └─► Dev C  feat/task-result-shell            (code in parallel OK;
                                                   merge AFTER A and B)
Join / smoke on main after C lands
```


| Step | Branch | Owner | Task file | Merge when |
| --- | --- | --- | --- | --- |
| 0 | ~~`feat/task-result-day0`~~ (done on `main`) | lead | [day-0-contracts.md](./day-0-contracts.md) | **Done** on `main` |
| A | `feat/task-result-data` | Dev A | [dev-a-task-result-data.md](./dev-a-task-result-data.md) | After Day-0; parallel with B |
| B | `feat/task-result-dashboard-ui` | Dev B | [dev-b-task-result-dashboard-ui.md](./dev-b-task-result-dashboard-ui.md) | After Day-0; parallel with A |
| C | `feat/task-result-shell` | Dev C | [dev-c-task-result-shell.md](./dev-c-task-result-shell.md) | **After A + B** on `main` |
| Join | — | lead / any | [join-final.md](./join-final.md) | After C |

### Why this avoids merge conflicts

| Area | Owner only |
| --- | --- |
| `src/checklist/contracts.ts` (+ `contracts.test.ts`) | **Day-0** (freeze interface; A/B/C do not edit) |
| `src/checklist/data/**` | **Dev A** |
| `src/checklist/dashboard/**` | Day-0 stubs → **Dev B** replaces |
| `src/checklist/shell/**`, `src/checklist/state/**`, `src/App.tsx` | **Dev C** |
| `src/checklist/overview/**`, `src/checklist/quickview/**` | **Nobody** (v1 — leave alone) |

Day-0 freezes `ChecklistService.getTaskResultDashboard(...)` and host-state fields so A/B/C compile against the same types without fighting over `contracts.ts`.

## Suggested Cursor prompt (any track)

> Read `dev-tasks/v2/README.md` and your track file. Own **only** the paths listed. Do not edit other tracks’ folders. Base branch: `main` after Day-0 is merged.
