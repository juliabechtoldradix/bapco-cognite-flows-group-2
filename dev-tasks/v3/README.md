# Dev tasks — v3 Alerts and Notifications

Parallel tracks for SPEC § **v3: Alerts and Notifications** (in-app bell + popup feed derived from existing checklist/result reads).

**Status: Done** — Day-0 + A/B/C merged to `main` (PRs #7–#9). Join checklist: [join-final.md](./join-final.md).

## Merge / branch order (historical)

```text
0) Day-0  →  DONE on main (contracts + stubs)
      │
      ├─► Dev A  feat/alerts-data              → PR #7
      ├─► Dev B  feat/alerts-notifications-ui  → PR #8
      │
      └─► Dev C  feat/alerts-shell             → PR #9 (after A+B)
Join / smoke on main after C lands                 → join-final
```

| Step | Branch | Owner | Task file | Merge when |
| --- | --- | --- | --- | --- |
| 0 | ~~`feat/alerts-day0`~~ | lead | [day-0-contracts.md](./day-0-contracts.md) | **Done** on `main` |
| A | `feat/alerts-data` | Dev A | [dev-a-alerts-data.md](./dev-a-alerts-data.md) | **Done** (PR #7) |
| B | `feat/alerts-notifications-ui` | Dev B | [dev-b-alerts-notifications-ui.md](./dev-b-alerts-notifications-ui.md) | **Done** (PR #8) |
| C | `feat/alerts-shell` | Dev C | [dev-c-alerts-shell.md](./dev-c-alerts-shell.md) | **Done** (PR #9) |
| Join | — | lead / any | [join-final.md](./join-final.md) | **Done** |

### Why this avoided merge conflicts

| Area | Owner only |
| --- | --- |
| `src/checklist/contracts.ts` (+ `contracts.test.ts`) | **Day-0** |
| `src/checklist/data/**` | **Dev A** |
| `src/checklist/notifications/**` | Day-0 stubs → **Dev B** |
| `src/checklist/shell/**`, `src/checklist/state/**`, `src/App.tsx` | **Dev C** |
| `src/checklist/overview/**`, `src/checklist/quickview/**`, `src/checklist/dashboard/**` | **Nobody** (v1/v2 — leave alone) |

### Out of scope (all tracks)

- External delivery (email, SMS, push, webhooks, Fusion agent messages) — FR-V3-004.
- New CDF views, spaces, or notification instance writes — FR-V3-002 / SPEC clarifications.
- Full admin UX for customizable recipients / triggers / formats.
