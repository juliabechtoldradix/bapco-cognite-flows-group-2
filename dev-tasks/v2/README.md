# Dev tasks — v2 Task Result Dashboard

Parallel tracks for SPEC § **v2: Task Result Dashboard** (OK vs Not OK breakdown + time-series KPIs over a period).

**Status: Done** — Day-0 + A/B/C merged to `main` (PRs #4–#6). Join checklist: [join-final.md](./join-final.md).

## Merge / branch order (historical)

```text
0) Day-0  →  DONE on main (contracts + stubs)
      │
      ├─► Dev A  feat/task-result-data              → PR #4
      ├─► Dev B  feat/task-result-dashboard-ui      → PR #5
      │
      └─► Dev C  feat/task-result-shell             → PR #6 (after A+B)
Join / smoke on main after C lands                 → join-final
```

| Step | Branch | Owner | Task file | Merge when |
| --- | --- | --- | --- | --- |
| 0 | ~~`feat/task-result-day0`~~ | lead | [day-0-contracts.md](./day-0-contracts.md) | **Done** on `main` |
| A | `feat/task-result-data` | Dev A | [dev-a-task-result-data.md](./dev-a-task-result-data.md) | **Done** (PR #4) |
| B | `feat/task-result-dashboard-ui` | Dev B | [dev-b-task-result-dashboard-ui.md](./dev-b-task-result-dashboard-ui.md) | **Done** (PR #5) |
| C | `feat/task-result-shell` | Dev C | [dev-c-task-result-shell.md](./dev-c-task-result-shell.md) | **Done** (PR #6) |
| Join | — | lead / any | [join-final.md](./join-final.md) | **Done** |

### Why this avoided merge conflicts

| Area | Owner only |
| --- | --- |
| `src/checklist/contracts.ts` (+ `contracts.test.ts`) | **Day-0** |
| `src/checklist/data/**` | **Dev A** |
| `src/checklist/dashboard/**` | Day-0 stubs → **Dev B** |
| `src/checklist/shell/**`, `src/checklist/state/**`, `src/App.tsx` | **Dev C** |
| `src/checklist/overview/**`, `src/checklist/quickview/**` | **Nobody** (v1) |
