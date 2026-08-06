# Join / final integration — v2 Task Result Dashboard

Run **after** Day-0, A, B, and C are on `main`.

## Commit / PR order (recap)

| Order | Branch | What lands |
| --- | --- | --- |
| 1 | `feat/task-result-day0` | Contracts + stubs |
| 2a | `feat/task-result-data` | CDF + Fixture aggregation (parallel with 2b) |
| 2b | `feat/task-result-dashboard-ui` | Dashboard UI (parallel with 2a) |
| 3 | `feat/task-result-shell` | Nav + host sync wiring |
| 4 | this checklist | Smoke / docs / checkbox cleanup |

If A and B both open PRs, either merge order is fine (disjoint paths). **C must rebase after both.**

## Integration checklist

- [ ] `npm test` / `npm run lint` / `npm run build` green on `main`.
- [ ] Overview (v1) still works: KPIs, search, quick view, host restore of search + selected id.
- [ ] Switch to Dashboard: OK vs Not OK breakdown visible (SC-V2-001).
- [ ] Change period (`24h` / `7d` / `30d`): series updates; URL/host state restores period + active view (FR-V2-003, SC-V2-002).
- [ ] Loading / error / empty states on dashboard (FR-V2-004).
- [ ] With seed data (`npm run seed:oec`): dashboard not stuck at all zeros if items exist in the period window (or document if timestamps make training data fall outside the window).
- [ ] Update this folder’s task checkboxes / mark v2 status in [README.md](./README.md) when done.
- [ ] Optional: short note in `docs/cdf-seed-verification.md` for dashboard smoke.

## Conflict triage (if something still clashes)

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| TS: `ChecklistService` missing method | Branch not based on Day-0 | Rebase on `main` after Day-0 |
| Conflict in `contracts.ts` | Someone edited outside Day-0 | Revert local contract edits; extend via small Day-0 follow-up PR |
| Conflict in `ChecklistPage.tsx` | A/B touched shell | Keep C’s wiring; import only B’s panel + A’s service via existing DI |
| Conflict in `dashboard/index.ts` | Day-0 vs B | Prefer B’s implementation; keep Day-0 prop names |

## Out of scope (do not sneak into join)

- Alerts / notifications (SPEC out of scope for v1/v2).
- New CDF views (unless A proved aggregation impossible — then open a SPEC clarification first).
